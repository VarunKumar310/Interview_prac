"""
Application settings and configuration management
Uses pydantic-settings for environment variable handling
"""

from pydantic_settings import BaseSettings
from typing import List
import os
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Basic FastAPI settings
    app_name: str = "AI Interview Practice Partner"
    app_version: str = "1.0.0"
    debug_mode: bool = False
    
    # Server configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS settings
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",  # Additional frontend ports
        "https://your-frontend-domain.com"  # Replace with actual domain
    ]
    
    # Google AI (Gemini) settings
    google_ai_api_key: str = ""
    gemini_model_name: str = "gemini-1.5-flash"
    gemini_temperature: float = 0.7
    gemini_max_tokens: int = 2048
    
    # Interview configuration
    default_question_count: int = 10
    max_question_count: int = 20
    min_answer_length: int = 10
    max_answer_length: int = 5000
    session_timeout_minutes: int = 120
    
    # Data storage
    data_directory: str = "data"
    session_storage_path: str = "data/sessions"
    reports_storage_path: str = "data/reports"
    
    # Logging configuration
    log_level: str = "INFO"
    log_file_path: str = "logs/app.log"
    
    # Security settings
    secret_key: str = "your-secret-key-here-change-in-production"
    access_token_expire_minutes: int = 30
    
    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window_minutes: int = 15
    
    # API documentation
    docs_url: str = "/docs"
    redoc_url: str = "/redoc"
    openapi_url: str = "/openapi.json"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Ensure required directories exist
        os.makedirs(self.data_directory, exist_ok=True)
        os.makedirs(self.session_storage_path, exist_ok=True)
        os.makedirs(self.reports_storage_path, exist_ok=True)
        os.makedirs("logs", exist_ok=True)
        
        # Validate Google AI API key
        if not self.google_ai_api_key:
            print("⚠️  WARNING: GOOGLE_AI_API_KEY not set. Set it in .env file or environment variables.")
            print("   Get your API key from: https://makersuite.google.com/app/apikey")

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Interview-specific configuration
class InterviewConfig:
    """Interview flow configuration"""
    
    DIFFICULTY_LEVELS = {
        "easy": {
            "description": "Basic level questions",
            "question_complexity": "fundamental",
            "expected_duration_minutes": 20
        },
        "medium": {
            "description": "Moderate difficulty questions", 
            "question_complexity": "intermediate",
            "expected_duration_minutes": 30
        },
        "hard": {
            "description": "Advanced level questions",
            "question_complexity": "advanced", 
            "expected_duration_minutes": 45
        },
        "expert": {
            "description": "Expert level challenges",
            "question_complexity": "expert",
            "expected_duration_minutes": 60
        }
    }
    
    EXPERIENCE_LEVELS = {
        "0": "Fresh Graduate/Entry Level",
        "0-1": "0-1 Years Experience", 
        "1-2": "1-2 Years Experience",
        "2-3": "2-3 Years Experience",
        "3-5": "3-5 Years Experience", 
        "5+": "5+ Years Experience"
    }
    
    QUESTION_TYPES = {
        "technical": "Technical knowledge and skills",
        "behavioral": "Behavioral and situational questions",
        "situational": "Problem-solving scenarios",
        "resume-specific": "Questions based on resume/experience"
    }
    
    JOB_ROLES = [
        "Software Engineer", "Frontend Developer", "Backend Developer",
        "Full Stack Developer", "Machine Learning Engineer", "Data Scientist",
        "AI Engineer", "DevOps Engineer", "Cloud Engineer", 
        "Cybersecurity Analyst", "QA/Test Engineer", "Mobile App Developer",
        "UI/UX Designer", "Product Manager", "Data Analyst",
        "Blockchain Developer", "Game Developer", "Network Engineer",
        "Database Administrator", "IT Support Engineer", 
        "Site Reliability Engineer", "Embedded Systems Engineer",
        "Big Data Engineer", "Business Analyst"
    ]

# AI Service configuration
class AIConfig:
    """AI service configuration"""
    
    SAFETY_SETTINGS = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}, 
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
    ]
    
    GENERATION_CONFIG = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 2048
    }
    
    RETRY_CONFIG = {
        "max_retries": 3,
        "retry_delay": 1,
        "backoff_factor": 2
    }

# Database configuration (if using database in future)
class DatabaseConfig:
    """Database configuration for future use"""
    
    # SQLite for development
    SQLITE_URL = "sqlite:///./interview_data.db"
    
    # PostgreSQL for production
    # POSTGRES_URL = "postgresql://user:password@localhost/interview_db"
    
    # Connection settings
    POOL_SIZE = 10
    MAX_OVERFLOW = 20
    POOL_TIMEOUT = 30