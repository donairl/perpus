# Perpus Backend API

FastAPI backend with SQLAlchemy for the library management system.

## Setup

### 1. Install Dependencies with uv

Install [uv](https://docs.astral.sh/uv/) if you haven't already:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then install project dependencies:

```bash
cd backend
uv pip install -r requirements.txt
```

Or sync all dependencies in one step:

```bash
uv sync
```

### 2. Seed Database

```bash
uv run python -m app.seed_data
```

This creates:
- SQLite database with sample books and members
- Admin user (username: `admin`, password: `admin123`)
- Librarian user (username: `librarian`, password: `lib123`)

### 3. Run Server

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000`

## Database Configuration

The app reads `DATABASE_URL` from `backend/.env`. SQLite is the default — no setup needed.

### SQLite (default)

```env
DATABASE_URL=sqlite:///./perpus.db
```

### PostgreSQL

1. Create a PostgreSQL database:
   ```bash
   createdb perpus
   ```

2. Set the connection URL in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/perpus
   ```

3. Reinstall dependencies (includes `psycopg2-binary`):
   ```bash
   uv pip install -r requirements.txt
   ```

4. Seed the database and start the server as normal:
   ```bash
   uv run python -m app.seed_data
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

Tables are created automatically on first run via SQLAlchemy — no migration step needed.

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

### Borrows
- `GET /api/borrows/` - List all borrow records
- `POST /api/borrows/` - Create borrow record
- `PUT /api/borrows/{id}/return` - Return a book

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
- **SQLite / PostgreSQL** - Database (configurable via `DATABASE_URL`)
- **Pydantic** - Data validation
- **python-jose** - JWT tokens
- **passlib** - Password hashing
- **uv** - Fast Python package manager
