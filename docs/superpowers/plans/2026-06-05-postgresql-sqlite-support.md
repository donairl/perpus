# PostgreSQL / SQLite Dual-Database Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to switch between SQLite and PostgreSQL by setting `DATABASE_URL` in `.env`, with SQLite as the zero-config default.

**Architecture:** `config.py` already reads `DATABASE_URL` from `.env` via pydantic-settings. The only code fix is in `database.py` — `connect_args={"check_same_thread": False}` is SQLite-only and must be applied conditionally. A helper function `_get_connect_args(url)` isolates this logic so it can be unit tested without a real database.

**Tech Stack:** FastAPI, SQLAlchemy 2.0, pydantic-settings, psycopg2-binary (PostgreSQL driver), pytest

---

### Task 1: Add psycopg2-binary and pytest to requirements

**Files:**
- Modify: `backend/requirements.txt`

- [ ] **Step 1: Add dependencies to requirements.txt**

Open `backend/requirements.txt` and add two lines at the end:

```
psycopg2-binary
pytest
```

- [ ] **Step 2: Install with uv**

```bash
cd backend
uv pip install -r requirements.txt
```

Expected output includes lines like:
```
Installed psycopg2-binary-X.X.X
Installed pytest-X.X.X
```

- [ ] **Step 3: Verify psycopg2 is importable**

```bash
uv run python -c "import psycopg2; print('psycopg2 ok')"
```

Expected: `psycopg2 ok`

- [ ] **Step 4: Commit**

```bash
git add backend/requirements.txt
git commit -m "chore: add psycopg2-binary and pytest to requirements"
```

---

### Task 2: Extract and test connect_args logic in database.py

**Files:**
- Modify: `backend/app/database.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/test_database.py`

- [ ] **Step 1: Create tests directory**

```bash
mkdir -p backend/tests
touch backend/tests/__init__.py
```

- [ ] **Step 2: Write the failing test**

Create `backend/tests/test_database.py`:

```python
from app.database import _get_connect_args


def test_sqlite_url_returns_check_same_thread():
    args = _get_connect_args("sqlite:///./perpus.db")
    assert args == {"check_same_thread": False}


def test_sqlite_memory_url_returns_check_same_thread():
    args = _get_connect_args("sqlite:///:memory:")
    assert args == {"check_same_thread": False}


def test_postgresql_url_returns_empty_dict():
    args = _get_connect_args("postgresql://user:pass@localhost:5432/perpus")
    assert args == {}


def test_postgresql_plus_psycopg2_url_returns_empty_dict():
    args = _get_connect_args("postgresql+psycopg2://user:pass@localhost/perpus")
    assert args == {}
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd backend
uv run pytest tests/test_database.py -v
```

Expected: `ImportError` — `_get_connect_args` does not exist yet.

- [ ] **Step 4: Update database.py with the helper and conditional engine**

Replace the contents of `backend/app/database.py` with:

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings


def _get_connect_args(url: str) -> dict:
    return {"check_same_thread": False} if url.startswith("sqlite") else {}


engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_get_connect_args(settings.DATABASE_URL),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd backend
uv run pytest tests/test_database.py -v
```

Expected output:
```
tests/test_database.py::test_sqlite_url_returns_check_same_thread PASSED
tests/test_database.py::test_sqlite_memory_url_returns_check_same_thread PASSED
tests/test_database.py::test_postgresql_url_returns_empty_dict PASSED
tests/test_database.py::test_postgresql_plus_psycopg2_url_returns_empty_dict PASSED
4 passed
```

- [ ] **Step 6: Verify the server still starts with SQLite**

```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 &
sleep 2
curl -s http://localhost:8000/api/health
kill %1
```

Expected: `{"status":"healthy"}`

- [ ] **Step 7: Commit**

```bash
git add backend/app/database.py backend/tests/
git commit -m "fix: conditionally apply sqlite connect_args, add postgresql support"
```

---

### Task 3: Create .env.example and .env

**Files:**
- Create: `backend/.env.example`
- Create: `backend/.env`

- [ ] **Step 1: Create .env.example**

Create `backend/.env.example` with this exact content:

```
# Database configuration
# SQLite (default — no setup needed)
DATABASE_URL=sqlite:///./perpus.db

# PostgreSQL (uncomment and fill in to switch)
# DATABASE_URL=postgresql://user:password@localhost:5432/perpus

# Auth
SECRET_KEY=your-secret-key-here-change-in-production
```

- [ ] **Step 2: Create .env with SQLite default**

Create `backend/.env` with this exact content:

```
DATABASE_URL=sqlite:///./perpus.db
SECRET_KEY=your-secret-key-here-change-in-production
```

- [ ] **Step 3: Ensure .env is gitignored**

Check that `backend/.env` won't be committed:

```bash
cd backend
git check-ignore -v .env
```

If no output (not ignored), add it:

```bash
echo ".env" >> ../.gitignore
```

- [ ] **Step 4: Commit**

```bash
git add backend/.env.example
git commit -m "chore: add .env.example with sqlite and postgresql options"
```

Do NOT `git add backend/.env` — it must stay local.

---

### Task 4: Update README with database configuration section

**Files:**
- Modify: `backend/README.md`

- [ ] **Step 1: Add Database Configuration section**

In `backend/README.md`, add the following section after the `## Setup` section and before `## API Endpoints`:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/README.md
git commit -m "docs: add database configuration section to backend README"
```

---

## Verification Checklist

After all tasks are complete, run the full test suite:

```bash
cd backend
uv run pytest tests/ -v
```

Expected: 4 passed, 0 failed.

Confirm SQLite still works end-to-end:

```bash
uv run python -m app.seed_data
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000/docs` — Swagger UI should load with all endpoints visible.
