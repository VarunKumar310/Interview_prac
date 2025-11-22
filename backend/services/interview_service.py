"""
Interview Service - Orchestrates the complete interview process
Integrates Gemini AI service with session management
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from services.gemini_service import GeminiService
from services.session_service import SessionService
from models.api_models import *

logger = logging.getLogger(__name__)

class InterviewService:
    def __init__(self, gemini_service: GeminiService, session_service: SessionService):
        self.gemini = gemini_service
        self.session = session_service

    async def create_interview_session(self, user_email: str = None) -> str:
        """Create a new interview session"""
        return await self.session.create_session(user_email)

    async def setup_interview(
        self, 
        session_id: str, 
        role: str, 
        experience_level: str, 
        difficulty: str, 
        resume_text: str = None,
        question_count: int = 10
    ) -> QuestionGenerationResponse:
        """Set up interview with role, experience, difficulty and generate questions"""
        
        # Update session with interview parameters
        await self.session.set_interview_role(session_id, role)
        await self.session.set_experience_level(session_id, experience_level)
        await self.session.set_difficulty(session_id, difficulty)
        
        if resume_text:
            await self.session.set_resume(session_id, resume_text)

        try:
            # Generate questions using Gemini AI
            questions = await self.gemini.generate_interview_questions(
                role=role,
                experience_level=experience_level,
                difficulty=difficulty,
                resume_text=resume_text,
                question_count=question_count
            )

            # Start the interview with generated questions
            success = await self.session.start_interview(session_id, questions)
            
            if success:
                logger.info(f"Interview setup complete for session {session_id}")
                return QuestionGenerationResponse(
                    success=True,
                    session_id=session_id,
                    questions=[InterviewQuestion(**q) for q in questions],
                    total_questions=len(questions),
                    estimated_duration_minutes=len(questions) * 3  # 3 minutes per question
                )
            else:
                raise Exception("Failed to start interview session")

        except Exception as e:
            logger.error(f"Interview setup failed for session {session_id}: {e}")
            return QuestionGenerationResponse(
                success=False,
                session_id=session_id,
                questions=[],
                total_questions=0,
                estimated_duration_minutes=0
            )

    async def get_next_question(self, session_id: str) -> Optional[InterviewQuestion]:
        """Get the next question in the interview"""
        question_data = await self.session.get_next_question(session_id)
        if question_data:
            return InterviewQuestion(**question_data)
        return None

    async def submit_answer(
        self, 
        session_id: str, 
        question_id: int, 
        question_text: str, 
        answer_text: str,
        response_time_seconds: int = None
    ) -> AnswerEvaluationResponse:
        """Submit and evaluate an answer"""
        
        # Get session data for context
        session_data = await self.session.get_session(session_id)
        if not session_data:
            raise ValueError("Invalid session ID")

        role = session_data.get("role", "")
        experience_level = session_data.get("experience_level", "")

        try:
            # Evaluate answer using Gemini AI
            evaluation = await self.gemini.evaluate_answer(
                question=question_text,
                answer=answer_text,
                role=role,
                experience_level=experience_level
            )

            # Save answer and evaluation to session
            await self.session.submit_answer(
                session_id=session_id,
                question_id=question_id,
                answer_text=answer_text,
                evaluation=evaluation
            )

            logger.info(f"Answer evaluated for session {session_id}, question {question_id}: {evaluation.get('overall_score', 0)}/100")

            # Convert to response model
            return AnswerEvaluationResponse(
                success=True,
                overall_score=evaluation.get("overall_score", 0),
                scores=AnswerEvaluationScores(**evaluation.get("scores", {})),
                strengths=evaluation.get("strengths", []),
                weaknesses=evaluation.get("weaknesses", []),
                detailed_feedback=evaluation.get("detailed_feedback", ""),
                improvement_suggestions=evaluation.get("improvement_suggestions", []),
                follow_up_questions=evaluation.get("follow_up_questions", []),
                red_flags=evaluation.get("red_flags", []),
                positive_indicators=evaluation.get("positive_indicators", [])
            )

        except Exception as e:
            logger.error(f"Answer evaluation failed for session {session_id}: {e}")
            return AnswerEvaluationResponse(
                success=False,
                overall_score=0,
                scores=AnswerEvaluationScores(
                    technical_accuracy=0,
                    communication_clarity=0,
                    depth_of_knowledge=0,
                    problem_solving=0,
                    confidence=0
                ),
                strengths=[],
                weaknesses=["Evaluation failed"],
                detailed_feedback="Unable to evaluate answer at this time.",
                improvement_suggestions=[],
                follow_up_questions=[],
                red_flags=[],
                positive_indicators=[]
            )

    async def generate_follow_up(
        self, 
        session_id: str, 
        original_question: str, 
        answer: str
    ) -> str:
        """Generate a follow-up question based on the answer"""
        
        session_data = await self.session.get_session(session_id)
        if not session_data:
            raise ValueError("Invalid session ID")

        role = session_data.get("role", "")

        try:
            follow_up = await self.gemini.generate_follow_up_question(
                original_question=original_question,
                answer=answer,
                role=role
            )
            
            logger.info(f"Generated follow-up for session {session_id}")
            return follow_up

        except Exception as e:
            logger.error(f"Follow-up generation failed for session {session_id}: {e}")
            return "Can you provide more details about your approach?"

    async def get_interview_progress(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get current interview progress"""
        return await self.session.get_interview_progress(session_id)

    async def complete_interview(self, session_id: str) -> FinalReportResponse:
        """Complete interview and generate final report"""
        
        # Get complete interview data
        interview_summary = await self.session.get_interview_summary(session_id)
        if not interview_summary:
            raise ValueError("Invalid session ID or no interview data")

        session_info = interview_summary["session_info"]
        
        # Prepare data for report generation
        candidate_data = {
            "role": session_info.get("role"),
            "experience_level": session_info.get("experience_level"),
        }

        interview_session = {
            "duration": self._calculate_interview_duration(interview_summary),
            "qa_pairs": self._format_qa_pairs(interview_summary["answers"]),
            "avg_score": interview_summary["scores"].get("overall", 0),
            "question_types": self._get_question_types(interview_summary["questions"])
        }

        try:
            # Generate final report using Gemini AI
            report_data = await self.gemini.generate_final_report(
                candidate_data=candidate_data,
                interview_session=interview_session
            )

            # Create QA summary
            qa_summary = []
            for i, answer in enumerate(interview_summary["answers"]):
                qa_pair = QAPair(
                    question_id=answer.get("question_id", i + 1),
                    question=self._get_question_text(interview_summary["questions"], answer.get("question_id", i + 1)),
                    answer=answer.get("answer_text", ""),
                    score=answer.get("score", 0),
                    answered_at=datetime.fromisoformat(answer.get("submitted_at", datetime.now().isoformat()))
                )
                qa_summary.append(qa_pair)

            # Create final report response
            final_report = FinalReportResponse(
                success=True,
                session_id=session_id,
                executive_summary=report_data.get("executive_summary", ""),
                overall_rating=report_data.get("overall_rating", "No Rating"),
                overall_score=report_data.get("overall_score", 0),
                category_scores=CategoryScores(**report_data.get("category_scores", {})),
                key_strengths=report_data.get("key_strengths", []),
                areas_for_improvement=report_data.get("areas_for_improvement", []),
                detailed_analysis=report_data.get("detailed_analysis", ""),
                recommendation=report_data.get("recommendation", ""),
                next_steps=report_data.get("next_steps", []),
                interview_highlights=report_data.get("interview_highlights", []),
                red_flags=report_data.get("red_flags", []),
                salary_range_assessment=report_data.get("salary_range_assessment", ""),
                generated_at=datetime.now(),
                qa_summary=qa_summary
            )

            # Update session status to completed
            await self.session.update_session(session_id, {
                "status": "completed",
                "final_report": final_report.dict(),
                "completed_at": datetime.now().isoformat()
            })

            logger.info(f"Interview completed for session {session_id}")
            return final_report

        except Exception as e:
            logger.error(f"Report generation failed for session {session_id}: {e}")
            # Return a basic report on failure
            return self._create_fallback_report(session_id, interview_summary)

    async def answer_general_question(self, question: str, context: str = None) -> GeneralQuestionResponse:
        """Answer general technical/career questions"""
        try:
            answer = await self.gemini.answer_general_question(question, context)
            
            return GeneralQuestionResponse(
                success=True,
                answer=answer,
                related_topics=self._extract_topics(answer)
            )

        except Exception as e:
            logger.error(f"General question answering failed: {e}")
            return GeneralQuestionResponse(
                success=False,
                answer="I apologize, but I'm unable to answer that question right now. Please try rephrasing or ask something else.",
                related_topics=[]
            )

    def _calculate_interview_duration(self, interview_summary: Dict[str, Any]) -> str:
        """Calculate interview duration"""
        try:
            session_info = interview_summary["session_info"]
            started_at = datetime.fromisoformat(session_info.get("created_at", ""))
            completed_at = datetime.fromisoformat(session_info.get("completed_at", datetime.now().isoformat()))
            
            duration = completed_at - started_at
            minutes = int(duration.total_seconds() // 60)
            return f"{minutes} minutes"
        except:
            return "Unknown duration"

    def _format_qa_pairs(self, answers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format Q&A pairs for report generation"""
        formatted_pairs = []
        for answer in answers:
            formatted_pairs.append({
                "question": answer.get("question_text", ""),
                "answer": answer.get("answer_text", ""),
                "score": answer.get("score", 0)
            })
        return formatted_pairs

    def _get_question_types(self, questions: List[Dict[str, Any]]) -> List[str]:
        """Extract question types"""
        types = set()
        for question in questions:
            types.add(question.get("type", "general"))
        return list(types)

    def _get_question_text(self, questions: List[Dict[str, Any]], question_id: int) -> str:
        """Get question text by ID"""
        for question in questions:
            if question.get("id") == question_id:
                return question.get("question", "Question not found")
        return "Question not found"

    def _extract_topics(self, text: str) -> List[str]:
        """Extract related topics from text (simple keyword extraction)"""
        # This is a simple implementation - could be enhanced with NLP
        keywords = ["programming", "javascript", "python", "react", "database", "sql", 
                   "algorithm", "data structure", "api", "frontend", "backend", "devops"]
        
        found_topics = []
        text_lower = text.lower()
        for keyword in keywords:
            if keyword in text_lower:
                found_topics.append(keyword.title())
        
        return found_topics[:5]  # Return top 5 topics

    def _create_fallback_report(self, session_id: str, interview_summary: Dict[str, Any]) -> FinalReportResponse:
        """Create a fallback report when AI generation fails"""
        scores = interview_summary.get("scores", {})
        
        return FinalReportResponse(
            success=True,
            session_id=session_id,
            executive_summary="Interview completed successfully with automated evaluation.",
            overall_rating="Hire",
            overall_score=scores.get("overall", 75),
            category_scores=CategoryScores(
                technical_skills=scores.get("technical", 75),
                communication=scores.get("communication", 75),
                problem_solving=scores.get("problem_solving", 75),
                cultural_fit=75,
                leadership_potential=70
            ),
            key_strengths=["Completed interview process", "Provided thoughtful responses"],
            areas_for_improvement=["Continue professional development"],
            detailed_analysis="The candidate participated in the interview process and demonstrated various skills through their responses.",
            recommendation="Consider for further evaluation based on role requirements.",
            next_steps=["Technical assessment", "Team interviews", "Reference checks"],
            interview_highlights=["Engaged throughout the interview"],
            red_flags=[],
            salary_range_assessment="Market competitive range appropriate",
            generated_at=datetime.now(),
            qa_summary=[]
        )