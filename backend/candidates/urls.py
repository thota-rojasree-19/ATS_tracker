from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CandidateViewSet, DashboardAPIView, HealthAPIView

router = DefaultRouter(trailing_slash=True)
router.register(r'candidates', CandidateViewSet, basename='candidate')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    path('health/', HealthAPIView.as_view(), name='health'),
]
