from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import User, UserInvitation
from .validators import validate_company_email, normalize_email_address


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'role',
            'is_email_verified',
            'approval_status',
            'is_approved',
            'is_active',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'email',
            'role',
            'is_email_verified',
            'approval_status',
            'is_approved',
            'is_active',
            'created_at',
        ]


class AdminUserSerializer(serializers.ModelSerializer):
    approved_by_email = serializers.EmailField(source='approved_by.email', read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'full_name',
            'role',
            'is_email_verified',
            'email_verified_at',
            'approval_status',
            'is_approved',
            'approved_by',
            'approved_by_email',
            'approved_at',
            'is_active',
            'is_staff',
            'is_superuser',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)
    email = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)
    confirm_password = serializers.CharField(max_length=128, write_only=True)

    def validate_email(self, value):
        normalized = validate_company_email(value)
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError('An account with this email address already exists.')
        return normalized

    def validate_full_name(self, value):
        trimmed = (value or '').strip()
        if not trimmed:
            raise serializers.ValidationError('Full name is required.')
        return trimmed

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if not password:
            raise serializers.ValidationError({'password': 'Password is required.'})

        if not confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Confirm password is required.'})

        if password != confirm_password:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        temp_user = User(email=attrs.get('email'), full_name=attrs.get('full_name'))
        try:
            validate_password(password, user=temp_user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})

        return attrs


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)

    def validate_email(self, value):
        return validate_company_email(value)

    def validate_password(self, value):
        if not value:
            raise serializers.ValidationError('Password is required.')
        return value


class InviteUserSerializer(serializers.Serializer):
    email = serializers.CharField(max_length=255)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default=User.ROLE_RECRUITER)

    def validate_email(self, value):
        return validate_company_email(value)
