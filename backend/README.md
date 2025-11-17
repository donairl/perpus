# Perpus Backend API

FastAPI backend with SQLAlchemy for the library management system.

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or use a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Seed Database

```bash
python seed_data.py
```

This creates:
- SQLite database with sample books and members
- Admin user (username: `admin`, password: `admin123`)

### 3. Run Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user info

### Books
- `GET /api/books/` - List all books (with filters: category, status, search)
- `GET /api/books/{id}` - Get book by ID
- `POST /api/books/` - Create new book
- `PUT /api/books/{id}` - Update book
- `DELETE /api/books/{id}` - Delete book
- `GET /api/books/stats/summary` - Get book statistics

### Members
- `GET /api/members/` - List all members (with filters: status, search)
- `GET /api/members/{id}` - Get member by ID
- `POST /api/members/` - Create new member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member
- `GET /api/members/stats/summary` - Get member statistics

### Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Authentication

All endpoints (except `/api/auth/login` and `/api/auth/register`) require authentication.

Include the JWT token in requests:

```bash
Authorization: Bearer <your_token>
```

## Tech Stack

- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database
- **Pydantic** - Data validation
- **python-jose** - JWT tokens
- **passlib** - Password hashing