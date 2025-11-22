"""
Simple FastAPI Backend Test for AI Interview Practice Partner
Basic version to test server startup and API availability
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Interview Practice Partner",
    description="Backend API for AI-powered interview practice",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI Interview Practice Partner Backend", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check for monitoring"""
    return {
        "status": "healthy",
        "service": "interview-practice-backend",
        "version": "1.0.0"
    }

@app.get("/test-ai")
async def test_ai():
    """Test AI service availability"""
    try:
        # Import here to check if AI service can be imported
        from services.gemini_service import GeminiService
        
        # Test basic initialization
        gemini_service = GeminiService()
        
        return {
            "status": "success",
            "message": "AI service is available",
            "service": "gemini-1.5-flash"
        }
    except Exception as e:
        logger.error(f"AI service test failed: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"AI service unavailable: {str(e)}"
            }
        )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

if __name__ == "__main__":
    logger.info("Starting AI Interview Practice Partner Backend...")
    logger.info("Server will be available at: http://localhost:8000")
    logger.info("API documentation available at: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )