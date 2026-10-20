import math
import secrets
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

from .models import EmailOTP, User, UserInvitation


class OTPRateLimitError(Exception):
    def __init__(self, message, retry_after=None, code='otp_rate_limited'):
        super().__init__(message)
        self.message = message
        self.retry_after = retry_after
        self.code = code


class OTPValidationError(Exception):
    def __init__(self, message, code='invalid_otp', remaining_attempts=None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.remaining_attempts = remaining_attempts


class EmailDeliveryError(Exception):
    def __init__(self, message="Email delivery service is currently unavailable. Please verify SMTP settings.", code='email_delivery_failed'):
        super().__init__(message)
        self.message = message
        self.code = code


def generate_otp_code() -> str:
    return f'{secrets.randbelow(1000000):06d}'


def check_smtp_configured() -> bool:
    backend = getattr(settings, 'EMAIL_BACKEND', '')
    if 'locmem' in backend or 'console' in backend or getattr(settings, 'TESTING', False):
        return True
    host = getattr(settings, 'EMAIL_HOST', '')
    user = getattr(settings, 'EMAIL_HOST_USER', '')
    password = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
    if not host or host == 'smtp.example.com' or not user or not password:
        return False
    return True


def send_otp_email(user: User, raw_code: str, expiry_minutes: int):
    if not check_smtp_configured():
        raise EmailDeliveryError(
            "Email delivery service is not configured. Missing valid SMTP credentials (EMAIL_HOST, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD) in backend environment.",
            code="smtp_not_configured"
        )

    subject = 'Your EarlyJobs.ai ATS Verification Code'
    message = (
        f"Hello {user.full_name},\n\n"
        f"Your verification code for EarlyJobs.ai ATS is: {raw_code}\n\n"
        f"This code will expire in {expiry_minutes} minutes.\n"
        f"If you did not request this verification code, please ignore this email.\n\n"
        f"— EarlyJobs.ai ATS Team"
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'EarlyJobs.ai ATS <no-reply@earlyjobs.in>')
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as exc:
        import logging
        logging.getLogger(__name__).error("Failed to send OTP email to %s: %s", user.email, str(exc))
        raise EmailDeliveryError(
            "Failed to deliver verification code email. Please verify SMTP credentials and domain sender authorization.",
            code="email_delivery_failed"
        )


def issue_email_otp(user: User, purpose: str = EmailOTP.PURPOSE_VERIFY_EMAIL, enforce_cooldown: bool = True) -> EmailOTP:
    now = timezone.now()
    cooldown_seconds = int(getattr(settings, 'OTP_RESEND_COOLDOWN_SECONDS', 60))
    max_sends_per_hour = int(getattr(settings, 'OTP_MAX_SENDS_PER_HOUR', 5))
    expiry_minutes = int(getattr(settings, 'OTP_EXPIRY_MINUTES', 10))
    max_attempts = int(getattr(settings, 'OTP_MAX_ATTEMPTS', 5))

    if enforce_cooldown and cooldown_seconds > 0:
        latest_otp = EmailOTP.objects.filter(email=user.email).order_by('-created_at').first()
        if latest_otp:
            elapsed = (now - latest_otp.created_at).total_seconds()
            if elapsed < cooldown_seconds:
                retry_after = max(1, math.ceil(cooldown_seconds - elapsed))
                raise OTPRateLimitError(
                    f'Please wait {retry_after} seconds before requesting another verification code.',
                    retry_after=retry_after,
                    code='otp_cooldown',
                )

    one_hour_ago = now - timedelta(hours=1)
    sends_last_hour = EmailOTP.objects.filter(
        email=user.email,
        created_at__gte=one_hour_ago,
    ).count()
    if sends_last_hour >= max_sends_per_hour:
        raise OTPRateLimitError(
            'Maximum OTP resend limit reached for this hour. Please try again later.',
            retry_after=3600,
            code='otp_hourly_limit',
        )

    # Invalidate any previously issued active OTPs for this user
    EmailOTP.objects.filter(user=user, is_used=False).update(is_used=True)

    raw_code = generate_otp_code()
    otp = EmailOTP(
        user=user,
        email=user.email,
        purpose=purpose,
        max_attempts=max_attempts,
        expires_at=now + timedelta(minutes=expiry_minutes),
    )
    otp.set_code(raw_code)
    otp.save()

    try:
        send_otp_email(user=user, raw_code=raw_code, expiry_minutes=expiry_minutes)
    except Exception:
        otp.is_used = True
        otp.save(update_fields=['is_used'])
        raise
    return otp


def verify_email_otp(user: User, submitted_code: str) -> EmailOTP:
    otp = EmailOTP.objects.filter(user=user).order_by('-created_at').first()
    if not otp:
        raise OTPValidationError(
            'No active verification code found. Please request a new code.',
            code='invalid_otp',
        )

    if otp.is_used:
        if otp.attempts >= otp.max_attempts:
            raise OTPValidationError(
                'Maximum verification attempts exceeded. Please request a new code.',
                code='otp_max_attempts',
                remaining_attempts=0,
            )
        raise OTPValidationError(
            'This verification code has already been used. Please request a new code.',
            code='otp_already_used',
        )

    if otp.is_expired:
        otp.is_used = True
        otp.save(update_fields=['is_used'])
        raise OTPValidationError(
            'Verification code has expired. Please request a new code.',
            code='otp_expired',
        )

    if otp.attempts >= otp.max_attempts:
        otp.is_used = True
        otp.save(update_fields=['is_used'])
        raise OTPValidationError(
            'Maximum verification attempts exceeded. Please request a new code.',
            code='otp_max_attempts',
            remaining_attempts=0,
        )

    is_match = otp.check_code(submitted_code)
    otp.attempts += 1

    if not is_match:
        if otp.attempts >= otp.max_attempts:
            otp.is_used = True
            otp.save(update_fields=['attempts', 'is_used'])
            raise OTPValidationError(
                'Maximum verification attempts exceeded. Please request a new code.',
                code='otp_max_attempts',
                remaining_attempts=0,
            )
        otp.save(update_fields=['attempts'])
        remaining = max(0, otp.max_attempts - otp.attempts)
        raise OTPValidationError(
            f'Invalid verification code. {remaining} attempt(s) remaining.',
            code='invalid_otp',
            remaining_attempts=remaining,
        )

    otp.is_used = True
    otp.save(update_fields=['attempts', 'is_used'])

    now = timezone.now()
    user.is_email_verified = True
    user.email_verified_at = now

    # Check if there is a valid pre-invitation for this company email
    invitation = UserInvitation.objects.filter(
        email=user.email,
        is_accepted=False,
        expires_at__gt=now,
    ).first()
    if invitation:
        invitation.is_accepted = True
        invitation.accepted_at = now
        invitation.save(update_fields=['is_accepted', 'accepted_at', 'updated_at'])
        user.approval_status = User.APPROVAL_APPROVED
        user.is_approved = True
        user.approved_at = now
        user.approved_by = invitation.invited_by
        user.role = invitation.role
        if invitation.role == User.ROLE_ADMIN:
            user.is_staff = True

    user.save()
    return otp
