from datetime import timedelta
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import UserInvitation

User = get_user_model()


class AuthenticationAPITests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.refresh_url = reverse('auth-refresh')
        self.logout_url = reverse('auth-logout')
        self.me_url = reverse('auth-me')
        self.invite_url = reverse('auth-invite')

        # Create standard approved recruiter
        self.approved_recruiter = User.objects.create_user(
            email='recruiter@earlyjobs.in',
            password='TestPassword123!',
            full_name='Test Recruiter',
            role=User.ROLE_RECRUITER,
            is_email_verified=True,
            approval_status=User.APPROVAL_APPROVED,
            is_approved=True,
        )

        # Create approved administrator
        self.admin_user = User.objects.create_superuser(
            email='admin@earlyjobs.in',
            password='AdminPassword123!',
            full_name='Admin User',
        )

    # 1. Registration tests
    def test_successful_registration_uninvited_user_pending_approval(self):
        payload = {
            'full_name': 'New Candidate Recruiter',
            'email': 'new.recruiter@earlyjobs.in',
            'password': 'SecurePassword2026!',
            'confirm_password': 'SecurePassword2026!',
        }
        resp = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertFalse(resp.data.get('is_approved'))
        self.assertEqual(resp.data.get('approval_status'), User.APPROVAL_PENDING)
        self.assertIn('awaiting administrator approval', resp.data.get('message', '').lower())

        # Verify user in database
        user = User.objects.get(email='new.recruiter@earlyjobs.in')
        self.assertEqual(user.full_name, 'New Candidate Recruiter')
        self.assertTrue(user.check_password('SecurePassword2026!'))
        self.assertFalse(user.is_approved)
        self.assertEqual(user.role, User.ROLE_RECRUITER)

    def test_registration_password_hashing(self):
        payload = {
            'full_name': 'Hashed User',
            'email': 'hashed@earlyjobs.in',
            'password': 'ComplexPassword2026!',
            'confirm_password': 'ComplexPassword2026!',
        }
        resp = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='hashed@earlyjobs.in')
        # Ensure password is stored hashed (not plaintext)
        self.assertNotEqual(user.password, 'ComplexPassword2026!')
        self.assertTrue(user.has_usable_password())
        self.assertTrue(user.check_password('ComplexPassword2026!'))

    def test_registration_with_invalid_email_domain_rejected(self):
        invalid_emails = [
            'user@gmail.com',
            'user@yahoo.com',
            'user@earlyjobs.in.fake.com',
            'notearlyjobs.in',
            'external@othercompany.com',
        ]
        for email in invalid_emails:
            payload = {
                'full_name': 'Invalid Email User',
                'email': email,
                'password': 'Password123!',
                'confirm_password': 'Password123!',
            }
            resp = self.client.post(self.register_url, payload, format='json')
            self.assertEqual(
                resp.status_code,
                status.HTTP_400_BAD_REQUEST,
                f'Failed to reject invalid domain: {email}',
            )

    def test_registration_with_mismatched_passwords_rejected(self):
        payload = {
            'full_name': 'Mismatch User',
            'email': 'mismatch@earlyjobs.in',
            'password': 'CorrectPassword123!',
            'confirm_password': 'DifferentPassword123!',
        }
        resp = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', resp.data)

    def test_registration_with_duplicate_email_rejected(self):
        payload = {
            'full_name': 'Duplicate User',
            'email': self.approved_recruiter.email,
            'password': 'NewPassword123!',
            'confirm_password': 'NewPassword123!',
        }
        resp = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', resp.data)

    def test_registration_cannot_self_assign_admin_role(self):
        payload = {
            'full_name': 'Sneaky User',
            'email': 'sneaky@earlyjobs.in',
            'password': 'ComplexPassword2026!',
            'confirm_password': 'ComplexPassword2026!',
            'role': 'ADMIN',
        }
        resp = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='sneaky@earlyjobs.in')
        self.assertEqual(user.role, User.ROLE_RECRUITER)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_registration_with_pre_existing_invitation_auto_approved(self):
        now = timezone.now()
        UserInvitation.objects.create(
            email='invited@earlyjobs.in',
            role=User.ROLE_RECRUITER,
            invited_by=self.admin_user,
            is_accepted=False,
            expires_at=now + timedelta(days=7),
        )
        payload = {
            'full_name': 'Invited Recruiter',
            'email': 'invited@earlyjobs.in',
            'password': 'InvitedPassword2026!',
            'confirm_password': 'InvitedPassword2026!',
        }
        resp = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(resp.data.get('is_approved'))
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

        user = User.objects.get(email='invited@earlyjobs.in')
        self.assertTrue(user.is_approved)
        self.assertEqual(user.approval_status, User.APPROVAL_APPROVED)

    # 2. Login tests
    def test_successful_login_with_valid_credentials(self):
        resp = self.client.post(
            self.login_url,
            {'email': self.approved_recruiter.email, 'password': 'TestPassword123!'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)
        self.assertEqual(resp.data['user']['email'], self.approved_recruiter.email)

    def test_failed_login_with_incorrect_password(self):
        resp = self.client.post(
            self.login_url,
            {'email': self.approved_recruiter.email, 'password': 'WrongPassword999!'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(resp.data.get('code'), 'invalid_credentials')

    def test_login_with_invalid_email_domain_rejected(self):
        resp = self.client.post(
            self.login_url,
            {'email': 'hacker@external.com', 'password': 'AnyPassword123!'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_unapproved_account_rejected(self):
        unapproved = User.objects.create_user(
            email='unapproved@earlyjobs.in',
            password='ValidPassword123!',
            full_name='Unapproved User',
            is_email_verified=True,
            approval_status=User.APPROVAL_PENDING,
            is_approved=False,
        )
        resp = self.client.post(
            self.login_url,
            {'email': unapproved.email, 'password': 'ValidPassword123!'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resp.data.get('code'), 'pending_approval')

    def test_login_with_disabled_account_rejected(self):
        disabled = User.objects.create_user(
            email='disabled@earlyjobs.in',
            password='ValidPassword123!',
            full_name='Disabled User',
            is_email_verified=True,
            approval_status=User.APPROVAL_APPROVED,
            is_approved=True,
        )
        disabled.is_active = False
        disabled.save()

        resp = self.client.post(
            self.login_url,
            {'email': disabled.email, 'password': 'ValidPassword123!'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resp.data.get('code'), 'user_inactive')

    def test_administrator_login(self):
        resp = self.client.post(
            self.login_url,
            {'email': self.admin_user.email, 'password': 'AdminPassword123!'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['user']['role'], User.ROLE_ADMIN)
        self.assertIn('access', resp.data)

    # 3. Protected API access & Logout
    def test_protected_me_endpoint_with_valid_token(self):
        refresh = RefreshToken.for_user(self.approved_recruiter)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
        resp = self.client.get(self.me_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['email'], self.approved_recruiter.email)

    def test_protected_me_endpoint_rejected_without_token(self):
        self.client.credentials()
        resp = self.client.get(self.me_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        refresh = RefreshToken.for_user(self.approved_recruiter)
        refresh_str = str(refresh)
        resp = self.client.post(self.logout_url, {'refresh': refresh_str}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_token_refresh(self):
        refresh = RefreshToken.for_user(self.approved_recruiter)
        resp = self.client.post(self.refresh_url, {'refresh': str(refresh)}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)

    # 4. Role-based permissions
    def test_recruiter_cannot_invite_users(self):
        refresh = RefreshToken.for_user(self.approved_recruiter)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
        resp = self.client.post(
            self.invite_url,
            {'email': 'colleague@earlyjobs.in', 'role': 'RECRUITER'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_invite_users(self):
        refresh = RefreshToken.for_user(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
        resp = self.client.post(
            self.invite_url,
            {'email': 'colleague@earlyjobs.in', 'role': 'RECRUITER'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(UserInvitation.objects.filter(email='colleague@earlyjobs.in').exists())


class AdminDashboardAndApprovalAPITests(APITestCase):
    def setUp(self):
        self.login_url = reverse('auth-login')
        self.stats_url = reverse('admin-stats')
        self.users_list_url = reverse('admin-users-list')

        # Create Administrator user
        self.admin_user = User.objects.create_superuser(
            email='admin@admin.com',
            password='12345678',
            full_name='System Administrator',
        )

        # Create Approved Recruiter user
        self.approved_recruiter = User.objects.create_user(
            email='recruiter.one@earlyjobs.in',
            password='RecruiterPass123!',
            full_name='Alice Recruiter',
            role=User.ROLE_RECRUITER,
            is_email_verified=True,
            approval_status=User.APPROVAL_APPROVED,
            is_approved=True,
        )

        # Create Pending Recruiter user
        self.pending_user = User.objects.create_user(
            email='pending.user@earlyjobs.in',
            password='PendingPass123!',
            full_name='Bob Pending',
            role=User.ROLE_RECRUITER,
            is_email_verified=True,
            approval_status=User.APPROVAL_PENDING,
            is_approved=False,
        )

        # Create Rejected Recruiter user
        self.rejected_user = User.objects.create_user(
            email='rejected.user@earlyjobs.in',
            password='RejectedPass123!',
            full_name='Charlie Rejected',
            role=User.ROLE_RECRUITER,
            is_email_verified=True,
            approval_status=User.APPROVAL_REJECTED,
            is_approved=False,
        )

        # Create Disabled Recruiter user
        self.disabled_user = User.objects.create_user(
            email='disabled.user@earlyjobs.in',
            password='DisabledPass123!',
            full_name='Dana Disabled',
            role=User.ROLE_RECRUITER,
            is_email_verified=True,
            approval_status=User.APPROVAL_APPROVED,
            is_approved=True,
        )
        self.disabled_user.is_active = False
        self.disabled_user.save()

    def _get_auth_header(self, user):
        refresh = RefreshToken.for_user(user)
        return f'Bearer {str(refresh.access_token)}'

    # 1. Login & Redirection data tests
    def test_admin_login_returns_admin_role_and_tokens(self):
        resp = self.client.post(
            self.login_url,
            {'email': 'admin@admin.com', 'password': '12345678'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['user']['role'], User.ROLE_ADMIN)
        self.assertEqual(resp.data['user']['email'], 'admin@admin.com')
        self.assertTrue(resp.data['user']['is_approved'])
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

    def test_recruiter_login_returns_recruiter_role(self):
        resp = self.client.post(
            self.login_url,
            {'email': 'recruiter.one@earlyjobs.in', 'password': 'RecruiterPass123!'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['user']['role'], User.ROLE_RECRUITER)

    def test_pending_user_login_rejected_with_pending_code(self):
        resp = self.client.post(
            self.login_url,
            {'email': 'pending.user@earlyjobs.in', 'password': 'PendingPass123!'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resp.data.get('code'), 'pending_approval')
        self.assertIn('awaiting administrator approval', resp.data.get('error', '').lower())

    def test_rejected_user_login_denied_with_account_rejected_code(self):
        resp = self.client.post(
            self.login_url,
            {'email': 'rejected.user@earlyjobs.in', 'password': 'RejectedPass123!'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resp.data.get('code'), 'account_rejected')
        self.assertEqual(resp.data.get('approval_status'), User.APPROVAL_REJECTED)

    def test_disabled_user_login_denied_with_inactive_code(self):
        resp = self.client.post(
            self.login_url,
            {'email': 'disabled.user@earlyjobs.in', 'password': 'DisabledPass123!'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(resp.data.get('code'), 'user_inactive')

    # 2. Admin Stats Endpoint tests
    def test_admin_can_access_stats(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.admin_user))
        resp = self.client.get(self.stats_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', resp.data)
        self.assertIn('approved_users', resp.data)
        self.assertIn('pending_users', resp.data)
        self.assertIn('rejected_users', resp.data)
        self.assertIn('total_candidates', resp.data)
        self.assertIn('total_jobs', resp.data)
        self.assertEqual(resp.data['pending_users'], 1)
        self.assertEqual(resp.data['rejected_users'], 1)

    def test_non_admin_cannot_access_stats(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.approved_recruiter))
        resp = self.client.get(self.stats_url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_access_stats(self):
        self.client.credentials()
        resp = self.client.get(self.stats_url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    # 3. User Listing & Filtering tests
    def test_admin_can_list_users(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.admin_user))
        resp = self.client.get(self.users_list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('results', resp.data)
        self.assertGreaterEqual(resp.data['count'], 5)

    def test_admin_can_search_users_by_email(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.admin_user))
        resp = self.client.get(self.users_list_url, {'search': 'alice'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        emails = [u['email'] for u in resp.data['results']]
        self.assertIn('recruiter.one@earlyjobs.in', emails)

    def test_admin_can_filter_users_by_status(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.admin_user))
        resp = self.client.get(self.users_list_url, {'status': 'PENDING'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        for u in resp.data['results']:
            self.assertEqual(u['approval_status'], 'PENDING')

    def test_non_admin_cannot_list_users(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.approved_recruiter))
        resp = self.client.get(self.users_list_url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    # 4. User Approval API tests
    def test_admin_can_approve_pending_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.admin_user))
        approve_url = reverse('admin-user-approve', kwargs={'user_id': self.pending_user.id})
        resp = self.client.patch(approve_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['user']['approval_status'], User.APPROVAL_APPROVED)
        self.assertTrue(resp.data['user']['is_approved'])

        # Verify database update
        self.pending_user.refresh_from_db()
        self.assertEqual(self.pending_user.approval_status, User.APPROVAL_APPROVED)
        self.assertTrue(self.pending_user.is_approved)
        self.assertEqual(self.pending_user.approved_by, self.admin_user)
        self.assertIsNotNone(self.pending_user.approved_at)

        # Verified that approved user can now log in
        login_resp = self.client.post(
            self.login_url,
            {'email': 'pending.user@earlyjobs.in', 'password': 'PendingPass123!'},
            format='json',
        )
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)

    def test_non_admin_cannot_approve_users(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.approved_recruiter))
        approve_url = reverse('admin-user-approve', kwargs={'user_id': self.pending_user.id})
        resp = self.client.patch(approve_url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    # 5. User Rejection API tests
    def test_admin_can_reject_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.admin_user))
        reject_url = reverse('admin-user-reject', kwargs={'user_id': self.approved_recruiter.id})
        resp = self.client.patch(reject_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['user']['approval_status'], User.APPROVAL_REJECTED)
        self.assertFalse(resp.data['user']['is_approved'])

        # Verify database update
        self.approved_recruiter.refresh_from_db()
        self.assertEqual(self.approved_recruiter.approval_status, User.APPROVAL_REJECTED)
        self.assertFalse(self.approved_recruiter.is_approved)

    def test_admin_cannot_reject_themselves(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.admin_user))
        reject_url = reverse('admin-user-reject', kwargs={'user_id': self.admin_user.id})
        resp = self.client.patch(reject_url)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resp.data.get('code'), 'cannot_reject_self')

    def test_non_admin_cannot_reject_users(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.approved_recruiter))
        reject_url = reverse('admin-user-reject', kwargs={'user_id': self.pending_user.id})
        resp = self.client.patch(reject_url)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    # 6. Role Updates & Demotion Guard tests
    def test_admin_can_promote_recruiter_to_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.admin_user))
        role_url = reverse('admin-user-role', kwargs={'user_id': self.approved_recruiter.id})
        resp = self.client.patch(role_url, {'role': 'ADMIN'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['user']['role'], User.ROLE_ADMIN)

    def test_admin_cannot_demote_themselves(self):
        self.client.credentials(HTTP_AUTHORIZATION=self._get_auth_header(self.admin_user))
        role_url = reverse('admin-user-role', kwargs={'user_id': self.admin_user.id})
        resp = self.client.patch(role_url, {'role': 'RECRUITER'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(resp.data.get('code'), 'cannot_demote_self')

