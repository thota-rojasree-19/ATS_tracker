from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Candidate


class CandidateModelTests(APITestCase):
    def test_create_valid_candidate(self):
        c = Candidate.objects.create(
            full_name='Alice Smith',
            email='alice@example.com',
            phone='1234567890',
            applied_role='Python Developer',
            experience_years=2.5,
            skills=['Python', 'Django'],
            stage='APPLIED'
        )
        self.assertEqual(c.full_name, 'Alice Smith')
        self.assertEqual(c.email, 'alice@example.com')

    def test_email_unique(self):
        Candidate.objects.create(full_name='A', email='a@example.com', applied_role='Dev')
        with self.assertRaises(Exception):
            Candidate.objects.create(full_name='B', email='a@example.com', applied_role='Dev')

    def test_negative_experience_rejected(self):
        with self.assertRaises(Exception):
            Candidate.objects.create(full_name='A', email='neg@example.com', applied_role='Dev', experience_years=-1)

    def test_invalid_stage_rejected(self):
        with self.assertRaises(Exception):
            Candidate.objects.create(full_name='A', email='stage@example.com', applied_role='Dev', stage='INVALID')

    def test_skills_validation(self):
        with self.assertRaises(Exception):
            Candidate.objects.create(full_name='A', email='skills@example.com', applied_role='Dev', skills='bad')

    def test_normalization(self):
        c = Candidate(full_name='  Bob  ', email='  BOB@Example.com  ', applied_role='  Dev  ')
        c.full_clean()
        self.assertEqual(c.full_name, 'Bob')
        self.assertEqual(c.email, 'bob@example.com')
        self.assertEqual(c.applied_role, 'Dev')


class CandidateAPITests(APITestCase):
    def setUp(self):
        self.list_url = reverse('candidate-list')
        self.valid_data = {
            'full_name': 'Jane Doe',
            'email': 'jane@example.com',
            'applied_role': 'Backend Developer',
            'experience_years': 3,
            'skills': ['Python', 'Postgres'],
            'stage': 'APPLIED'
        }

    def test_list_empty(self):
        resp = self.client.get(self.list_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('results', resp.data)
        self.assertIn('count', resp.data)

    def test_create_candidate(self):
        resp = self.client.post(self.list_url, self.valid_data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['email'], 'jane@example.com')

    def test_create_requires_fields(self):
        resp = self.client.post(self.list_url, {}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_email(self):
        data = self.valid_data.copy()
        data['email'] = 'not-an-email'
        resp = self.client.post(self.list_url, data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_email(self):
        self.client.post(self.list_url, self.valid_data, format='json')
        resp = self.client.post(self.list_url, self.valid_data, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_candidate(self):
        resp = self.client.post(self.list_url, self.valid_data, format='json')
        pk = resp.data['id']
        detail = reverse('candidate-detail', args=[pk])
        r = self.client.get(detail)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_retrieve_404(self):
        detail = reverse('candidate-detail', args=['00000000-0000-0000-0000-000000000000'])
        r = self.client.get(detail)
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_full(self):
        resp = self.client.post(self.list_url, self.valid_data, format='json')
        pk = resp.data['id']
        detail = reverse('candidate-detail', args=[pk])
        data = resp.data.copy()
        data['stage'] = 'INTERVIEW'
        data['full_name'] = 'Jane Updated'
        r = self.client.put(detail, data, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['stage'], 'INTERVIEW')

    def test_update_partial(self):
        resp = self.client.post(self.list_url, self.valid_data, format='json')
        pk = resp.data['id']
        detail = reverse('candidate-detail', args=[pk])
        r = self.client.patch(detail, {'stage': 'OFFER'}, format='json')
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data['stage'], 'OFFER')

    def test_delete(self):
        resp = self.client.post(self.list_url, self.valid_data, format='json')
        pk = resp.data['id']
        detail = reverse('candidate-detail', args=[pk])
        r = self.client.delete(detail)
        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)


class SearchFilterTests(APITestCase):
    def setUp(self):
        self.client.post(reverse('candidate-list'), {
            'full_name': 'John Python',
            'email': 'john@python.com',
            'applied_role': 'Python Developer',
            'skills': ['Python', 'FastAPI'],
            'stage': 'APPLIED'
        }, format='json')
        self.client.post(reverse('candidate-list'), {
            'full_name': 'Jane React',
            'email': 'jane@react.com',
            'applied_role': 'Frontend Developer',
            'skills': ['React', 'TypeScript'],
            'stage': 'INTERVIEW'
        }, format='json')

    def test_search_by_name(self):
        r = self.client.get(reverse('candidate-list') + '?search=John')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['count'], 1)

    def test_search_by_email(self):
        r = self.client.get(reverse('candidate-list') + '?search=python.com')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['count'], 1)

    def test_search_by_role(self):
        r = self.client.get(reverse('candidate-list') + '?search=Frontend')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['count'], 1)

    def test_search_by_skill(self):
        r = self.client.get(reverse('candidate-list') + '?search=React')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['count'], 1)

    def test_filter_by_stage(self):
        r = self.client.get(reverse('candidate-list') + '?stage=INTERVIEW')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['count'], 1)

    def test_filter_by_role(self):
        r = self.client.get(reverse('candidate-list') + '?applied_role=Python')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['count'], 1)

    def test_combined_search_filter(self):
        r = self.client.get(reverse('candidate-list') + '?stage=APPLIED&search=Python')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['count'], 1)

    def test_ordering(self):
        r = self.client.get(reverse('candidate-list') + '?ordering=full_name')
        self.assertEqual(r.status_code, 200)

    def test_pagination(self):
        r = self.client.get(reverse('candidate-list') + '?page=1&page_size=1')
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data['count'] >= 1)

    def test_invalid_param_no_500(self):
        r = self.client.get(reverse('candidate-list') + '?stage=INVALID')
        self.assertNotEqual(r.status_code, 500)


class DashboardTests(APITestCase):
    def test_empty_dashboard(self):
        r = self.client.get(reverse('dashboard'))
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['total_candidates'], 0)
        self.assertEqual(r.data['stage_distribution'][0]['stage'], 'APPLIED')

    def test_dashboard_counts(self):
        self.client.post(reverse('candidate-list'), {
            'full_name': 'A', 'email': 'a@test.com', 'applied_role': 'Dev', 'stage': 'APPLIED'
        }, format='json')
        self.client.post(reverse('candidate-list'), {
            'full_name': 'B', 'email': 'b@test.com', 'applied_role': 'Dev', 'stage': 'INTERVIEW'
        }, format='json')
        self.client.post(reverse('candidate-list'), {
            'full_name': 'C', 'email': 'c@test.com', 'applied_role': 'Dev', 'stage': 'HIRED'
        }, format='json')
        self.client.post(reverse('candidate-list'), {
            'full_name': 'D', 'email': 'd@test.com', 'applied_role': 'Dev', 'stage': 'REJECTED'
        }, format='json')
        r = self.client.get(reverse('dashboard'))
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['total_candidates'], 4)
        self.assertEqual(r.data['interviews'], 1)
        self.assertEqual(r.data['hired'], 1)
        self.assertEqual(r.data['rejected'], 1)


class HealthTests(APITestCase):
    def test_health(self):
        r = self.client.get(reverse('health'))
        self.assertEqual(r.status_code, 200)
        self.assertIn('status', r.data)
