"""
AI-Enhanced Interview Backend with Contextual Questions
Simplified version with better error handling
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import logging
import uuid
import json
from datetime import datetime
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Interview Practice Partner - Enhanced",
    description="Backend API with contextual AI-powered questions",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
active_sessions = {}

# Pydantic models
class AnswerSubmission(BaseModel):
    answer: str
    sessionId: Optional[str] = None

# Base questions for different roles
BASE_QUESTIONS = {
    "software_developer": [
        "Tell me about yourself and your programming background.",
        "What programming languages are you most comfortable with?",
        "Describe a challenging project you've worked on recently.",
        "How do you approach debugging complex issues?",
        "What's your experience with version control systems?",
        "How do you stay updated with new technologies?",
        "Describe your experience with databases.",
        "What's your approach to writing clean code?",
        "How do you handle code reviews?",
        "Describe a time you had to learn a new technology quickly."
    ]
}

# Contextual follow-up questions based on keywords
CONTEXTUAL_FOLLOWUPS = {
    "machine learning": [
        "What specific machine learning algorithms have you worked with?",
        "Can you describe a machine learning project you're proud of?",
        "How do you handle overfitting in your models?",
        "What's your experience with data preprocessing?"
    ],
    "communication": [
        "Can you give an example of when you had to explain technical concepts to non-technical stakeholders?",
        "How do you handle disagreements in team meetings?",
        "Describe a time when clear communication saved a project."
    ],
    "project": [
        "What was the most challenging aspect of that project?",
        "How did you manage the project timeline and deliverables?",
        "What would you do differently if you could restart that project?"
    ],
    "experience": [
        "What was the biggest lesson you learned from that experience?",
        "How has that experience shaped your approach to similar situations?",
        "Can you walk me through your decision-making process in that situation?"
    ],
    "skill": [
        "How did you develop that skill?",
        "Can you give me a specific example of using that skill?",
        "What's the most advanced application of that skill you've done?"
    ],
    "challenge": [
        "How did you overcome that challenge?",
        "What resources or help did you seek?",
        "What did you learn from facing that challenge?"
    ]
}

def generate_contextual_question(answer: str, role: str) -> Optional[str]:
    """Generate a contextual follow-up question based on the answer"""
    answer_lower = answer.lower()
    
    # Look for keywords in the answer
    for keyword, questions in CONTEXTUAL_FOLLOWUPS.items():
        if keyword in answer_lower:
            return random.choice(questions)
    
    # Generic follow-ups for detailed answers
    if len(answer.split()) > 15:
        generic_followups = [
            "Can you elaborate on that with a specific example?",
            "What was the most challenging part of that?",
            "How did that experience change your perspective?",
            "What would you do differently next time?"
        ]
        return random.choice(generic_followups)
    
    return None

def create_session(role: str = "Software Developer") -> str:
    """Create a new interview session"""
    session_id = str(uuid.uuid4())
    base_questions = BASE_QUESTIONS.get("software_developer", BASE_QUESTIONS["software_developer"])
    
    active_sessions[session_id] = {
        "id": session_id,
        "role": role,
        "base_questions": base_questions,
        "current_question_index": 0,
        "conversation_history": [],
        "started_at": datetime.now().isoformat(),
        "status": "active"
    }
    
    logger.info(f"Created session {session_id} for role: {role}")
    return session_id

def get_current_question(session_id: str) -> Optional[Dict[str, Any]]:
    """Get the current question for a session"""
    if session_id not in active_sessions:
        return None
    
    session = active_sessions[session_id]
    
    # Check if we have conversation history to generate contextual question
    if session["conversation_history"]:
        last_qa = session["conversation_history"][-1]
        contextual_q = generate_contextual_question(last_qa["answer"], session["role"])
        if contextual_q:
            return {
                "id": len(session["conversation_history"]) + 1,
                "question": contextual_q,
                "type": "contextual_followup"
            }
    
    # Otherwise use base questions
    current_index = session["current_question_index"]
    base_questions = session["base_questions"]
    
    if current_index >= len(base_questions):
        return None  # Interview completed
    
    return {
        "id": current_index + 1,
        "question": base_questions[current_index],
        "type": "base_question"
    }

def submit_answer(session_id: str, answer: str) -> bool:
    """Submit an answer and update session state"""
    if session_id not in active_sessions:
        return False
    
    session = active_sessions[session_id]
    
    # Get current question
    current_q = get_current_question(session_id)
    if not current_q:
        return False
    
    # Save the Q&A to conversation history
    qa_entry = {
        "question": current_q["question"],
        "answer": answer,
        "timestamp": datetime.now().isoformat(),
        "question_type": current_q["type"]
    }
    session["conversation_history"].append(qa_entry)
    
    # Only advance base question index if it was a base question
    if current_q["type"] == "base_question":
        session["current_question_index"] += 1
    
    # Check if interview should end
    if (session["current_question_index"] >= len(session["base_questions"]) and 
        len(session["conversation_history"]) >= 12):  # Max 12 total questions
        session["status"] = "completed"
        logger.info(f"Interview completed for session {session_id}")
    
    logger.info(f"Answer submitted for session {session_id}: {answer[:30]}...")
    return True

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI Interview Practice Partner - Enhanced", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check for monitoring"""
    return {
        "status": "healthy",
        "service": "ai-interview-backend-enhanced",
        "version": "2.0.0"
    }

@app.get("/api/interview/question")
async def get_question(sessionId: Optional[str] = None):
    """Get current question for session"""
    try:
        if not sessionId:
            # Create new session if none provided
            sessionId = create_session()
        
        question = get_current_question(sessionId)
        
        if not question:
            return {
                "success": False,
                "message": "Interview completed",
                "completed": True
            }
        
        return {
            "success": True,
            "question": question,
            "sessionId": sessionId
        }
    except Exception as e:
        logger.error(f"Failed to get question: {e}")
        raise HTTPException(status_code=500, detail="Failed to get question")

@app.post("/api/interview/answer")
async def submit_interview_answer(submission: AnswerSubmission):
    """Submit answer and get contextual next question"""
    try:
        session_id = submission.sessionId
        logger.info(f"Received answer for session {session_id}: {submission.answer[:50]}...")
        
        if not session_id or session_id not in active_sessions:
            logger.error(f"Invalid session ID: {session_id}")
            raise HTTPException(status_code=400, detail="Invalid session ID")
        
        # Submit the answer
        success = submit_answer(session_id, submission.answer)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to submit answer")
        
        # Get next question (could be contextual or base)
        next_question = get_current_question(session_id)
        
        if not next_question:
            return {
                "success": True,
                "message": "Interview completed! Thank you for your insightful responses.",
                "completed": True,
                "sessionId": session_id
            }
        
        logger.info(f"Next question type: {next_question['type']}")
        return {
            "success": True,
            "question": next_question,
            "sessionId": session_id,
            "message": "Answer submitted successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to submit answer: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")

@app.get("/api/interview/status/{session_id}")
async def get_interview_status(session_id: str):
    """Get interview progress status"""
    try:
        if session_id not in active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = active_sessions[session_id]
        total_questions_answered = len(session["conversation_history"])
        
        return {
            "success": True,
            "status": session["status"],
            "progress": {
                "questions_answered": total_questions_answered,
                "base_questions_completed": session["current_question_index"],
                "total_base_questions": len(session["base_questions"])
            }
        }
    except Exception as e:
        logger.error(f"Failed to get status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get interview status")

if __name__ == "__main__":
    logger.info("Starting AI-Enhanced Interview Practice Backend...")
    logger.info("Features: Contextual follow-up questions based on answers")
    logger.info("Server: http://localhost:8000")
    logger.info("Docs: http://localhost:8000/docs")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )