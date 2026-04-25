# Yapri KTA School Management System

A full-stack, comprehensive school management system built for Yapri KTA School.

## Features
- **Role-Based Access Control**: Admins, Teachers, and Students/Parents.
- **Authentication**: Secure JWT-based login.
- **Admin Dashboard**: Overview of students, teachers, classes, revenue, and notices.
- **Complete Management**:
  - Student & Teacher records
  - Classes & Sections
  - Attendance tracking
  - Fees and partial payments
  - Exams and marks
  - Notice board communications

## Technology Stack
- **Frontend**: React.js, Tailwind CSS, Vite, Axios, React Router, Lucide React
- **Backend**: Django, Django REST Framework, SimpleJWT
- **Database**: SQLite (configurable to PostgreSQL via `.env`)

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend Setup

1. Open a terminal and navigate to the project root.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-environ psycopg2-binary django-filter
   ```
4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```
5. Seed the database with initial test data:
   ```bash
   python manage.py seed
   ```
6. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 3. Usage

1. Open your browser and navigate to `http://localhost:5173`.
2. Login using one of the seeded test accounts:
   - **Admin**: `admin` / `admin123`
   - **Teacher**: `teacher1` / `password123`
   - **Student**: `student1` / `password123`

## Environment Variables
The `.env` file at the root contains backend configuration. You can change `DATABASE_URL` to point to a PostgreSQL database for production.

```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/dbname
```
