"""
Interview management routes
Handles interview setup, question generation, and session management
"""

from fastapi import APIRouter, HTTPException, Depends
import logging
from typing import Optional

from models.api_models import *
from services.session_service import SessionService
from services.interview_service import InterviewService

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency functions
def get_session_service() -> SessionService:
    return SessionService()

def get_interview_service() -> InterviewService:
    return InterviewService()

@router.post("/create-session", response_model=APIResponse)
async def create_interview_session(
    user_email: Optional[str] = None,
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Create a new interview session"""
    try:
        session_id = await interview_service.create_interview_session(user_email)
        
        return APIResponse(
            success=True,
            message="Interview session created successfully",
            data={"session_id": session_id}
        )
        
    except Exception as e:
        logger.error(f"Session creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create interview session")

@router.post("/setup", response_model=QuestionGenerationResponse)
async def setup_interview(
    request: StartInterviewRequest,
    interview_service: InterviewService = Depends()
):
    """Setup complete interview with role, experience, difficulty and generate questions"""
    try:
        # Create new session
        session_id = await interview_service.create_interview_session()
        
        # Setup interview with all parameters
        response = await interview_service.setup_interview(
            session_id=session_id,
            role=request.role,
            experience_level=request.experience_level.value,
            difficulty=request.difficulty.value,
            resume_text=request.resume_text,
            question_count=request.question_count
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Interview setup failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to setup interview: {str(e)}")

@router.post("/set-role", response_model=APIResponse)
async def set_interview_role(
    request: RoleRequest,
    session_service: SessionService = Depends()
):
    """Set interview role (legacy endpoint for frontend compatibility)"""
    try:
        # For legacy compatibility, create session if not exists
        session_id = await session_service.create_session()
        success = await session_service.set_interview_role(session_id, request.role)
        
        if success:
            return APIResponse(
                success=True,
                message="Role set successfully",
                data={"session_id": session_id, "role": request.role}
            )
        else:
            raise HTTPException(status_code=400, detail="Failed to set role")
            
    except Exception as e:
        logger.error(f"Set role failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to set interview role")

@router.post("/set-experience", response_model=APIResponse)
async def set_experience_level(
    request: ExperienceRequest,
    session_service: SessionService = Depends()
):
    """Set experience level (legacy endpoint)"""
    try:
        # For legacy compatibility, create session if not exists
        session_id = await session_service.create_session()
        success = await session_service.set_experience_level(session_id, request.experience.value)
        
        if success:
            return APIResponse(
                success=True,
                message="Experience level set successfully",
                data={"session_id": session_id, "experience": request.experience.value}
            )
        else:
            raise HTTPException(status_code=400, detail="Failed to set experience level")
            
    except Exception as e:
        logger.error(f"Set experience failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to set experience level")

@router.post("/set-difficulty", response_model=APIResponse)
async def set_difficulty_level(
    request: DifficultyRequest,
    session_service: SessionService = Depends()
):
    """Set difficulty level (legacy endpoint)"""
    try:
        # For legacy compatibility, create session if not exists
        session_id = await session_service.create_session()
        success = await session_service.set_difficulty(session_id, request.difficulty.value)
        
        if success:
            return APIResponse(
                success=True,
                message="Difficulty set successfully",
                data={"session_id": session_id, "difficulty": request.difficulty.value}
            )
        else:
            raise HTTPException(status_code=400, detail="Failed to set difficulty")
            
    except Exception as e:
        logger.error(f"Set difficulty failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to set difficulty level")

@router.post("/set-resume", response_model=APIResponse)
async def set_resume_text(
    request: ResumeUploadRequest,
    session_id: str,
    session_service: SessionService = Depends()
):
    """Set resume text for interview session"""
    try:
        success = await session_service.set_resume(session_id, request.resume_text)
        
        if success:
            return APIResponse(
                success=True,
                message="Resume uploaded successfully",
                data={"session_id": session_id, "resume_length": len(request.resume_text)}
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid session ID")
            
    except Exception as e:
        logger.error(f"Resume upload failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload resume")

@router.get("/next-question/{session_id}", response_model=Optional[InterviewQuestion])
async def get_next_question(
    session_id: str,
    interview_service: InterviewService = Depends()
):
    """Get the next question in the interview"""
    try:
        question = await interview_service.get_next_question(session_id)
        return question
        
    except Exception as e:
        logger.error(f"Get next question failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get next question")

@router.get("/progress/{session_id}", response_model=APIResponse)
async def get_interview_progress(
    session_id: str,
    interview_service: InterviewService = Depends()
):
    """Get interview progress information"""
    try:
        progress = await interview_service.get_interview_progress(session_id)
        
        if progress:
            return APIResponse(
                success=True,
                message="Progress retrieved successfully",
                data=progress
            )
        else:
            raise HTTPException(status_code=404, detail="Session not found")
            
    except Exception as e:
        logger.error(f"Get progress failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get interview progress")

@router.post("/generate-questions", response_model=QuestionGenerationResponse)
async def generate_interview_questions(
    session_id: str,
    question_count: int = 10,
    interview_service: InterviewService = Depends(),
    session_service: SessionService = Depends()
):
    """Generate questions for existing session"""
    try:
        # Get session data
        session_data = await session_service.get_session(session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Setup interview with existing session data
        response = await interview_service.setup_interview(
            session_id=session_id,
            role=session_data.get("role", "Software Engineer"),
            experience_level=session_data.get("experience_level", "1-2"),
            difficulty=session_data.get("difficulty", "medium"),
            resume_text=session_data.get("resume_text"),
            question_count=question_count
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Question generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate questions")

@router.delete("/session/{session_id}", response_model=APIResponse)
async def delete_interview_session(
    session_id: str,
    session_service: SessionService = Depends()
):
    """Delete an interview session"""
    try:
        success = await session_service.delete_session(session_id)
        
        if success:
            return APIResponse(
                success=True,
                message="Session deleted successfully"
            )
        else:
            raise HTTPException(status_code=404, detail="Session not found")
            
    except Exception as e:
        logger.error(f"Session deletion failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete session")

@router.get("/sessions/stats", response_model=APIResponse)
async def get_session_statistics(
    session_service: SessionService = Depends()
):
    """Get session statistics for monitoring"""
    try:
        stats = await session_service.get_session_statistics()
        
        return APIResponse(
            success=True,
            message="Statistics retrieved successfully",
            data=stats
        )
        
    except Exception as e:
        logger.error(f"Get statistics failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get session statistics")