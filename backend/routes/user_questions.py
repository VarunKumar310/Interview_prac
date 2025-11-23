"""
General user questions routes
Handles "What is bubble sort?", "Explain REST API", etc.
"""

from fastapi import APIRouter, HTTPException, Depends
import logging
from typing import List

from models.api_models import GeneralQuestionRequest, GeneralQuestionResponse, APIResponse
from services.interview_service import InterviewService

logger = logging.getLogger(__name__)

router = APIRouter()

# Dependency functions
def get_interview_service() -> InterviewService:
    return InterviewService()

@router.post("/ask", response_model=GeneralQuestionResponse)
async def ask_general_question(
    request: GeneralQuestionRequest,
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Ask general technical/career questions and get AI-powered answers"""
    try:
        response = await interview_service.answer_general_question(
            question=request.question,
            context=request.context
        )
        
        logger.info(f"Answered general question: {request.question[:50]}...")
        return response
        
    except Exception as e:
        logger.error(f"General question answering failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to answer question")

@router.get("/popular-questions", response_model=APIResponse)
async def get_popular_questions():
    """Get a list of popular technical questions users ask"""
    popular_questions = {
        "programming_basics": [
            "What is the difference between == and === in JavaScript?",
            "Explain the concept of closures in programming",
            "What is the difference between stack and heap memory?",
            "How does garbage collection work?",
            "What are the principles of Object-Oriented Programming?"
        ],
        "data_structures": [
            "What is bubble sort and how does it work?",
            "Explain the difference between array and linked list",
            "What is a binary search tree?",
            "How do hash tables work?",
            "What is the time complexity of different sorting algorithms?"
        ],
        "web_development": [
            "Explain REST API and its principles",
            "What is the difference between HTTP and HTTPS?",
            "How does authentication work in web applications?",
            "What is CORS and why is it important?",
            "Explain the MVC architecture pattern"
        ],
        "database": [
            "What is the difference between SQL and NoSQL databases?",
            "Explain database normalization",
            "What are database indexes and why are they important?",
            "How do database transactions work?",
            "What is the CAP theorem?"
        ],
        "system_design": [
            "How would you design a URL shortener like bit.ly?",
            "Explain microservices architecture",
            "What is load balancing and how does it work?",
            "How do you handle scaling in distributed systems?",
            "What is caching and different caching strategies?"
        ],
        "career_advice": [
            "How do I prepare for technical interviews?",
            "What skills should I focus on as a junior developer?",
            "How do I transition from one tech stack to another?",
            "What are the best practices for code reviews?",
            "How do I negotiate salary in tech interviews?"
        ]
    }
    
    return APIResponse(
        success=True,
        message="Popular questions retrieved",
        data={"categories": popular_questions}
    )

@router.post("/explain-concept", response_model=GeneralQuestionResponse)
async def explain_technical_concept(
    concept: str,
    level: str = "intermediate",  # beginner, intermediate, advanced
    include_examples: bool = True,
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Get detailed explanation of technical concepts with examples"""
    try:
        # Create detailed question with context
        context = f"Explain this concept for {level} level understanding"
        if include_examples:
            context += " with practical examples and code snippets where applicable"
        
        question = f"Explain {concept} in detail"
        
        response = await interview_service.answer_general_question(
            question=question,
            context=context
        )
        
        logger.info(f"Explained concept: {concept} at {level} level")
        return response
        
    except Exception as e:
        logger.error(f"Concept explanation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to explain concept")

@router.post("/code-review", response_model=GeneralQuestionResponse)
async def review_code_snippet(
    code: str,
    language: str,
    focus_areas: List[str] = None,  # ["performance", "security", "readability", "best_practices"]
    interview_service: InterviewService = Depends(get_interview_service)
):
    """Get AI code review with suggestions and improvements"""
    try:
        focus = ", ".join(focus_areas) if focus_areas else "overall code quality"
        
        question = f"""
Please review this {language} code and provide feedback focusing on {focus}:

```{language}
{code}
```

Provide specific suggestions for improvement, identify any issues, and explain best practices.
"""
        
        context = "Code review with constructive feedback and suggestions"
        
        response = await interview_service.answer_general_question(
            question=question,
            context=context
        )
        
        logger.info(f"Reviewed {language} code snippet")
        return response
        
    except Exception as e:
        logger.error(f"Code review failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to review code")

@router.post("/interview-tips", response_model=APIResponse)
async def get_interview_tips(
    role: str = None,
    experience_level: str = None,
    interview_type: str = "technical"  # technical, behavioral, system_design
):
    """Get personalized interview tips based on role and experience"""
    try:
        tips_database = {
            "technical": {
                "general": [
                    "Practice coding problems on platforms like LeetCode and HackerRank",
                    "Understand time and space complexity of your solutions",
                    "Think out loud during problem-solving",
                    "Ask clarifying questions before starting to code",
                    "Test your code with edge cases"
                ],
                "fresher": [
                    "Focus on fundamental data structures and algorithms",
                    "Practice basic programming concepts thoroughly",
                    "Prepare to explain your academic projects in detail",
                    "Show enthusiasm for learning and growth"
                ],
                "experienced": [
                    "Be prepared to discuss system design and architecture",
                    "Share real-world problem-solving experiences",
                    "Discuss trade-offs in your technical decisions",
                    "Prepare to mentor junior developers scenarios"
                ]
            },
            "behavioral": [
                "Use the STAR method (Situation, Task, Action, Result)",
                "Prepare specific examples from your experience",
                "Show how you handle conflict and teamwork",
                "Demonstrate leadership and problem-solving skills",
                "Research the company culture and values"
            ],
            "system_design": [
                "Start with requirements gathering and clarifications",
                "Think about scalability from the beginning",
                "Consider data storage and retrieval patterns",
                "Discuss trade-offs between different approaches",
                "Address monitoring, logging, and error handling"
            ]
        }
        
        # Select appropriate tips
        tips = tips_database.get(interview_type, {})
        if isinstance(tips, dict):
            selected_tips = tips.get("general", [])
            if experience_level in tips:
                selected_tips.extend(tips[experience_level])
        else:
            selected_tips = tips
        
        # Add role-specific tips if available
        role_tips = {
            "Software Engineer": ["Practice algorithms and data structures", "Know your chosen programming language deeply"],
            "Frontend Developer": ["Understand modern frameworks", "Know CSS and responsive design"],
            "Backend Developer": ["Understand databases and APIs", "Know about scalability and performance"],
            "DevOps Engineer": ["Understand CI/CD pipelines", "Know cloud platforms and containerization"],
            "Data Scientist": ["Understand statistics and machine learning", "Be able to explain your model choices"]
        }
        
        if role and role in role_tips:
            selected_tips.extend(role_tips[role])
        
        return APIResponse(
            success=True,
            message="Interview tips retrieved",
            data={
                "role": role,
                "experience_level": experience_level,
                "interview_type": interview_type,
                "tips": selected_tips[:10]  # Limit to top 10 tips
            }
        )
        
    except Exception as e:
        logger.error(f"Get interview tips failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get interview tips")

@router.get("/trending-topics", response_model=APIResponse)
async def get_trending_tech_topics():
    """Get currently trending technology topics and questions"""
    trending_topics = {
        "hot_technologies": [
            {"name": "Artificial Intelligence & Machine Learning", "questions": 156},
            {"name": "Cloud Computing (AWS, Azure, GCP)", "questions": 134},
            {"name": "Kubernetes & Docker", "questions": 98},
            {"name": "React & Next.js", "questions": 87},
            {"name": "Python & Data Science", "questions": 76}
        ],
        "emerging_trends": [
            {"name": "Large Language Models (LLMs)", "questions": 45},
            {"name": "Edge Computing", "questions": 32},
            {"name": "WebAssembly", "questions": 28},
            {"name": "Quantum Computing", "questions": 19},
            {"name": "Blockchain & DeFi", "questions": 23}
        ],
        "interview_focus_areas": [
            {"area": "System Design", "frequency": "85%"},
            {"area": "Data Structures & Algorithms", "frequency": "78%"},
            {"area": "Behavioral Questions", "frequency": "92%"},
            {"area": "Code Review & Best Practices", "frequency": "67%"},
            {"area": "Problem Solving Approach", "frequency": "89%"}
        ]
    }
    
    return APIResponse(
        success=True,
        message="Trending topics retrieved",
        data=trending_topics
    )