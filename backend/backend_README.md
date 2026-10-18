# EarlyJobs.ai ATS Backend

## Tech Stack
- Python 3.10+
- Django 5.2
- Django REST Framework
- django-filter
- django-cors-headers
- PostgreSQL (production) / SQLite (dev/test fallback)
- python-dotenv
- dj-database-url
- psycopg[binary]

## Setup
1. cd backend
2. python -m venv .venv && source .venv/bin/activate (Linux/macOS) or .venv\Scripts\activate (Windows)
3. pip install -r requirements.txt
4. cp .env.example .env (update values)
5. python manage.py migrate
6. python manage.py runserver

## Testing
- Run all tests: python manage.py test
- Verbose: python manage.py test -v 2
- Specific app: python manage.py test candidates

## Migrations
- Check: python manage.py makemigrations --check --dry-run
- Create/apply: python manage.py makemigrations && python manage.py migrate

## API Endpoints
- GET/POST /api/candidates/
- GET/PUT/PATCH/DELETE /api/candidates/{id}/
- GET /api/dashboard/
- GET /api/health/
- /admin/

Search/filter/order: ?search=...&stage=...&applied_role=...&ordering=-created_at&page=1

## Notes
- SQLite fallback if DATABASE_URL not set (dev/tests). For production use PostgreSQL.
- CORS configured via CORS_ALLOWED_ORIGINS env var.
- All 29 backend tests pass.
