"""
Enhanced FastAPI Backend for AI Interview Practice Partner
Includes basic interview functionality with proper question progression
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI Interview Practice Partner",
    description="Backend API for AI-powered interview practice with question progression",
    version="1.0.0"
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

# In-memory storage for demo (replace with database in production)
active_sessions = {}

# Pydantic models
class QuestionResponse(BaseModel):
    id: int
    question: str
    type: str

class AnswerSubmission(BaseModel):
    answer: str
    sessionId: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    sessionId: Optional[str] = None

# Sample questions pool for different roles
SAMPLE_QUESTIONS = {
    "software_developer": [
        "Tell me about yourself and your programming background.",
        "Why are you interested in this software developer role?",
        "What programming languages are you most comfortable with?",
        "Describe a challenging project you've worked on recently.",
        "How do you approach debugging complex issues?",
        "What's your experience with version control systems like Git?",
        "How do you stay updated with new technologies?",
        "Describe your experience with databases.",
        "What's your approach to writing clean, maintainable code?",
        "How do you handle code reviews and feedback?"
    ],
    "data_scientist": [
        "Tell me about your background in data science.",
        "Why are you interested in this data scientist role?",
        "What machine learning algorithms are you most familiar with?",
        "Describe a data science project you're proud of.",
        "How do you handle missing data in datasets?",
        "What's your experience with Python libraries like pandas and scikit-learn?",
        "How do you validate the performance of your models?",
        "Describe your experience with data visualization.",
        "How do you communicate technical results to non-technical stakeholders?",
        "What's your approach to feature engineering?"
    ],
    "product_manager": [
        "Tell me about your background in product management.",
        "Why are you interested in this product manager role?",
        "How do you prioritize features in a product roadmap?",
        "Describe a product launch you've managed.",
        "How do you gather and analyze user feedback?",
        "What's your approach to working with engineering teams?",
        "How do you measure product success?",
        "Describe a time when you had to make a difficult product decision.",
        "How do you handle competing stakeholder demands?",
        "What's your experience with A/B testing?"
    ]
}

def get_questions_for_role(role: str) -> List[str]:
    """Get questions based on role, default to software developer"""
    role_key = role.lower().replace(" ", "_").replace("-", "_")
    return SAMPLE_QUESTIONS.get(role_key, SAMPLE_QUESTIONS["software_developer"])

def create_session(role: str = "Software Developer") -> str:
    """Create a new interview session"""
    session_id = str(uuid.uuid4())
    questions = get_questions_for_role(role)
    
    active_sessions[session_id] = {
        "id": session_id,
        "role": role,
        "questions": questions,
        "current_question_index": 0,
        "answers": [],
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
    current_index = session["current_question_index"]
    questions = session["questions"]
    
    if current_index >= len(questions):
        return None  # Interview completed
    
    return {
        "id": current_index + 1,
        "question": questions[current_index],
        "type": "behavioral"  # Simplified for demo
    }

async def generate_ai_followup_question(current_question: str, user_answer: str, role: str, conversation_history: List[Dict]) -> str:
    """Generate AI-powered follow-up question based on user's answer"""
    try:
        # Import Gemini service
        from services.gemini_service import GeminiService
        gemini = GeminiService()
        
        # Build conversation context
        context = "\n".join([f"Q: {qa.get('question', '')}\nA: {qa.get('answer', '')}" for qa in conversation_history[-3:]])
        
        prompt = f"""
You are an experienced technical interviewer conducting a live interview for a {role} position.

Conversation so far:
{context}

Current Question: {current_question}
Candidate's Answer: {user_answer}

Based on the candidate's answer, generate ONE intelligent follow-up question that:
1. Probes deeper into their claims or experience mentioned
2. Asks for specific examples or details
3. Tests their knowledge on topics they brought up
4. Feels natural and conversational
5. Is appropriate for this role level

For example:
- If they mention "good at communication", ask how they handle difficult conversations
- If they mention a technology, ask about specific challenges they faced
- If they claim leadership, ask for a specific leadership example

Respond with ONLY the follow-up question, nothing else.
"""
        
        response = await gemini._generate_response(prompt)
        return response.strip()
        
    except Exception as e:
        logger.error(f"AI question generation failed: {e}")
        # Fallback generic follow-ups
        generic_followups = [
            "Can you give me a specific example of that?",
            "How did you handle challenges in that situation?",
            "What did you learn from that experience?",
            "Can you elaborate on that point?"
        ]
        import random
        return random.choice(generic_followups)

async def submit_answer(session_id: str, answer: str) -> tuple:
    """Submit an answer and generate AI-powered next question"""
    if session_id not in active_sessions:
        return False, None
    
    session = active_sessions[session_id]
    current_index = session["current_question_index"]
    current_question = session["questions"][current_index] if current_index < len(session["questions"]) else ""
    
    # Save the answer with question context
    answer_entry = {
        "question_id": current_index + 1,
        "question": current_question,
        "answer": answer,
        "submitted_at": datetime.now().isoformat()
    }
    session["answers"].append(answer_entry)
    
    # Move to next question
    session["current_question_index"] = current_index + 1
    
    # Generate next question
    next_question = None
    
    if session["current_question_index"] < len(session["questions"]):
        # Check if we should generate AI follow-up or use predefined
        should_generate_ai_question = (
            len(session["answers"]) % 2 == 1 or  # Every other question
            len(answer.split()) > 15 or  # Detailed answers get follow-ups
            any(keyword in answer.lower() for keyword in ['experience', 'project', 'challenge', 'skill', 'good at', 'expert'])
        )
        
        if should_generate_ai_question:
            # Generate AI-powered follow-up
            ai_question = await generate_ai_followup_question(
                current_question, 
                answer, 
                session["role"], 
                session["answers"]
            )
            next_question = ai_question
            logger.info(f"Generated AI follow-up for session {session_id}: {ai_question[:50]}...")
        else:
            # Use next predefined question
            next_question = session["questions"][session["current_question_index"]]
            logger.info(f"Using predefined question for session {session_id}")
    
    # Check if interview is complete
    if session["current_question_index"] >= len(session["questions"]) and not next_question:
        session["status"] = "completed"
        logger.info(f"Interview completed for session {session_id}")
    
    logger.info(f"Answer submitted for session {session_id}, question {current_index + 1}")
    return True, next_question

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

@app.post("/api/interview/start")
async def start_interview():
    """Start a new interview session"""
    try:
        session_id = create_session()
        first_question = get_current_question(session_id)
        
        if not first_question:
            raise HTTPException(status_code=500, detail="Failed to generate questions")
        
        return {
            "success": True,
            "sessionId": session_id,
            "question": first_question
        }
    except Exception as e:
        logger.error(f"Failed to start interview: {e}")
        raise HTTPException(status_code=500, detail="Failed to start interview")

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
                "message": "Interview completed or invalid session",
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
    """Submit answer and get AI-generated next question"""
    try:
        session_id = submission.sessionId
        logger.info(f"Received answer submission for session: {session_id}")
        
        if not session_id or session_id not in active_sessions:
            logger.error(f"Invalid session ID: {session_id}")
            raise HTTPException(status_code=400, detail="Invalid session ID")
        
        # Submit the answer and get AI-generated next question
        logger.info(f"Submitting answer: {submission.answer[:50]}...")
        result = await submit_answer(session_id, submission.answer)
        success, ai_next_question = result[0], result[1]
        
        if not success:
            logger.error("Answer submission failed")
            raise HTTPException(status_code=400, detail="Failed to submit answer")
        
        # Use AI question if available, otherwise get predefined question
        if ai_next_question:
            next_question = {
                "id": active_sessions[session_id]["current_question_index"],
                "question": ai_next_question,
                "type": "ai_followup"
            }
            logger.info(f"Using AI-generated question: {ai_next_question[:50]}...")
        else:
            next_question = get_current_question(session_id)
            logger.info("Using predefined question")
        
        if not next_question:
            logger.info(f"Interview completed for session: {session_id}")
            return {
                "success": True,
                "message": "Interview completed! Thank you for your time. Your responses were insightful!",
                "completed": True,
                "sessionId": session_id
            }
        
        return {
            "success": True,
            "question": next_question,
            "sessionId": session_id,
            "message": "Answer submitted successfully",
            "ai_generated": ai_next_question is not None
        }
    except Exception as e:
        import traceback
        logger.error(f"Failed to submit answer: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")

@app.post("/api/chat")
async def chat_endpoint(message_data: ChatMessage):
    """Handle general chat messages"""
    try:
        # Simple echo response for general chat
        return {
            "success": True,
            "response": f"I understand you said: '{message_data.message}'. This is a placeholder response for general chat. The main interview functionality is available through the interview endpoints.",
            "sessionId": message_data.sessionId
        }
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Chat processing failed")

@app.get("/api/interview/status/{session_id}")
async def get_interview_status(session_id: str):
    """Get interview progress status"""
    try:
        if session_id not in active_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = active_sessions[session_id]
        total_questions = len(session["questions"])
        answered_questions = len(session["answers"])
        
        return {
            "success": True,
            "status": session["status"],
            "progress": {
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "current_question": session["current_question_index"] + 1,
                "percentage": round((answered_questions / total_questions) * 100) if total_questions > 0 else 0
            }
        }
    except Exception as e:
        logger.error(f"Failed to get status: {e}")
        raise HTTPException(status_code=500, detail="Failed to get interview status")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

if __name__ == "__main__":
    logger.info("Starting Enhanced AI Interview Practice Partner Backend...")
    logger.info("Server will be available at: http://localhost:8000")
    logger.info("API documentation available at: http://localhost:8000/docs")
    logger.info("Interview endpoints:")
    logger.info("  POST /api/interview/start - Start new interview")
    logger.info("  GET /api/interview/question - Get current question")
    logger.info("  POST /api/interview/answer - Submit answer")
    logger.info("  POST /api/chat - General chat")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )