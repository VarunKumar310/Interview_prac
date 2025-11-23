"""
Report generation routes
Handles final interview reports and analytics
"""

from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.responses import JSONResponse
import logging
from typing import Optional
import json

from models.api_models import *
from services.interview_service import InterviewService

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency functions
def get_interview_service() -> InterviewService:
    return InterviewService()

@router.post("/generate", response_model=FinalReportResponse)
async def generate_final_report(
    request: ReportGenerationRequest,
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Generate comprehensive final interview report"""
    try:
        report = await interview_service.complete_interview(request.session_id)
        
        logger.info(f"Final report generated for session {request.session_id}")
        return report
        
    except ValueError as e:
        logger.error(f"Invalid request: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate final report")

@router.get("/download/{session_id}")
async def download_report(
    session_id: str,
    format_type: str = "json",
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Download report in specified format (JSON or PDF)"""
    try:
        # Generate the report
        report_request = ReportGenerationRequest(session_id=session_id, format_type=format_type)
        report = await interview_service.complete_interview(session_id)
        
        if format_type.lower() == "pdf":
            # For PDF generation, you'd use a library like reportlab or weasyprint
            # For now, return JSON with appropriate headers
            pdf_content = json.dumps(report.dict(), indent=2)
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=interview_report_{session_id}.pdf"}
            )
        else:
            # Return JSON format
            return JSONResponse(
                content=report.dict(),
                headers={"Content-Disposition": f"attachment; filename=interview_report_{session_id}.json"}
            )
        
    except Exception as e:
        logger.error(f"Report download failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to download report")

@router.get("/summary/{session_id}", response_model=APIResponse)
async def get_report_summary(
    session_id: str,
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Get a quick summary of the interview results"""
    try:
        progress = await interview_service.get_interview_progress(session_id)
        
        if not progress:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Create summary
        summary = {
            "session_id": session_id,
            "status": progress.get("status"),
            "overall_score": progress.get("scores", {}).get("overall", 0),
            "questions_answered": progress.get("answered_questions", 0),
            "total_questions": progress.get("total_questions", 0),
            "completion_rate": progress.get("progress_percentage", 0),
            "role": progress.get("role"),
            "experience_level": progress.get("experience_level"),
            "difficulty": progress.get("difficulty")
        }
        
        return APIResponse(
            success=True,
            message="Report summary retrieved",
            data=summary
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get report summary failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get report summary")

@router.get("/analytics/{session_id}", response_model=APIResponse)
async def get_interview_analytics(
    session_id: str,
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Get detailed analytics and insights from the interview"""
    try:
        from services.session_service import SessionService
        session_service = SessionService()
        summary = await session_service.get_interview_summary(session_id)
        
        if not summary:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Calculate analytics
        answers = summary.get("answers", [])
        questions = summary.get("questions", [])
        
        analytics = {
            "performance_trend": _calculate_performance_trend(answers),
            "question_type_performance": _analyze_question_type_performance(questions, answers),
            "response_time_analysis": _analyze_response_times(answers),
            "strengths_weaknesses": _identify_strengths_weaknesses(answers),
            "improvement_areas": _suggest_improvements(answers),
            "benchmark_comparison": _compare_to_benchmarks(summary.get("scores", {})),
            "detailed_metrics": {
                "average_score": summary.get("scores", {}).get("overall", 0),
                "score_variance": _calculate_score_variance(answers),
                "consistency_rating": _calculate_consistency(answers),
                "total_interview_time": _calculate_total_time(summary)
            }
        }
        
        return APIResponse(
            success=True,
            message="Interview analytics retrieved",
            data=analytics
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get analytics failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get interview analytics")

@router.post("/compare-sessions", response_model=APIResponse)
async def compare_interview_sessions(
    session_ids: List[str],
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Compare multiple interview sessions for analytics"""
    try:
        if len(session_ids) > 5:
            raise HTTPException(status_code=400, detail="Maximum 5 sessions can be compared at once")
        
        comparisons = []
        for session_id in session_ids:
            progress = await interview_service.get_interview_progress(session_id)
            if progress:
                comparisons.append({
                    "session_id": session_id,
                    "overall_score": progress.get("scores", {}).get("overall", 0),
                    "role": progress.get("role"),
                    "experience_level": progress.get("experience_level"),
                    "difficulty": progress.get("difficulty"),
                    "completion_rate": progress.get("progress_percentage", 0)
                })
        
        # Calculate comparison metrics
        comparison_data = {
            "sessions": comparisons,
            "average_score": sum(s["overall_score"] for s in comparisons) / len(comparisons) if comparisons else 0,
            "score_range": {
                "min": min(s["overall_score"] for s in comparisons) if comparisons else 0,
                "max": max(s["overall_score"] for s in comparisons) if comparisons else 0
            },
            "role_distribution": _count_roles(comparisons),
            "difficulty_distribution": _count_difficulties(comparisons)
        }
        
        return APIResponse(
            success=True,
            message="Session comparison completed",
            data=comparison_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session comparison failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to compare sessions")

# Helper functions for analytics
def _calculate_performance_trend(answers: List[Dict]) -> List[Dict]:
    """Calculate performance trend over time"""
    trend = []
    for i, answer in enumerate(answers):
        trend.append({
            "question_number": i + 1,
            "score": answer.get("score", 0),
            "timestamp": answer.get("submitted_at")
        })
    return trend

def _analyze_question_type_performance(questions: List[Dict], answers: List[Dict]) -> Dict:
    """Analyze performance by question type"""
    type_scores = {}
    
    for i, answer in enumerate(answers):
        if i < len(questions):
            question_type = questions[i].get("type", "general")
            if question_type not in type_scores:
                type_scores[question_type] = []
            type_scores[question_type].append(answer.get("score", 0))
    
    # Calculate averages
    performance = {}
    for q_type, scores in type_scores.items():
        performance[q_type] = {
            "average_score": sum(scores) / len(scores),
            "question_count": len(scores),
            "best_score": max(scores),
            "worst_score": min(scores)
        }
    
    return performance

def _analyze_response_times(answers: List[Dict]) -> Dict:
    """Analyze response time patterns"""
    # This would require actual response time data
    return {
        "average_time": "N/A - Response time tracking not implemented",
        "fastest_response": "N/A",
        "slowest_response": "N/A",
        "time_trend": "N/A"
    }

def _identify_strengths_weaknesses(answers: List[Dict]) -> Dict:
    """Identify key strengths and weaknesses"""
    all_strengths = []
    all_weaknesses = []
    
    for answer in answers:
        evaluation = answer.get("evaluation", {})
        all_strengths.extend(evaluation.get("strengths", []))
        all_weaknesses.extend(evaluation.get("weaknesses", []))
    
    # Count frequency
    strength_counts = {}
    weakness_counts = {}
    
    for strength in all_strengths:
        strength_counts[strength] = strength_counts.get(strength, 0) + 1
    
    for weakness in all_weaknesses:
        weakness_counts[weakness] = weakness_counts.get(weakness, 0) + 1
    
    return {
        "top_strengths": sorted(strength_counts.items(), key=lambda x: x[1], reverse=True)[:5],
        "main_weaknesses": sorted(weakness_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    }

def _suggest_improvements(answers: List[Dict]) -> List[str]:
    """Suggest specific improvements based on performance"""
    suggestions = set()
    
    for answer in answers:
        evaluation = answer.get("evaluation", {})
        suggestions.update(evaluation.get("improvement_suggestions", []))
    
    return list(suggestions)[:10]  # Top 10 suggestions

def _compare_to_benchmarks(scores: Dict) -> Dict:
    """Compare scores to industry benchmarks"""
    benchmarks = {
        "technical": 75,
        "communication": 80,
        "problem_solving": 70,
        "confidence": 75,
        "overall": 75
    }
    
    comparison = {}
    for category, user_score in scores.items():
        benchmark = benchmarks.get(category, 75)
        comparison[category] = {
            "user_score": user_score,
            "benchmark": benchmark,
            "difference": user_score - benchmark,
            "percentile": min(95, max(5, (user_score / 100) * 100))  # Simplified percentile
        }
    
    return comparison

def _calculate_score_variance(answers: List[Dict]) -> float:
    """Calculate variance in scores"""
    scores = [answer.get("score", 0) for answer in answers]
    if len(scores) < 2:
        return 0
    
    mean = sum(scores) / len(scores)
    variance = sum((score - mean) ** 2 for score in scores) / len(scores)
    return round(variance, 2)

def _calculate_consistency(answers: List[Dict]) -> str:
    """Calculate consistency rating"""
    variance = _calculate_score_variance(answers)
    if variance < 50:
        return "Very Consistent"
    elif variance < 100:
        return "Consistent"
    elif variance < 200:
        return "Moderately Consistent"
    else:
        return "Inconsistent"

def _calculate_total_time(summary: Dict) -> str:
    """Calculate total interview time"""
    # This would use actual timestamps
    return "Estimated 30 minutes"

def _count_roles(sessions: List[Dict]) -> Dict:
    """Count role distribution"""
    roles = {}
    for session in sessions:
        role = session.get("role", "Unknown")
        roles[role] = roles.get(role, 0) + 1
    return roles

def _count_difficulties(sessions: List[Dict]) -> Dict:
    """Count difficulty distribution"""
    difficulties = {}
    for session in sessions:
        difficulty = session.get("difficulty", "Unknown")
        difficulties[difficulty] = difficulties.get(difficulty, 0) + 1
    return difficulties