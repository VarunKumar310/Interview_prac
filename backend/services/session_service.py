"""
Session Management Service
Handles user sessions, interview state, and data persistence
"""

import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class SessionService:
    def __init__(self):
        self.sessions: Dict[str, Dict[str, Any]] = {}
        self.session_timeout_minutes = 120  # 2 hours
        self.data_dir = Path("data/sessions")
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Load existing sessions on startup
        asyncio.create_task(self._load_sessions())

    async def _load_sessions(self):
        """Load existing sessions from disk"""
        try:
            if self.data_dir.exists():
                for session_file in self.data_dir.glob("*.json"):
                    try:
                        with open(session_file, 'r') as f:
                            session_data = json.load(f)
                            session_id = session_file.stem
                            self.sessions[session_id] = session_data
                            logger.info(f"Loaded session: {session_id}")
                    except Exception as e:
                        logger.error(f"Failed to load session {session_file}: {e}")
        except Exception as e:
            logger.error(f"Failed to load sessions: {e}")

    async def _save_session(self, session_id: str):
        """Save session to disk"""
        try:
            session_file = self.data_dir / f"{session_id}.json"
            with open(session_file, 'w') as f:
                json.dump(self.sessions[session_id], f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to save session {session_id}: {e}")

    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        import uuid
        return f"session_{uuid.uuid4().hex[:12]}"

    def _is_session_expired(self, session_data: Dict[str, Any]) -> bool:
        """Check if session is expired"""
        try:
            last_updated = datetime.fromisoformat(session_data.get('last_updated', ''))
            expiry_time = last_updated + timedelta(minutes=self.session_timeout_minutes)
            return datetime.now() > expiry_time
        except:
            return True

    async def create_session(self, user_email: str = None) -> str:
        """Create new user session"""
        session_id = self._generate_session_id()
        session_data = {
            "session_id": session_id,
            "user_email": user_email,
            "created_at": datetime.now().isoformat(),
            "last_updated": datetime.now().isoformat(),
            "status": "not_started",
            "role": None,
            "experience_level": None,
            "difficulty": None,
            "resume_text": None,
            "questions": [],
            "answers": [],
            "current_question_index": 0,
            "scores": {
                "overall": 0,
                "technical": 0,
                "communication": 0,
                "problem_solving": 0,
                "confidence": 0
            },
            "interview_data": {}
        }
        
        self.sessions[session_id] = session_data
        await self._save_session(session_id)
        
        logger.info(f"Created new session: {session_id}")
        return session_id

    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        if session_id not in self.sessions:
            return None
        
        session_data = self.sessions[session_id]
        
        # Check if expired
        if self._is_session_expired(session_data):
            await self.delete_session(session_id)
            return None
        
        # Update last accessed time
        session_data['last_updated'] = datetime.now().isoformat()
        await self._save_session(session_id)
        
        return session_data

    async def update_session(self, session_id: str, updates: Dict[str, Any]) -> bool:
        """Update session data"""
        if session_id not in self.sessions:
            return False
        
        session_data = self.sessions[session_id]
        
        # Check if expired
        if self._is_session_expired(session_data):
            await self.delete_session(session_id)
            return False
        
        # Apply updates
        for key, value in updates.items():
            session_data[key] = value
        
        session_data['last_updated'] = datetime.now().isoformat()
        await self._save_session(session_id)
        
        logger.info(f"Updated session {session_id}: {list(updates.keys())}")
        return True

    async def set_interview_role(self, session_id: str, role: str) -> bool:
        """Set interview role for session"""
        return await self.update_session(session_id, {"role": role})

    async def set_experience_level(self, session_id: str, experience: str) -> bool:
        """Set experience level for session"""
        return await self.update_session(session_id, {"experience_level": experience})

    async def set_difficulty(self, session_id: str, difficulty: str) -> bool:
        """Set difficulty level for session"""
        return await self.update_session(session_id, {"difficulty": difficulty})

    async def set_resume(self, session_id: str, resume_text: str) -> bool:
        """Set resume text for session"""
        return await self.update_session(session_id, {"resume_text": resume_text})

    async def start_interview(self, session_id: str, questions: List[Dict[str, Any]]) -> bool:
        """Start interview with generated questions"""
        updates = {
            "status": "in_progress",
            "questions": questions,
            "interview_started_at": datetime.now().isoformat()
        }
        return await self.update_session(session_id, updates)

    async def submit_answer(
        self, 
        session_id: str, 
        question_id: int, 
        answer_text: str, 
        evaluation: Dict[str, Any]
    ) -> bool:
        """Submit and save answer with evaluation"""
        session_data = await self.get_session(session_id)
        if not session_data:
            return False
        
        # Create answer entry
        answer_entry = {
            "question_id": question_id,
            "answer_text": answer_text,
            "evaluation": evaluation,
            "submitted_at": datetime.now().isoformat(),
            "score": evaluation.get("overall_score", 0)
        }
        
        # Add to answers list
        if "answers" not in session_data:
            session_data["answers"] = []
        
        session_data["answers"].append(answer_entry)
        
        # Update current question index
        session_data["current_question_index"] = len(session_data["answers"])
        
        # Update overall scores
        self._update_session_scores(session_data)
        
        # Check if interview is complete
        if len(session_data["answers"]) >= len(session_data.get("questions", [])):
            session_data["status"] = "completed"
            session_data["completed_at"] = datetime.now().isoformat()
        
        self.sessions[session_id] = session_data
        await self._save_session(session_id)
        
        logger.info(f"Submitted answer for session {session_id}, question {question_id}")
        return True

    def _update_session_scores(self, session_data: Dict[str, Any]):
        """Update session scores based on answers"""
        answers = session_data.get("answers", [])
        if not answers:
            return
        
        # Calculate averages
        total_scores = {
            "overall": 0,
            "technical": 0,
            "communication": 0,
            "problem_solving": 0,
            "confidence": 0
        }
        
        count = len(answers)
        for answer in answers:
            evaluation = answer.get("evaluation", {})
            scores = evaluation.get("scores", {})
            
            total_scores["overall"] += evaluation.get("overall_score", 0)
            total_scores["technical"] += scores.get("technical_accuracy", 0)
            total_scores["communication"] += scores.get("communication_clarity", 0)
            total_scores["problem_solving"] += scores.get("problem_solving", 0)
            total_scores["confidence"] += scores.get("confidence", 0)
        
        # Update session scores
        session_data["scores"] = {
            key: round(value / count) for key, value in total_scores.items()
        }

    async def get_interview_progress(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get interview progress information"""
        session_data = await self.get_session(session_id)
        if not session_data:
            return None
        
        total_questions = len(session_data.get("questions", []))
        answered_questions = len(session_data.get("answers", []))
        
        return {
            "session_id": session_id,
            "status": session_data.get("status", "not_started"),
            "total_questions": total_questions,
            "answered_questions": answered_questions,
            "current_question_index": session_data.get("current_question_index", 0),
            "progress_percentage": round((answered_questions / total_questions * 100)) if total_questions > 0 else 0,
            "scores": session_data.get("scores", {}),
            "role": session_data.get("role"),
            "experience_level": session_data.get("experience_level"),
            "difficulty": session_data.get("difficulty")
        }

    async def get_next_question(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get the next question for the interview"""
        session_data = await self.get_session(session_id)
        if not session_data:
            return None
        
        questions = session_data.get("questions", [])
        current_index = session_data.get("current_question_index", 0)
        
        if current_index >= len(questions):
            return None  # Interview complete
        
        return questions[current_index]

    async def get_interview_summary(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get complete interview summary"""
        session_data = await self.get_session(session_id)
        if not session_data:
            return None
        
        return {
            "session_info": {
                "session_id": session_id,
                "role": session_data.get("role"),
                "experience_level": session_data.get("experience_level"),
                "difficulty": session_data.get("difficulty"),
                "status": session_data.get("status"),
                "created_at": session_data.get("created_at"),
                "completed_at": session_data.get("completed_at")
            },
            "questions": session_data.get("questions", []),
            "answers": session_data.get("answers", []),
            "scores": session_data.get("scores", {}),
            "statistics": {
                "total_questions": len(session_data.get("questions", [])),
                "questions_answered": len(session_data.get("answers", [])),
                "average_score": session_data.get("scores", {}).get("overall", 0),
                "completion_rate": len(session_data.get("answers", [])) / len(session_data.get("questions", [])) if session_data.get("questions") else 0
            }
        }

    async def delete_session(self, session_id: str) -> bool:
        """Delete session"""
        try:
            if session_id in self.sessions:
                del self.sessions[session_id]
            
            # Delete file
            session_file = self.data_dir / f"{session_id}.json"
            if session_file.exists():
                session_file.unlink()
            
            logger.info(f"Deleted session: {session_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to delete session {session_id}: {e}")
            return False

    async def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        expired_sessions = []
        
        for session_id, session_data in self.sessions.items():
            if self._is_session_expired(session_data):
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            await self.delete_session(session_id)
        
        if expired_sessions:
            logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")

    async def get_active_sessions_count(self) -> int:
        """Get count of active sessions"""
        await self.cleanup_expired_sessions()
        return len(self.sessions)

    async def get_session_statistics(self) -> Dict[str, Any]:
        """Get session statistics"""
        await self.cleanup_expired_sessions()
        
        total_sessions = len(self.sessions)
        completed_sessions = sum(1 for s in self.sessions.values() if s.get("status") == "completed")
        in_progress_sessions = sum(1 for s in self.sessions.values() if s.get("status") == "in_progress")
        
        return {
            "total_active_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "in_progress_sessions": in_progress_sessions,
            "not_started_sessions": total_sessions - completed_sessions - in_progress_sessions
        }