from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, UserInvitation
from .permissions import IsVerifiedAndApprovedUser, IsVerifiedAndApprovedAdmin
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    InviteUserSerializer,
)
from .throttles import RegisterRateThrottle, LoginRateThrottle


def set_auth_cookies(response, access_token: str, refresh_token: str = None):
    cookie_cfg = getattr(settings, 'SIMPLE_JWT', {})
    access_name = cookie_cfg.get('AUTH_COOKIE', 'earlyjobs_access')
    refresh_name = cookie_cfg.get('AUTH_COOKIE_REFRESH', 'earlyjobs_refresh')
    secure = cookie_cfg.get('AUTH_COOKIE_SECURE', False)
    samesite = cookie_cfg.get('AUTH_COOKIE_SAMESITE', 'Lax')
    path = cookie_cfg.get('AUTH_COOKIE_PATH', '/')
    domain = cookie_cfg.get('AUTH_COOKIE_DOMAIN', None)

    access_lifetime = cookie_cfg.get('ACCESS_TOKEN_LIFETIME', timedelta(minutes=15))
    max_age_access = int(access_lifetime.total_seconds())

    response.set_cookie(
        access_name,
        access_token,
        max_age=max_age_access,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path=path,
        domain=domain,
    )

    if refresh_token:
        refresh_lifetime = cookie_cfg.get('REFRESH_TOKEN_LIFETIME', timedelta(days=7))
        max_age_refresh = int(refresh_lifetime.total_seconds())
        response.set_cookie(
            refresh_name,
            refresh_token,
            max_age=max_age_refresh,
            httponly=True,
            secure=secure,
            samesite=samesite,
            path=path,
            domain=domain,
        )


def clear_auth_cookies(response):
    cookie_cfg = getattr(settings, 'SIMPLE_JWT', {})
    access_name = cookie_cfg.get('AUTH_COOKIE', 'earlyjobs_access')
    refresh_name = cookie_cfg.get('AUTH_COOKIE_REFRESH', 'earlyjobs_refresh')
    path = cookie_cfg.get('AUTH_COOKIE_PATH', '/')
    domain = cookie_cfg.get('AUTH_COOKIE_DOMAIN', None)

    response.delete_cookie(access_name, path=path, domain=domain)
    response.delete_cookie(refresh_name, path=path, domain=domain)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [RegisterRateThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        full_name = serializer.validated_data['full_name']
        password = serializer.validated_data['password']

        now = timezone.now()
        invitation = UserInvitation.objects.filter(
            email=email,
            is_accepted=False,
            expires_at__gt=now,
        ).first()

        if invitation:
            role = invitation.role
            is_approved = True
            approval_status = User.APPROVAL_APPROVED
            approved_by = invitation.invited_by
            approved_at = now
            is_staff = (role == User.ROLE_ADMIN)
        else:
            role = User.ROLE_RECRUITER
            is_approved = False
            approval_status = User.APPROVAL_PENDING
            approved_by = None
            approved_at = None
            is_staff = False

        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            role=role,
            is_email_verified=True,
            email_verified_at=now,
            approval_status=approval_status,
            is_approved=is_approved,
            approved_by=approved_by,
            approved_at=approved_at,
            is_staff=is_staff,
        )

        if invitation:
            invitation.is_accepted = True
            invitation.accepted_at = now
            invitation.save(update_fields=['is_accepted', 'accepted_at', 'updated_at'])

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            res_data = {
                'message': 'Account registered and approved successfully.',
                'is_approved': True,
                'approval_status': user.approval_status,
                'access': access_token,
                'refresh': refresh_token,
                'user': UserSerializer(user).data,
            }
            res = Response(res_data, status=status.HTTP_201_CREATED)
            set_auth_cookies(res, access_token, refresh_token)
            return res

        return Response(
            {
                'message': 'Your account has been created and is awaiting administrator approval.',
                'is_approved': False,
                'approval_status': user.approval_status,
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or password.', 'code': 'invalid_credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {'error': 'Your account has been deactivated or disabled.', 'code': 'user_inactive'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not user.check_password(password):
            return Response(
                {'error': 'Invalid email or password.', 'code': 'invalid_credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Check approval
        if user.approval_status == User.APPROVAL_REJECTED:
            return Response(
                {
                    'error': 'Your account registration request has been rejected by an administrator.',
                    'code': 'account_rejected',
                    'approval_status': User.APPROVAL_REJECTED,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if not user.is_approved or user.approval_status != User.APPROVAL_APPROVED:
            return Response(
                {
                    'error': 'Your account has been created and is awaiting administrator approval.',
                    'code': 'pending_approval',
                    'approval_status': user.approval_status or User.APPROVAL_PENDING,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        res_data = {
            'message': 'Login successful.',
            'access': access_token,
            'refresh': refresh_token,
            'user': UserSerializer(user).data,
        }
        res = Response(res_data, status=status.HTTP_200_OK)
        set_auth_cookies(res, access_token, refresh_token)
        return res


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cookie_name = getattr(settings, 'SIMPLE_JWT', {}).get('AUTH_COOKIE_REFRESH', 'earlyjobs_refresh')
        raw_refresh = request.data.get('refresh') or request.COOKIES.get(cookie_name)

        if not raw_refresh:
            return Response(
                {'error': 'Refresh token is required.', 'code': 'missing_token'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(raw_refresh)
            access_token = str(refresh.access_token)

            data = {'access': access_token}
            new_refresh = None
            if getattr(settings, 'SIMPLE_JWT', {}).get('ROTATE_REFRESH_TOKENS', True):
                refresh.set_jti()
                refresh.set_exp()
                refresh.set_iat()
                new_refresh = str(refresh)
                data['refresh'] = new_refresh

            res = Response(data, status=status.HTTP_200_OK)
            set_auth_cookies(res, access_token, new_refresh or raw_refresh)
            return res
        except TokenError:
            return Response(
                {'error': 'Invalid or expired refresh token.', 'code': 'token_invalid'},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        cookie_name = getattr(settings, 'SIMPLE_JWT', {}).get('AUTH_COOKIE_REFRESH', 'earlyjobs_refresh')
        raw_refresh = request.data.get('refresh') or request.COOKIES.get(cookie_name)

        if raw_refresh:
            try:
                token = RefreshToken(raw_refresh)
                token.blacklist()
            except Exception:
                pass

        res = Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        clear_auth_cookies(res)
        return res


class MeView(APIView):
    permission_classes = [IsVerifiedAndApprovedUser]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class InviteUserView(APIView):
    permission_classes = [IsVerifiedAndApprovedAdmin]

    def post(self, request):
        serializer = InviteUserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        role = serializer.validated_data['role']
        now = timezone.now()

        invitation, _ = UserInvitation.objects.update_or_create(
            email=email,
            defaults={
                'role': role,
                'invited_by': request.user,
                'is_accepted': False,
                'expires_at': now + timedelta(days=7),
            },
        )

        try:
            user = User.objects.get(email=email)
            user.role = role
            user.approval_status = User.APPROVAL_APPROVED
            user.is_approved = True
            user.approved_at = now
            user.approved_by = request.user
            if role == User.ROLE_ADMIN:
                user.is_staff = True
            user.save()
        except User.DoesNotExist:
            pass

        return Response(
            {
                'message': f'Invitation created for {email} with role {role}.',
                'email': email,
                'role': role,
            },
            status=status.HTTP_201_CREATED,
        )


class UserListView(APIView):
    permission_classes = [IsVerifiedAndApprovedAdmin]

    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        return Response(UserSerializer(users, many=True).data, status=status.HTTP_200_OK)
