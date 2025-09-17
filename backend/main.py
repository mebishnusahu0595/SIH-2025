from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from routes import chat, sessions, screening, journal, counselors, admin
from database import init_db
from middleware.rate_limit import RateLimitMiddleware
from middleware.logging import LoggingMiddleware

# Load environment variables
load_dotenv()

# Debug: Print environment variable loading
print(f"🔍 Main.py Debug: GEMINI_API_KEY loaded: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")
if os.getenv('GEMINI_API_KEY'):
    print(f"🔍 Main.py Debug: API Key: {os.getenv('GEMINI_API_KEY')[:10]}...")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="MindSupport API",
    description="Backend API for Digital Mental Health & Psychological Support Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://mindsupport.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Custom middleware
app.add_middleware(RateLimitMiddleware)
app.add_middleware(LoggingMiddleware)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(sessions.router, prefix="/api/session", tags=["Sessions"])
app.include_router(screening.router, prefix="/api/screening", tags=["Screening"])
app.include_router(journal.router, prefix="/api/journal", tags=["Journal"])
app.include_router(counselors.router, prefix="/api/counselors", tags=["Counselors"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "MindSupport API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "version": "1.0.0"
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "path": request.url.path
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True if os.getenv("ENVIRONMENT") != "production" else False
    )