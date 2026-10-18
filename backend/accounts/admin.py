from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import EmailOTP, User, UserInvitation


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ['-created_at']
    list_display = [
        'email',
        'full_name',
        'role',
        'is_email_verified',
        'approval_status',
        'is_active',
        'created_at',
    ]
    list_filter = ['role', 'is_email_verified', 'approval_status', 'is_active', 'is_staff']
    search_fields = ['email', 'full_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_login', 'email_verified_at', 'approved_at']

    fieldsets = (
        (None, {'fields': ('id', 'email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'role')}),
        (
            'Verification & Approval',
            {
                'fields': (
                    'is_email_verified',
                    'email_verified_at',
                    'approval_status',
                    'is_approved',
                    'approved_by',
                    'approved_at',
                )
            },
        ),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Timestamps', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': (
                    'email',
                    'full_name',
                    'role',
                    'password1',
                    'password2',
                    'is_email_verified',
                    'approval_status',
                    'is_approved',
                    'is_active',
                    'is_staff',
                ),
            },
        ),
    )


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ['email', 'purpose', 'attempts', 'max_attempts', 'is_used', 'expires_at', 'created_at']
    list_filter = ['purpose', 'is_used']
    search_fields = ['email']
    readonly_fields = ['id', 'user', 'email', 'purpose', 'attempts', 'max_attempts', 'is_used', 'expires_at', 'created_at']
    exclude = ['code_hash']


@admin.register(UserInvitation)
class UserInvitationAdmin(admin.ModelAdmin):
    list_display = ['email', 'role', 'invited_by', 'is_accepted', 'expires_at', 'created_at']
    list_filter = ['role', 'is_accepted']
    search_fields = ['email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'accepted_at']
