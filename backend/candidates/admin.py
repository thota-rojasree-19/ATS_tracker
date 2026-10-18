from django.contrib import admin
from .models import Candidate


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'applied_role', 'stage', 'experience_years', 'created_at')
    list_filter = ('stage', 'applied_role')
    search_fields = ('full_name', 'email', 'applied_role', 'skills')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)
