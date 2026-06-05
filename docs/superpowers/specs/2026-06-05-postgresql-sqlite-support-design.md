# Design: PostgreSQL / SQLite Dual-Database Support

**Date:** 2026-06-05
**Status:** Approved

## Summary

Add PostgreSQL support to the Perpus backend while keeping SQLite as the default. Users switch databases by setting `DATABASE_URL` in `.env`. No code changes required to switch — the app detects the driver from the URL automatically.

## Architecture

The connection string in `DATABASE_URL` determines which database is used:

- `sqlite:///./perpus.db` → SQLite (default, no setup needed)
- `postgresql://user:password@host:5432/dbname` → PostgreSQL

`config.py` already reads `DATABASE_URL` from `.env` via pydantic-settings. The only code change needed is in `database.py`.

## Changes

### `backend/app/database.py`

Remove the hardcoded SQLite-only `connect_args={"check_same_thread": False}`. Apply it conditionally — only when the URL scheme is `sqlite`:

```python
is_sqlite = settings.DATABASE_URL.startswith("sqlite")
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if is_sqlite else {}
)
```

Everything else (SessionLocal, Base, get_db) is unchanged.

### `backend/requirements.txt`

Add `psycopg2-binary` — the PostgreSQL driver. No version pin needed; latest stable is fine.

### `backend/.env.example` (new file)

Documents both options for new contributors:

```
# SQLite (default — no setup needed)
DATABASE_URL=sqlite:///./perpus.db

# PostgreSQL (uncomment and fill in to switch)
# DATABASE_URL=postgresql://user:password@localhost:5432/perpus
```

### `backend/.env` (create if absent)

Pre-filled with the SQLite default so local dev works with zero configuration:

```
DATABASE_URL=sqlite:///./perpus.db
```

### `backend/README.md`

Add a "Database Configuration" section explaining:
- Default is SQLite, no setup needed
- To use PostgreSQL: copy `.env.example` to `.env`, uncomment and fill in the PostgreSQL URL
- Run `uv pip install -r requirements.txt` after switching to install psycopg2-binary

## What Does NOT Change

- `config.py` — already correct
- All routers, models, schemas, auth — fully database-agnostic
- `seed_data.py` — works with both databases unchanged
- Table creation via `Base.metadata.create_all()` — SQLAlchemy handles dialect differences automatically

## Out of Scope

- Alembic migrations (not needed for this change; `create_all` handles schema for both)
- Async drivers (asyncpg / aiosqlite) — current codebase is synchronous
- Multiple simultaneous databases

## Success Criteria

- Running with default `.env` (SQLite URL) works identically to current behavior
- Setting `DATABASE_URL=postgresql://...` in `.env` and restarting the server connects to PostgreSQL
- `uv run python -m app.seed_data` works against both databases
