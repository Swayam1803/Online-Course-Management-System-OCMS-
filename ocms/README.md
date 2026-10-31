# OCMS — Online Course Management System

A full-stack LMS built from the SRS document (Swayam Kumar, Thakur College of Engineering & Technology, v1.0).

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, Axios  |
| Backend   | Python Flask, Flask-JWT-Extended  |
| Database  | SQLite (dev) / PostgreSQL (prod)  |
| Auth      | JWT + bcrypt                      |
| Styling   | Pure CSS with design variables    |

---

## Project Structure

```
ocms/
├── backend/
│   ├── app.py              ← Flask app factory + DB seeder
│   ├── extensions.py       ← SQLAlchemy & JWT init
│   ├── models.py           ← DB models (User, Course, Enrollment, Assignment, Submission, Content)
│   ├── requirements.txt
│   └── routes/
│       ├── auth.py         ← POST /api/auth/login|register, GET /api/auth/me
│       ├── courses.py      ← CRUD /api/courses/
│       ├── enrollments.py  ← /api/enrollments/
│       ├── assignments.py  ← /api/assignments/
│       ├── users.py        ← /api/users/
│       └── analytics.py    ← /api/analytics/
│
└── frontend/
    ├── package.json
    └── src/
        ├── App.js                    ← Router + layout
        ├── index.js                  ← React entry
        ├── styles/
        │   └── globals.css           ← Full design system
        ├── context/
        │   └── AuthContext.js        ← JWT auth state
        ├── utils/
        │   └── api.js                ← Axios client + API modules
        ├── components/
        │   ├── Navbar.js
        │   ├── CourseCard.js
        │   ├── StatCard.js
        │   └── ProtectedRoute.js
        └── pages/
            ├── HomePage.js
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── CatalogPage.js
            ├── CourseDetailPage.js
            ├── StudentDashboard.js
            ├── InstructorDashboard.js
            └── AdminDashboard.js
```

---

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# API runs on http://localhost:5000
# SQLite DB created automatically at backend/ocms.db
# Demo data seeded on first run
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## Demo Accounts (auto-seeded)

| Role       | Email             | Password     |
|------------|-------------------|--------------|
| Admin      | admin@ocms.edu    | password123  |
| Instructor | priya@ocms.edu    | password123  |
| Instructor | arjun@ocms.edu    | password123  |
| Student    | riya@ocms.edu     | password123  |
| Student    | aryan@ocms.edu    | password123  |

---

## API Endpoints

### Auth
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| POST   | /api/auth/register    | Register new user   |
| POST   | /api/auth/login       | Login, get JWT      |
| GET    | /api/auth/me          | Current user info   |

### Courses
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| GET    | /api/courses/                     | List courses (filter/search) |
| GET    | /api/courses/:id                  | Course detail + content  |
| POST   | /api/courses/                     | Create course (instructor) |
| PUT    | /api/courses/:id                  | Update course            |
| DELETE | /api/courses/:id                  | Delete / archive course  |
| GET    | /api/courses/categories           | All categories           |
| GET    | /api/courses/instructor/my-courses| Instructor's courses     |

### Enrollments
| Method | Endpoint                                  | Description           |
|--------|-------------------------------------------|-----------------------|
| POST   | /api/enrollments/                         | Enroll in course      |
| GET    | /api/enrollments/my-enrollments           | Student's enrollments |
| PUT    | /api/enrollments/:id/progress             | Update progress       |
| GET    | /api/enrollments/course/:id/students      | Course student list   |

### Assignments
| Method | Endpoint                                       | Description           |
|--------|------------------------------------------------|-----------------------|
| GET    | /api/assignments/course/:id                    | Assignments by course |
| POST   | /api/assignments/                              | Create assignment     |
| POST   | /api/assignments/:id/submit                    | Submit assignment     |
| PUT    | /api/assignments/:id/grade/:sub_id             | Grade submission      |
| GET    | /api/assignments/:id/submissions               | List submissions      |

### Analytics
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/analytics/admin/overview   | Admin stats              |
| GET    | /api/analytics/instructor/overview | Instructor stats      |
| GET    | /api/analytics/student/overview | Student stats            |

---

## Features Implemented (mapped to SRS)

| SRS Requirement | Implemented |
|-----------------|-------------|
| REQ-4.1.1 Course creation with title/description/category | ✅ |
| REQ-4.1.3 Admin course approval workflow | ✅ |
| REQ-4.2.1 Browse course catalog | ✅ |
| REQ-4.2.2 Enroll button (free/paid) | ✅ |
| REQ-4.2.3 Enrollment confirmation | ✅ (API response) |
| REQ-4.3.2 Track viewed/read status | ✅ (progress tracking) |
| REQ-4.4.1 Assignment file submission with deadline | ✅ |
| REQ-4.4.2 Instructor grades + feedback | ✅ |
| REQ-4.5.1 Gradebook for instructors | ✅ |
| REQ-4.5.2 Progress bar for students | ✅ |
| REQ-5.2 RBAC (admin/instructor/student/guest) | ✅ |
| REQ-5.3 JWT authentication, HTTPS-ready | ✅ |
| REQ-6.1.1 Archive instead of delete if enrolled | ✅ |
| REQ-6.1.2 DECIMAL for monetary values | ✅ |

---

## Production Deployment

**Backend:** Switch `SQLALCHEMY_DATABASE_URI` to PostgreSQL in `.env`:
```
DATABASE_URL=postgresql://user:pass@host/ocms
SECRET_KEY=your-production-secret
JWT_SECRET_KEY=your-jwt-secret
```

**Frontend:** Set the API URL:
```
REACT_APP_API_URL=https://your-api-domain.com/api
```

Then `npm run build` and serve the `build/` folder via Nginx.
