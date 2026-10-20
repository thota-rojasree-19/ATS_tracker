from django.db.models import Count, Q
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from accounts.permissions import IsVerifiedAndApprovedUser
from .filters import CandidateFilter
from .models import Candidate
from .serializers import CandidateSerializer


class CandidatePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    pagination_class = CandidatePagination
    permission_classes = [IsVerifiedAndApprovedUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CandidateFilter
    search_fields = ['full_name', 'email', 'applied_role', 'skills']
    ordering_fields = ['created_at', 'full_name', 'experience_years', 'stage']
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset()


class DashboardAPIView(APIView):
    permission_classes = [IsVerifiedAndApprovedUser]

    def get(self, request):
        total_candidates = Candidate.objects.count()
        in_progress = Candidate.objects.filter(
            stage__in=[Candidate.STAGE_APPLIED, Candidate.STAGE_SCREENING, Candidate.STAGE_INTERVIEW, Candidate.STAGE_OFFER]
        ).count()
        interviews = Candidate.objects.filter(stage=Candidate.STAGE_INTERVIEW).count()
        hired = Candidate.objects.filter(stage=Candidate.STAGE_HIRED).count()
        rejected = Candidate.objects.filter(stage=Candidate.STAGE_REJECTED).count()

        stage_counts = Candidate.objects.values('stage').annotate(count=Count('id'))
        stage_dict = {sc['stage']: sc['count'] for sc in stage_counts}
        stage_distribution = []
        for stage, label in Candidate.STAGE_CHOICES:
            stage_distribution.append({
                'stage': stage,
                'label': label,
                'count': stage_dict.get(stage, 0)
            })

        recent_candidates = Candidate.objects.order_by('-created_at')[:5]
        serializer = CandidateSerializer(recent_candidates, many=True)

        return Response({
            'total_candidates': total_candidates,
            'in_progress': in_progress,
            'interviews': interviews,
            'hired': hired,
            'rejected': rejected,
            'stage_distribution': stage_distribution,
            'recent_candidates': serializer.data
        })


class HealthAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        db_ok = True
        try:
            Candidate.objects.count()
        except Exception:
            db_ok = False
        if not db_ok:
            return Response({'status': 'unhealthy', 'database': 'unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({'status': 'ok', 'database': 'available'})
