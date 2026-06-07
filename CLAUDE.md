# Perpus — Project Instructions

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Language | TypeScript | 5.2.x |
| Frontend Framework | React + React Router v6 | 18.2 / 6.20 |
| Frontend Build | Vite | 5.0.x |
| Backend Language | Python | 3.x (via ~/venv) |
| Backend Framework | FastAPI + SQLAlchemy 2.0 | 0.115 / 2.0 |
| Auth | JWT (python-jose) + passlib pbkdf2_sha256 | - |
| Database | SQLite (default) / PostgreSQL (env-switch) | - |
| Testing | pytest | backend only |
| Package manager | bun (frontend), pip in ~/venv (backend) | - |

## Build & Run

```bash
# Frontend dev server (http://localhost:5173)
cd frontend && bun run dev

# Frontend production build
cd frontend && bun run build

# Backend dev server (http://localhost:8000)
cd backend && /home/donairl/venv/bin/uvicorn app.main:app --reload

# Backend tests
cd backend && /home/donairl/venv/bin/pytest

# Switch database: edit backend/.env
# DATABASE_URL=sqlite:///./perpus.db          # default
# DATABASE_URL=postgresql://user:pw@host/db   # PostgreSQL
```

## Project Structure

```
frontend/
  src/
    pages/          → Route-level components (one file per page)
    components/     → Reusable UI + modals
    services/api.ts → ALL fetch calls and TypeScript types — single source of truth
  index.html
  vite.config.ts
  tsconfig.json
  package.json
backend/app/
  main.py         → FastAPI app, CORS, router registration
  models.py       → SQLAlchemy ORM (Book, Member, User, Transaction)
  schemas.py      → Pydantic request/response schemas
  database.py     → Engine + session + SQLite/Postgres detection
  config.py       → Env-based settings via pydantic-settings
  auth.py         → JWT validation + password hashing (dependency injected)
  routers/        → REST endpoints by domain (auth, books, members, transactions, reports)
backend/tests/    → pytest unit tests
```

## Code Conventions

- **Frontend files**: PascalCase for React components (`Reports.tsx`), camelCase for functions
- **CSS classes**: kebab-case, one CSS file per page/component
- **Backend**: snake_case everywhere (Python)
- **Commits**: conventional commits — `feat:`, `fix:`, `chore:`, `docs:`

## Adding a New API Endpoint

1. Add handler to relevant `backend/app/routers/*.py` (or create new router)
2. If new router: import and `app.include_router()` in `main.py`
3. Add fetch function + TypeScript types to `frontend/src/services/api.ts`
4. Use `getHeaders()` + `handleApiResponse()` from `api.ts` — handles auth + 401

## Adding a New Page

1. Create `frontend/src/pages/MyPage.tsx` + `frontend/src/pages/MyPage.css`
2. Add `<NavLink>` entry in `frontend/src/components/Layout.tsx`
3. Add `<Route path="mypage" element={<MyPage />} />` inside the Layout route in `frontend/src/App.tsx`
4. Import the component in `App.tsx`

## Testing

- Backend test file convention: `backend/tests/test_*.py`
- Run: `cd backend && /home/donairl/venv/bin/pytest`
- No frontend test framework configured

## Error Handling

- **Backend**: `raise HTTPException(status_code=4xx, detail="message")`
- **Frontend**: `handleApiResponse(response)` auto-redirects on 401; catch errors in `try/catch` and set local error state

## Auth Flow

All API endpoints (except `/api/auth/login`, `/api/auth/register`) require `Depends(auth.get_current_user)`.
Frontend stores JWT in localStorage via `setAuthToken()`, sends as `Authorization: Bearer <token>`.
Token expires in 8 hours (dev setting).
