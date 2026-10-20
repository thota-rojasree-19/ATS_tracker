from django.urls import path
from .admin_views import (
    AdminStatsView,
    AdminUserListView,
    AdminUserDetailView,
    AdminUserApproveView,
    AdminUserRejectView,
    AdminUserRoleView,
)

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('users/<uuid:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('users/<uuid:user_id>/approve/', AdminUserApproveView.as_view(), name='admin-user-approve'),
    path('users/<uuid:user_id>/reject/', AdminUserRejectView.as_view(), name='admin-user-reject'),
    path('users/<uuid:user_id>/role/', AdminUserRoleView.as_view(), name='admin-user-role'),
]
