import uuid
from django.conf import settings
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import PermissionsMixin
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from .validators import normalize_email_address, validate_company_email


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('A valid company email address must be provided.')
        normalized_email = validate_company_email(email)
        full_name = (extra_fields.pop('full_name', '') or '').strip()
        if not full_name:
            full_name = normalized_email.split('@')[0].replace('.', ' ').title()

        user = self.model(
            email=normalized_email,
            full_name=full_name,
            **extra_fields,
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.full_clean()
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('role', User.ROLE_RECRUITER)
        extra_fields.setdefault('is_email_verified', False)
        extra_fields.setdefault('approval_status', User.APPROVAL_PENDING)
        extra_fields.setdefault('is_approved', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        if not password:
            raise ValueError('Superusers must have a password.')
        extra_fields['is_staff'] = True
        extra_fields['is_superuser'] = True
        extra_fields['is_active'] = True
        extra_fields['role'] = User.ROLE_ADMIN
        extra_fields['is_email_verified'] = True
        extra_fields['email_verified_at'] = timezone.now()
        extra_fields['approval_status'] = User.APPROVAL_APPROVED
        extra_fields['is_approved'] = True
        extra_fields['approved_at'] = timezone.now()
        return self._create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_ADMIN = 'ADMIN'
    ROLE_RECRUITER = 'RECRUITER'

    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_RECRUITER, 'Recruiter'),
    ]

    APPROVAL_PENDING = 'PENDING'
    APPROVAL_APPROVED = 'APPROVED'
    APPROVAL_REJECTED = 'REJECTED'

    APPROVAL_CHOICES = [
        (APPROVAL_PENDING, 'Pending Approval'),
        (APPROVAL_APPROVED, 'Approved'),
        (APPROVAL_REJECTED, 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(
        unique=True,
        max_length=255,
        validators=[validate_company_email],
    )
    full_name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_RECRUITER,
    )
    is_email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)

    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_CHOICES,
        default=APPROVAL_PENDING,
    )
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='approved_users',
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['approval_status']),
            models.Index(fields=['is_email_verified']),
        ]

    def clean_fields(self, exclude=None):
        if self.email is not None:
            self.email = normalize_email_address(self.email)
        if self.full_name is not None:
            self.full_name = self.full_name.strip()
        super().clean_fields(exclude=exclude)

    def clean(self):
        super().clean()
        if self.email:
            self.email = validate_company_email(self.email)
        if self.full_name is not None and not self.full_name.strip():
            raise ValidationError({'full_name': 'Full name is required.'})
        if self.approval_status == self.APPROVAL_APPROVED:
            self.is_approved = True
        elif self.is_approved and self.approval_status == self.APPROVAL_PENDING:
            self.approval_status = self.APPROVAL_APPROVED
        else:
            self.is_approved = False

        if self.is_superuser:
            self.role = self.ROLE_ADMIN
            self.is_staff = True

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    @property
    def is_admin_role(self) -> bool:
        return self.role == self.ROLE_ADMIN or self.is_superuser

    @property
    def can_access_ats(self) -> bool:
        return (
            bool(self.is_active)
            and bool(self.is_email_verified)
            and self.approval_status == self.APPROVAL_APPROVED
            and bool(self.is_approved)
        )

    def __str__(self):
        return f'{self.full_name} <{self.email}> ({self.role})'


class EmailOTP(models.Model):
    PURPOSE_VERIFY_EMAIL = 'VERIFY_EMAIL'
    PURPOSE_LOGIN = 'LOGIN'

    PURPOSE_CHOICES = [
        (PURPOSE_VERIFY_EMAIL, 'Verify Email'),
        (PURPOSE_LOGIN, 'Login'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='otps',
    )
    email = models.EmailField(max_length=255, db_index=True)
    purpose = models.CharField(
        max_length=30,
        choices=PURPOSE_CHOICES,
        default=PURPOSE_VERIFY_EMAIL,
    )
    code_hash = models.CharField(max_length=255)
    attempts = models.PositiveSmallIntegerField(default=0)
    max_attempts = models.PositiveSmallIntegerField(default=5)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    @property
    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at

    @property
    def has_attempts_remaining(self) -> bool:
        return self.attempts < self.max_attempts

    def set_code(self, raw_code: str):
        self.code_hash = make_password(str(raw_code).strip())

    def check_code(self, raw_code: str) -> bool:
        if not raw_code or not self.code_hash:
            return False
        return check_password(str(raw_code).strip(), self.code_hash)

    def __str__(self):
        return f'OTP for {self.email} ({self.purpose}) - used={self.is_used}'


class UserInvitation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(
        unique=True,
        max_length=255,
        validators=[validate_company_email],
    )
    role = models.CharField(
        max_length=20,
        choices=User.ROLE_CHOICES,
        default=User.ROLE_RECRUITER,
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='sent_invitations',
    )
    is_accepted = models.BooleanField(default=False)
    accepted_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def clean_fields(self, exclude=None):
        if self.email is not None:
            self.email = normalize_email_address(self.email)
        super().clean_fields(exclude=exclude)

    def clean(self):
        super().clean()
        if self.email:
            self.email = validate_company_email(self.email)

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    @property
    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at

    def __str__(self):
        return f'Invitation for {self.email} ({self.role})'

