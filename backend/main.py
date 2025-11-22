"""
FastAPI Backend for AI Interview Practice Partner
Features: Question Generation, Answer Evaluation, Report Generation, User Management
AI Provider: Google Gemini (Google AI SDK)
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from contextlib import asynccontextmanager

# Import our modules
from config.settings import get_settings
from services.gemini_service import GeminiService
from services.session_service import SessionService
from services.interview_service import InterviewService
from routes import auth, interview, evaluation, reports, user_questions
from models.api_models import *

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# Initialize services (will be available globally)
gemini_service = GeminiService()
session_service = SessionService()
interview_service = InterviewService(gemini_service, session_service)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("🚀 Starting AI Interview Backend...")
    logger.info("🤖 Initializing Gemini AI Service...")
    
    # Verify Gemini connection
    try:
        await gemini_service.test_connection()
        logger.info("✅ Gemini AI connection successful")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Gemini AI: {e}")
        raise HTTPException(status_code=500, detail="AI service unavailable")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AI Interview Backend...")

# Create FastAPI app
app = FastAPI(
    title="AI Interview Practice Partner API",
    description="FastAPI + Google Gemini backend for intelligent interview practice",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware - Allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,  # React app URLs
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint to verify backend status"""
    return {
        "status": "healthy",
        "service": "AI Interview Backend",
        "ai_provider": "Google Gemini",
        "version": "1.0.0"
    }

# Dependency injection for services
async def get_gemini_service() -> GeminiService:
    return gemini_service

async def get_session_service() -> SessionService:
    return session_service

async def get_interview_service() -> InterviewService:
    return interview_service

# Include all route modules
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview Management"])
app.include_router(evaluation.router, prefix="/api/evaluation", tags=["Answer Evaluation"])
app.include_router(reports.router, prefix="/api/reports", tags=["Report Generation"])
app.include_router(user_questions.router, prefix="/api/questions", tags=["General Questions"])

# Legacy endpoints for frontend compatibility
@app.post("/login")
async def login_legacy(request: LoginRequest):
    """Legacy login endpoint for frontend compatibility"""
    return await auth.login(request)

@app.post("/set-role") 
async def set_role_legacy(request: RoleRequest, session_service: SessionService = Depends(get_session_service)):
    """Legacy role setting endpoint"""
    return await interview.set_interview_role(request, session_service)

@app.post("/set-experience")
async def set_experience_legacy(request: ExperienceRequest, session_service: SessionService = Depends(get_session_service)):
    """Legacy experience setting endpoint"""
    return await interview.set_experience_level(request, session_service)

@app.post("/set-difficulty")
async def set_difficulty_legacy(request: DifficultyRequest, session_service: SessionService = Depends(get_session_service)):
    """Legacy difficulty setting endpoint"""
    return await interview.set_difficulty_level(request, session_service)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "🎯 AI Interview Practice Partner Backend",
        "ai_provider": "Google Gemini",
        "framework": "FastAPI",
        "status": "Running",
        "docs": "/docs"
    }

if __name__ == "__main__":
    logger.info("🎯 Starting AI Interview Backend Server...")
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug_mode,
        log_level="info"
    )