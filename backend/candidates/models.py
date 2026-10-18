import uuid
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models


class Candidate(models.Model):
    STAGE_APPLIED = 'APPLIED'
    STAGE_SCREENING = 'SCREENING'
    STAGE_INTERVIEW = 'INTERVIEW'
    STAGE_OFFER = 'OFFER'
    STAGE_HIRED = 'HIRED'
    STAGE_REJECTED = 'REJECTED'

    STAGE_CHOICES = [
        (STAGE_APPLIED, 'Applied'),
        (STAGE_SCREENING, 'Screening'),
        (STAGE_INTERVIEW, 'Interview'),
        (STAGE_OFFER, 'Offer'),
        (STAGE_HIRED, 'Hired'),
        (STAGE_REJECTED, 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, max_length=255)
    phone = models.CharField(max_length=50, blank=True, null=True)
    applied_role = models.CharField(max_length=255)
    experience_years = models.DecimalField(
        max_digits=4, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0.0)]
    )
    skills = models.JSONField(default=list, blank=True)
    stage = models.CharField(
        max_length=20, choices=STAGE_CHOICES, default=STAGE_APPLIED
    )
    resume_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['stage']),
            models.Index(fields=['applied_role']),
            models.Index(fields=['created_at']),
        ]

    def clean_fields(self, exclude=None):
        # normalize before validation
        if self.full_name is not None:
            self.full_name = self.full_name.strip()
        if self.email is not None:
            self.email = str(self.email).strip().lower()
        if self.applied_role is not None:
            self.applied_role = self.applied_role.strip()
        if self.phone is not None and self.phone.strip() == '':
            self.phone = None
        if self.resume_url is not None and self.resume_url.strip() == '':
            self.resume_url = None
        super().clean_fields(exclude=exclude)

    def clean(self):
        super().clean()
        if self.skills is None:
            self.skills = []
        elif not isinstance(self.skills, list):
            raise ValidationError({'skills': 'Skills must be a list.'})
        else:
            cleaned = []
            seen = set()
            for skill in self.skills:
                if not isinstance(skill, str) or not skill.strip():
                    raise ValidationError({'skills': 'Skills must contain non-empty strings.'})
                sk = skill.strip()
                key = sk.lower()
                if key not in seen:
                    seen.add(key)
                    cleaned.append(sk)
            self.skills = cleaned

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name} - {self.email}"
