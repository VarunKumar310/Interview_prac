"""
Pydantic models for API requests and responses
Used for data validation, serialization, and API documentation
"""

from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from enum import Enum

# ================= ENUMS =================

class ExperienceLevel(str, Enum):
    FRESHER = "0"
    ZERO_TO_ONE = "0-1"
    ONE_TO_TWO = "1-2"
    TWO_TO_THREE = "2-3"
    THREE_TO_FIVE = "3-5"
    FIVE_PLUS = "5+"

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"

class QuestionType(str, Enum):
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    SITUATIONAL = "situational"
    RESUME_SPECIFIC = "resume-specific"

class InterviewStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ABANDONED = "abandoned"

# ================= REQUEST MODELS =================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class RoleRequest(BaseModel):
    role: str = Field(..., min_length=2, max_length=100)

class ExperienceRequest(BaseModel):
    experience: ExperienceLevel

class DifficultyRequest(BaseModel):
    difficulty: DifficultyLevel

class ResumeUploadRequest(BaseModel):
    resume_text: str = Field(..., min_length=100)
    file_name: Optional[str] = None

class StartInterviewRequest(BaseModel):
    role: str
    experience_level: ExperienceLevel
    difficulty: DifficultyLevel
    resume_text: Optional[str] = None
    question_count: int = Field(default=10, ge=5, le=20)

class AnswerSubmissionRequest(BaseModel):
    session_id: str
    question_id: int
    question_text: str
    answer_text: str = Field(..., min_length=10)
    response_time_seconds: Optional[int] = None

class GeneralQuestionRequest(BaseModel):
    question: str = Field(..., min_length=5, max_length=500)
    context: Optional[str] = None

class ReportGenerationRequest(BaseModel):
    session_id: str
    include_detailed_analysis: bool = True
    format_type: str = Field(default="json", pattern="^(json|pdf)$")

# ================= RESPONSE MODELS =================

class LoginResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[str] = None
    session_token: Optional[str] = None

class InterviewQuestion(BaseModel):
    id: int
    question: str
    type: QuestionType
    difficulty: DifficultyLevel
    follow_ups: List[str] = []
    evaluation_criteria: List[str] = []
    expected_topics: List[str] = []

class QuestionGenerationResponse(BaseModel):
    success: bool
    session_id: str
    questions: List[InterviewQuestion]
    total_questions: int
    estimated_duration_minutes: int

class AnswerEvaluationScores(BaseModel):
    technical_accuracy: int = Field(..., ge=0, le=100)
    communication_clarity: int = Field(..., ge=0, le=100)
    depth_of_knowledge: int = Field(..., ge=0, le=100)
    problem_solving: int = Field(..., ge=0, le=100)
    confidence: int = Field(..., ge=0, le=100)

class AnswerEvaluationResponse(BaseModel):
    success: bool
    overall_score: int = Field(..., ge=0, le=100)
    scores: AnswerEvaluationScores
    strengths: List[str]
    weaknesses: List[str]
    detailed_feedback: str
    improvement_suggestions: List[str]
    follow_up_questions: List[str]
    red_flags: List[str] = []
    positive_indicators: List[str] = []

class GeneralQuestionResponse(BaseModel):
    success: bool
    answer: str
    related_topics: List[str] = []

class InterviewSessionInfo(BaseModel):
    session_id: str
    role: str
    experience_level: ExperienceLevel
    difficulty: DifficultyLevel
    status: InterviewStatus
    created_at: datetime
    current_question_index: int
    total_questions: int
    average_score: float
    questions_answered: int

class QAPair(BaseModel):
    question_id: int
    question: str
    answer: str
    score: int
    evaluation: Optional[AnswerEvaluationResponse] = None
    answered_at: datetime

class CategoryScores(BaseModel):
    technical_skills: int = Field(..., ge=0, le=100)
    communication: int = Field(..., ge=0, le=100)
    problem_solving: int = Field(..., ge=0, le=100)
    cultural_fit: int = Field(..., ge=0, le=100)
    leadership_potential: int = Field(..., ge=0, le=100)

class FinalReportResponse(BaseModel):
    success: bool
    session_id: str
    executive_summary: str
    overall_rating: str  # "Strong Hire"|"Hire"|"No Hire"|"Strong No Hire"
    overall_score: int = Field(..., ge=0, le=100)
    category_scores: CategoryScores
    key_strengths: List[str]
    areas_for_improvement: List[str]
    detailed_analysis: str
    recommendation: str
    next_steps: List[str]
    interview_highlights: List[str]
    red_flags: List[str] = []
    salary_range_assessment: str
    generated_at: datetime
    qa_summary: List[QAPair] = []

# ================= DATABASE MODELS =================

class UserSession(BaseModel):
    """User session data model"""
    session_id: str
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    experience_level: Optional[ExperienceLevel] = None
    difficulty: Optional[DifficultyLevel] = None
    resume_text: Optional[str] = None
    created_at: datetime
    last_updated: datetime
    status: InterviewStatus = InterviewStatus.NOT_STARTED

class InterviewData(BaseModel):
    """Complete interview session data"""
    session_info: UserSession
    questions: List[InterviewQuestion]
    answers: List[QAPair] = []
    final_report: Optional[FinalReportResponse] = None

# ================= ERROR MODELS =================

class APIError(BaseModel):
    error: bool = True
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class ValidationError(BaseModel):
    error: bool = True
    message: str = "Validation failed"
    field_errors: List[Dict[str, str]]

# ================= UTILITY MODELS =================

class HealthCheckResponse(BaseModel):
    status: str = "healthy"
    service: str = "AI Interview Backend"
    ai_provider: str = "Google Gemini"
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=datetime.now)

class APIResponse(BaseModel):
    """Generic API response wrapper"""
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None
    error: Optional[str] = None

# ================= CONFIGURATION MODELS =================

class InterviewConfig(BaseModel):
    """Interview configuration settings"""
    default_question_count: int = 10
    max_question_count: int = 20
    min_answer_length: int = 10
    max_answer_length: int = 5000
    session_timeout_minutes: int = 120
    auto_save_interval_seconds: int = 30

class AIServiceConfig(BaseModel):
    """AI service configuration"""
    model_config = {"protected_namespaces": ()}
    
    model_name: str = "gemini-1.5-flash"
    temperature: float = 0.7
    max_tokens: int = 2048
    timeout_seconds: int = 30
    retry_attempts: int = 3