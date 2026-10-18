from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware
from django.contrib.auth import get_user_model
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication


class CSRFCheck(CsrfViewMiddleware):
    def _reject(self, request, reason):
        return reason


class CookieOrHeaderJWTAuthentication(JWTAuthentication):
    """
    Authenticates requests using either:
    1. Standard Authorization: Bearer <token> header, OR
    2. HttpOnly access token cookie (earlyjobs_access) with CSRF enforcement
       on state-changing requests.
    Also enforces that the authenticated user is active, email-verified, and
    admin-approved before granting access.
    """

    def get_user(self, validated_token):
        UserModel = get_user_model()
        try:
            user_id = validated_token[settings.SIMPLE_JWT.get('USER_ID_CLAIM', 'user_id')]
        except KeyError:
            raise exceptions.AuthenticationFailed('Token contained no user identifier.')
        try:
            user = UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found.')
        return user

    def enforce_csrf(self, request):
        if getattr(request, '_dont_enforce_csrf_checks', False):
            return
        check = CSRFCheck(lambda req: None)
        check.process_request(request)
        reason = check.process_view(request, None, (), {})
        if reason:
            raise exceptions.PermissionDenied(f'CSRF Failed: {reason}')

    def authenticate(self, request):
        header = self.get_header(request)
        using_cookie = False

        if header is not None:
            raw_token = self.get_raw_token(header)
        else:
            cookie_name = getattr(settings, 'AUTH_COOKIE_ACCESS_NAME', 'earlyjobs_access')
            raw_token = request.COOKIES.get(cookie_name)
            if raw_token:
                using_cookie = True

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        user = self.get_user(validated_token)

        if not user.is_active:
            raise exceptions.AuthenticationFailed('User account is inactive.', code='user_inactive')

        if not getattr(user, 'is_email_verified', False):
            raise exceptions.AuthenticationFailed(
                'Email address is not verified.', code='email_not_verified'
            )

        if not getattr(user, 'is_approved', False) or getattr(user, 'approval_status', '') != 'APPROVED':
            raise exceptions.AuthenticationFailed(
                'Account is pending administrator approval.', code='pending_approval'
            )

        if using_cookie and request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            self.enforce_csrf(request)

        return (user, validated_token)
