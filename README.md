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

## Notes

- This project is in the initial setup phase
- Candidate management, APIs, and business logic will be added in subsequent phases
