from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, books, members, transactions, reports, fines, categories
from app.routers import settings as app_settings
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Perpus Library Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(members.router, prefix="/api/members", tags=["members"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(fines.router, prefix="/api/fines", tags=["fines"])
app.include_router(app_settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])

@app.get("/")
async def root():
    return {"message": "Perpus Library Management API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}