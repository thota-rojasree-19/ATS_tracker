# EarlyJobs.ai ATS

A Mini Applicant Tracking System (ATS) built to streamline the recruitment process.

## Technology Stack

### Frontend
- [React](https://react.dev/) + [Vite](https://vitejs.dev/) (JavaScript)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)
- [React Router DOM](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/)

### Backend
- [Django](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)
- [Django Filter](https://django-filter.readthedocs.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [psycopg](https://www.psycopg.org/)

## Project Structure

```text
earlyjobs-ats/
├── backend/      # Django REST API
├── frontend/     # React + Vite frontend
├── docs/         # Documentation
└── README.md
```

## Initial Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Getting Started

1. Start PostgreSQL service
2. Set up both backend and frontend following the steps above
3. Access frontend at `http://localhost:5173`
4. Access backend API at `http://localhost:8000`

## Production Deployment

### Render (Django API)

Configure the Render service with the `backend` directory as its root and use:

- Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- Start command: `gunicorn config.wsgi:application`
- Confirm the service's connected repository and deploy branch include the commit being released.
- Environment variables:
  - `DEBUG=False`
  - `SECRET_KEY` set to a newly generated private value
  - `JWT_SECRET_KEY` set to a separate private signing value
  - `ALLOWED_HOSTS=earlyjobs-ats-backend.onrender.com`
  - `DATABASE_URL` set to the existing Neon PostgreSQL connection string
  - `CORS_ALLOWED_ORIGINS=https://ats-tracker-7voz.vercel.app` (comma-separated list if additional exact origins are needed)
  - `CSRF_TRUSTED_ORIGINS=https://ats-tracker-7voz.vercel.app` (add an exact preview origin only when cookie-authenticated unsafe requests need it)
  - `AUTH_COOKIE_SECURE=True`

The backend also allows Vercel preview hosts matching only this project's `ats-tracker-*-thota-rojasrees-projects.vercel.app` deployment pattern. Other origins are not allowed, and wildcard CORS is disabled. Do not set `CORS_ALLOW_ALL_ORIGINS`.

Run `python manage.py migrate` as a Render pre-deploy command when deploying new migrations. Do not replace the Neon database or run destructive database commands. If introducing or changing `JWT_SECRET_KEY`, existing sessions will need to sign in again.

### Vercel (React frontend)

Set the Vercel project root directory to `frontend`, confirm its Production Branch includes the commit being released, and configure this environment variable for the Production environment:

```text
VITE_API_BASE_URL=https://earlyjobs-ats-backend.onrender.com/api
```

Redeploy after changing environment variables; Vite embeds them at build time. The production build also falls back to this API URL if the variable is missing. Local development continues to use `http://localhost:8000/api`.

## Notes

- Candidate and dashboard APIs require an approved, verified user session.
- The `/api/` index is protected by default; use `/api/health/` for an unauthenticated service check.
