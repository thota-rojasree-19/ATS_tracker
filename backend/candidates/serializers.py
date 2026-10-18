from rest_framework import serializers
from .models import Candidate


class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = [
            'id',
            'full_name',
            'email',
            'phone',
            'applied_role',
            'experience_years',
            'skills',
            'stage',
            'resume_url',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Full name is required.')
        return value.strip()

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError('Email is required.')
        return value.strip().lower()

    def validate_applied_role(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('Applied role is required.')
        return value.strip()

    def validate_phone(self, value):
        if value is None:
            return value
        if not value.strip():
            return None
        return value.strip()

    def validate_resume_url(self, value):
        if value is None:
            return value
        if not value.strip():
            return None
        return value.strip()

    def validate_experience_years(self, value):
        if value is None:
            return value
        if value < 0:
            raise serializers.ValidationError('Experience years must be non-negative.')
        return value

    def validate_skills(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('Skills must be a list.')
        cleaned = []
        for skill in value:
            if not isinstance(skill, str) or not skill.strip():
                raise serializers.ValidationError('Skills must contain non-empty strings.')
            s = skill.strip()
            if s.lower() not in [x.lower() for x in cleaned]:
                cleaned.append(s)
        return cleaned

    def validate_stage(self, value):
        if value not in dict(Candidate.STAGE_CHOICES):
            raise serializers.ValidationError('Invalid stage.')
        return value

    def validate(self, attrs):
        if 'email' in attrs:
            email = attrs['email']
            qs = Candidate.objects.filter(email=email)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({'email': 'Candidate with this email already exists.'})
        return attrs
