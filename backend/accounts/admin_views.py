import math
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .permissions import IsVerifiedAndApprovedAdmin
from .serializers import AdminUserSerializer

try:
    from candidates.models import Candidate
except ImportError:
    Candidate = None


class AdminStatsView(APIView):
    """
    Returns actual platform overview metrics for the custom Admin Dashboard.
    Requires verified & approved ADMIN privileges.
    """
    permission_classes = [IsVerifiedAndApprovedAdmin]

    def get(self, request):
        total_users = User.objects.count()
        approved_users = User.objects.filter(approval_status=User.APPROVAL_APPROVED).count()
        pending_users = User.objects.filter(approval_status=User.APPROVAL_PENDING).count()
        rejected_users = User.objects.filter(approval_status=User.APPROVAL_REJECTED).count()

        total_candidates = 0
        total_jobs = 0
        if Candidate is not None:
            total_candidates = Candidate.objects.count()
            distinct_roles = Candidate.objects.values_list('applied_role', flat=True).distinct()
            total_jobs = len([r for r in distinct_roles if r])

        return Response(
            {
                'total_users': total_users,
                'approved_users': approved_users,
                'pending_users': pending_users,
                'rejected_users': rejected_users,
                'total_candidates': total_candidates,
                'total_jobs': total_jobs,
            },
            status=status.HTTP_200_OK,
        )


class AdminUserListView(APIView):
    """
    Lists users with searching, status filtering, role filtering, and pagination.
    Requires verified & approved ADMIN privileges.
    """
    permission_classes = [IsVerifiedAndApprovedAdmin]

    def get(self, request):
        queryset = User.objects.all().select_related('approved_by').order_by('-created_at')

        # Filter by search term (name or email)
        search = (request.query_params.get('search') or '').strip()
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) | Q(full_name__icontains=search)
            )

        # Filter by approval status
        status_param = (request.query_params.get('status') or '').strip().upper()
        if status_param and status_param != 'ALL':
            if status_param in (User.APPROVAL_PENDING, User.APPROVAL_APPROVED, User.APPROVAL_REJECTED):
                queryset = queryset.filter(approval_status=status_param)

        # Filter by role
        role_param = (request.query_params.get('role') or '').strip().upper()
        if role_param and role_param != 'ALL':
            if role_param in (User.ROLE_ADMIN, User.ROLE_RECRUITER):
                queryset = queryset.filter(role=role_param)

        # Pagination
        try:
            page_size = int(request.query_params.get('page_size', 10))
            if page_size < 1:
                page_size = 10
            elif page_size > 100:
                page_size = 100
        except ValueError:
            page_size = 10

        try:
            page_num = int(request.query_params.get('page', 1))
            if page_num < 1:
                page_num = 1
        except ValueError:
            page_num = 1

        paginator = Paginator(queryset, page_size)
        total_count = paginator.count
        total_pages = paginator.num_pages

        try:
            page_obj = paginator.page(page_num)
        except EmptyPage:
            page_obj = []

        serializer = AdminUserSerializer(page_obj, many=True)

        return Response(
            {
                'count': total_count,
                'total_pages': total_pages,
                'current_page': page_num,
                'page_size': page_size,
                'results': serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class AdminUserDetailView(APIView):
    """
    Retrieve details of a single user.
    Requires verified & approved ADMIN privileges.
    """
    permission_classes = [IsVerifiedAndApprovedAdmin]

    def get(self, request, user_id):
        try:
            user = User.objects.select_related('approved_by').get(id=user_id)
        except (User.DoesNotExist, ValueError):
            return Response(
                {'error': 'User not found.', 'code': 'user_not_found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(AdminUserSerializer(user).data, status=status.HTTP_200_OK)


class AdminUserApproveView(APIView):
    """
    Approves a user registration and marks them as active.
    Requires verified & approved ADMIN privileges.
    """
    permission_classes = [IsVerifiedAndApprovedAdmin]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError):
            return Response(
                {'error': 'User not found.', 'code': 'user_not_found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        now = timezone.now()
        user.approval_status = User.APPROVAL_APPROVED
        user.is_approved = True
        user.approved_by = request.user
        user.approved_at = now
        user.is_active = True
        user.save()

        return Response(
            {
                'message': f'User {user.email} has been approved successfully.',
                'user': AdminUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminUserRejectView(APIView):
    """
    Rejects a user registration and revokes ATS access.
    Guards against administrators rejecting their own account.
    Requires verified & approved ADMIN privileges.
    """
    permission_classes = [IsVerifiedAndApprovedAdmin]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError):
            return Response(
                {'error': 'User not found.', 'code': 'user_not_found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Protection: Prevent admin from rejecting themselves
        if str(user.id) == str(request.user.id):
            return Response(
                {
                    'error': 'Administrators cannot reject their own account.',
                    'code': 'cannot_reject_self',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Protection: Prevent rejecting the last active superuser
        if user.is_superuser and User.objects.filter(is_superuser=True, is_active=True).count() <= 1:
            return Response(
                {
                    'error': 'Cannot reject the only active superuser administrator.',
                    'code': 'cannot_reject_last_admin',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()
        user.approval_status = User.APPROVAL_REJECTED
        user.is_approved = False
        user.approved_by = request.user
        user.approved_at = now
        user.save()

        return Response(
            {
                'message': f'User {user.email} has been rejected.',
                'user': AdminUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class AdminUserRoleView(APIView):
    """
    Updates a user's role (ADMIN or RECRUITER).
    Guards against admins removing their own required privileges.
    Requires verified & approved ADMIN privileges.
    """
    permission_classes = [IsVerifiedAndApprovedAdmin]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except (User.DoesNotExist, ValueError):
            return Response(
                {'error': 'User not found.', 'code': 'user_not_found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_role = (request.data.get('role') or '').strip().upper()
        if new_role not in (User.ROLE_ADMIN, User.ROLE_RECRUITER):
            return Response(
                {'error': f'Invalid role. Allowed roles: {User.ROLE_ADMIN}, {User.ROLE_RECRUITER}.', 'code': 'invalid_role'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent admin from demoting themselves
        if str(user.id) == str(request.user.id) and new_role != User.ROLE_ADMIN:
            return Response(
                {
                    'error': 'Administrators cannot demote their own account.',
                    'code': 'cannot_demote_self',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.role = new_role
        if new_role == User.ROLE_ADMIN:
            user.is_staff = True
        else:
            user.is_staff = False
            user.is_superuser = False
        user.save()

        return Response(
            {
                'message': f'Role updated to {new_role} for {user.email}.',
                'user': AdminUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )
