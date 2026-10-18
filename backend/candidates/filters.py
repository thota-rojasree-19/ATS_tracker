import django_filters
from .models import Candidate


class CandidateFilter(django_filters.FilterSet):
    applied_role = django_filters.CharFilter(field_name='applied_role', lookup_expr='icontains')
    stage = django_filters.ChoiceFilter(choices=Candidate.STAGE_CHOICES)

    class Meta:
        model = Candidate
        fields = ['stage', 'applied_role']
