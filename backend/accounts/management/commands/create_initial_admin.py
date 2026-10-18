import getpass
import os
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone

from accounts.models import User
from accounts.validators import validate_company_email


class Command(BaseCommand):
    help = 'Safely create or promote the initial @earlyjobs.in Administrator account.'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin @earlyjobs.in email address')
        parser.add_argument('--full-name', type=str, default='EarlyJobs Admin', help='Full name of the admin')
        parser.add_argument(
            '--noinput',
            action='store_true',
            help='Read INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD from environment variables',
        )

    def handle(self, *args, **options):
        email = options.get('email') or os.environ.get('INITIAL_ADMIN_EMAIL')
        full_name = options.get('full_name') or os.environ.get('INITIAL_ADMIN_FULL_NAME', 'EarlyJobs Admin')

        if not email and not options['noinput']:
            email = input('Enter @earlyjobs.in Admin email: ').strip()

        try:
            normalized_email = validate_company_email(email)
        except ValidationError as exc:
            raise CommandError('; '.join(exc.messages)) from exc

        if options['noinput']:
            password = os.environ.get('INITIAL_ADMIN_PASSWORD')
            if not password:
                raise CommandError('INITIAL_ADMIN_PASSWORD environment variable is required with --noinput.')
        else:
            password = getpass.getpass('Password: ')
            password_confirm = getpass.getpass('Password (again): ')
            if password != password_confirm:
                raise CommandError('Passwords do not match.')

        temp_user = User(email=normalized_email, full_name=full_name)
        try:
            validate_password(password, user=temp_user)
        except ValidationError as exc:
            raise CommandError('; '.join(exc.messages)) from exc

        now = timezone.now()
        user, created = User.objects.get_or_create(
            email=normalized_email,
            defaults={
                'full_name': full_name,
                'role': User.ROLE_ADMIN,
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'is_email_verified': True,
                'email_verified_at': now,
                'approval_status': User.APPROVAL_APPROVED,
                'is_approved': True,
                'approved_at': now,
            },
        )
        if not created:
            user.full_name = full_name or user.full_name
            user.role = User.ROLE_ADMIN
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.is_email_verified = True
            user.email_verified_at = user.email_verified_at or now
            user.approval_status = User.APPROVAL_APPROVED
            user.is_approved = True
            user.approved_at = user.approved_at or now

        user.set_password(password)
        user.save()

        action_label = 'Created' if created else 'Updated'
        self.stdout.write(
            self.style.SUCCESS(f'{action_label} verified & approved Admin user: {user.email}')
        )
