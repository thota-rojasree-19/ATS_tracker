from rest_framework.permissions import BasePermission
from .validators import validate_company_email
from django.core.exceptions import ValidationError


class IsVerifiedAndApprovedUser(BasePermission):
    """
    Allows access only to authenticated users with a verified authorized
    company email address whose account has been approved by an administrator.
    """
    message = 'Access restricted to verified and approved team members.'

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if not user.is_active:
            self.message = 'Your account has been deactivated.'
            return False
        if not getattr(user, 'is_email_verified', False):
            self.message = 'Please verify your company email address first.'
            return False
        if not getattr(user, 'is_approved', False) or getattr(user, 'approval_status', '') != 'APPROVED':
            self.message = 'Your account is awaiting administrator approval.'
            return False
        try:
            validate_company_email(user.email)
        except ValidationError:
            self.message = 'Only authorized company accounts are allowed.'
            return False
        return True


class IsVerifiedAndApprovedAdmin(IsVerifiedAndApprovedUser):
    """
    Allows access only to verified, approved @earlyjobs.in Administrators.
    Recruiters are explicitly denied.
    """
    message = 'Administrator privileges are required to perform this action.'

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        user = request.user
        if getattr(user, 'role', None) == 'ADMIN' or getattr(user, 'is_superuser', False):
            return True
        self.message = 'Administrator privileges are required to perform this action.'
        return False
