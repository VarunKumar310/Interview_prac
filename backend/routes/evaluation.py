"""
Answer evaluation routes
Handles answer submission, evaluation, and follow-up generation
"""

from fastapi import APIRouter, HTTPException, Depends
import logging

from models.api_models import *
from services.interview_service import InterviewService

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency functions
def get_interview_service() -> InterviewService:
    return InterviewService()

@router.post("/submit-answer", response_model=AnswerEvaluationResponse)
async def submit_and_evaluate_answer(
    request: AnswerSubmissionRequest,
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Submit an answer and get AI evaluation with scores and feedback"""
    try:
        evaluation = await interview_service.submit_answer(
            session_id=request.session_id,
            question_id=request.question_id,
            question_text=request.question_text,
            answer_text=request.answer_text,
            response_time_seconds=request.response_time_seconds
        )
        
        logger.info(f"Answer evaluated for session {request.session_id}, question {request.question_id}")
        return evaluation
        
    except ValueError as e:
        logger.error(f"Invalid request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Answer evaluation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate answer")

@router.post("/generate-followup", response_model=APIResponse)
async def generate_follow_up_question(
    session_id: str,
    original_question: str,
    answer: str,
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Generate an intelligent follow-up question based on the answer"""
    try:
        follow_up = await interview_service.generate_follow_up(
            session_id=session_id,
            original_question=original_question,
            answer=answer
        )
        
        return APIResponse(
            success=True,
            message="Follow-up question generated",
            data={"follow_up_question": follow_up}
        )
        
    except ValueError as e:
        logger.error(f"Invalid request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Follow-up generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate follow-up question")

@router.get("/evaluation-history/{session_id}", response_model=APIResponse)
async def get_evaluation_history(
    session_id: str,
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Get evaluation history for a session"""
    try:
        progress = await interview_service.get_interview_progress(session_id)
        
        if not progress:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Get session summary for detailed history
        from services.session_service import SessionService
        session_service = SessionService()
        summary = await session_service.get_interview_summary(session_id)
        
        if summary:
            return APIResponse(
                success=True,
                message="Evaluation history retrieved",
                data={
                    "session_id": session_id,
                    "answers": summary.get("answers", []),
                    "scores": summary.get("scores", {}),
                    "statistics": summary.get("statistics", {})
                }
            )
        else:
            raise HTTPException(status_code=404, detail="No evaluation history found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get evaluation history failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get evaluation history")

@router.post("/batch-evaluate", response_model=APIResponse)
async def batch_evaluate_answers(
    session_id: str,
    answers: List[Dict[str, Any]],
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Batch evaluate multiple answers (useful for bulk processing)"""
    try:
        evaluations = []
        
        for answer_data in answers:
            try:
                evaluation = await interview_service.submit_answer(
                    session_id=session_id,
                    question_id=answer_data.get("question_id"),
                    question_text=answer_data.get("question_text"),
                    answer_text=answer_data.get("answer_text"),
                    response_time_seconds=answer_data.get("response_time_seconds")
                )
                evaluations.append({
                    "question_id": answer_data.get("question_id"),
                    "success": True,
                    "evaluation": evaluation.dict()
                })
            except Exception as e:
                evaluations.append({
                    "question_id": answer_data.get("question_id"),
                    "success": False,
                    "error": str(e)
                })
        
        return APIResponse(
            success=True,
            message=f"Batch evaluation completed for {len(evaluations)} answers",
            data={"evaluations": evaluations}
        )
        
    except Exception as e:
        logger.error(f"Batch evaluation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to process batch evaluation")

@router.get("/scoring-criteria", response_model=APIResponse)
async def get_scoring_criteria():
    """Get detailed explanation of scoring criteria"""
    criteria = {
        "technical_accuracy": {
            "description": "Correctness of technical information and concepts",
            "weight": 25,
            "factors": ["Factual accuracy", "Technical depth", "Industry knowledge", "Best practices"]
        },
        "communication_clarity": {
            "description": "How well the candidate communicates their thoughts",
            "weight": 20,
            "factors": ["Clarity of expression", "Structure", "Examples usage", "Articulation"]
        },
        "depth_of_knowledge": {
            "description": "Understanding of underlying concepts and principles",
            "weight": 20,
            "factors": ["Conceptual understanding", "Problem analysis", "Edge cases", "Alternatives"]
        },
        "problem_solving": {
            "description": "Approach to solving problems and thinking process",
            "weight": 20,
            "factors": ["Logical reasoning", "Systematic approach", "Creativity", "Efficiency"]
        },
        "confidence": {
            "description": "Confidence and professionalism in responses",
            "weight": 15,
            "factors": ["Decisiveness", "Self-assurance", "Professional demeanor", "Adaptability"]
        }
    }
    
    return APIResponse(
        success=True,
        message="Scoring criteria retrieved",
        data={"criteria": criteria}
    )

@router.post("/manual-score", response_model=APIResponse)
async def submit_manual_score(
    session_id: str,
    question_id: int,
    manual_scores: Dict[str, int],
    feedback: str = None,
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Submit manual scores (for admin/reviewer override)"""
    try:
        # This would be used by human reviewers to override AI scores
        # For now, we'll log it and return success
        logger.info(f"Manual scores submitted for session {session_id}, question {question_id}: {manual_scores}")
        
        return APIResponse(
            success=True,
            message="Manual scores recorded successfully",
            data={
                "session_id": session_id,
                "question_id": question_id,
                "manual_scores": manual_scores,
                "feedback": feedback
            }
        )
        
    except Exception as e:
        logger.error(f"Manual scoring failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to record manual scores")