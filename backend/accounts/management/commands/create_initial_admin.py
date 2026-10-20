import getpass
import os
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone

from accounts.models import User
from accounts.validators import validate_company_email


class Command(BaseCommand):
    help = 'Safely create or provision the initial Administrator account.'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email address')
        parser.add_argument('--full-name', type=str, default=None, help='Full name of the admin')
        parser.add_argument('--password', type=str, default=None, help='Admin password (for script / automated setup)')
        parser.add_argument(
            '--reset-password',
            action='store_true',
            help='Explicitly authorize overwriting password if the admin user already exists',
        )
        parser.add_argument(
            '--noinput',
            action='store_true',
            help='Read INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD from environment variables or flags',
        )

    def handle(self, *args, **options):
        email = options.get('email') or os.environ.get('INITIAL_ADMIN_EMAIL')
        full_name = options.get('full_name') or os.environ.get('INITIAL_ADMIN_FULL_NAME') or 'EarlyJobs Administrator'
        reset_password = options.get('reset_password', False)
        noinput = options.get('noinput', False)
        cli_password = options.get('password')

        if not email and not noinput:
            email = input('Enter Administrator email: ').strip()

        if not email:
            raise CommandError('Administrator email is required. Provide --email or set INITIAL_ADMIN_EMAIL.')

        try:
            normalized_email = validate_company_email(email)
        except ValidationError as exc:
            raise CommandError('; '.join(exc.messages)) from exc

        # Check if user already exists
        existing_user = User.objects.filter(email=normalized_email).first()
        now = timezone.now()

        if existing_user:
            # Safely verify/ensure ADMIN privileges and approval status
            existing_user.role = User.ROLE_ADMIN
            existing_user.is_staff = True
            existing_user.is_superuser = True
            existing_user.is_active = True
            existing_user.is_email_verified = True
            existing_user.email_verified_at = existing_user.email_verified_at or now
            existing_user.approval_status = User.APPROVAL_APPROVED
            existing_user.is_approved = True
            existing_user.approved_at = existing_user.approved_at or now

            if reset_password or cli_password or (noinput and os.environ.get('INITIAL_ADMIN_PASSWORD')):
                password = cli_password or (os.environ.get('INITIAL_ADMIN_PASSWORD') if noinput else None)
                if not password and not noinput:
                    password = getpass.getpass('New Password: ')
                    password_confirm = getpass.getpass('New Password (again): ')
                    if password != password_confirm:
                        raise CommandError('Passwords do not match.')

                if password:
                    # Password validation: in production, require strong password
                    if not getattr(settings, 'DEBUG', True):
                        if password in ('12345678', 'admin', 'password', 'admin123', 'root'):
                            raise CommandError('Default or weak passwords are prohibited in production.')
                        try:
                            validate_password(password, user=existing_user)
                        except ValidationError as exc:
                            raise CommandError('; '.join(exc.messages)) from exc

                    existing_user.set_password(password)
                    existing_user.save()
                    self.stdout.write(
                        self.style.SUCCESS(f'Updated administrator user {existing_user.email} with new password and verified ADMIN privileges.')
                    )
                    return

            existing_user.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Administrator user {existing_user.email} already exists. Verified active ADMIN privileges. '
                    f'Existing password preserved (use --reset-password to overwrite).'
                )
            )
            return

        # New user creation: retrieve password
        if cli_password:
            password = cli_password
        elif noinput:
            password = os.environ.get('INITIAL_ADMIN_PASSWORD')
            if not password:
                raise CommandError('INITIAL_ADMIN_PASSWORD environment variable or --password is required with --noinput.')
        else:
            password = getpass.getpass('Password: ')
            password_confirm = getpass.getpass('Password (again): ')
            if password != password_confirm:
                raise CommandError('Passwords do not match.')

        # In production, require strong password validation
        temp_user = User(email=normalized_email, full_name=full_name)
        if not getattr(settings, 'DEBUG', True):
            if password in ('12345678', 'admin', 'password', 'admin123', 'root'):
                raise CommandError('Default or weak passwords are prohibited in production.')
            try:
                validate_password(password, user=temp_user)
            except ValidationError as exc:
                raise CommandError('; '.join(exc.messages)) from exc

        user = User(
            email=normalized_email,
            full_name=full_name,
            role=User.ROLE_ADMIN,
            is_staff=True,
            is_superuser=True,
            is_active=True,
            is_email_verified=True,
            email_verified_at=now,
            approval_status=User.APPROVAL_APPROVED,
            is_approved=True,
            approved_at=now,
        )
        user.set_password(password)
        user.save()

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created verified & approved Administrator user: {user.email}')
        )
