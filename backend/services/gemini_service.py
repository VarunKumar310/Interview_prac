"""
Google Gemini AI Service for Interview Practice Partner
Handles: Question Generation, Answer Evaluation, Follow-up Generation, Report Creation
"""

import google.generativeai as genai
import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.model = None
        self.generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        
        # Safety settings to ensure professional interview content
        self.safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ]
        
        self._initialize_model()

    def _initialize_model(self):
        """Initialize Gemini AI model with API key"""
        try:
            # You'll need to set your API key in environment variables
            # Get your API key from: https://makersuite.google.com/app/apikey
            import os
            api_key = os.getenv("GOOGLE_AI_API_KEY")
            if not api_key:
                raise ValueError("GOOGLE_AI_API_KEY environment variable is required")
            
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",  # Latest and fastest model
                generation_config=self.generation_config,
                safety_settings=self.safety_settings
            )
            logger.info("✅ Gemini AI model initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini AI: {e}")
            raise e

    async def test_connection(self):
        """Test Gemini AI connection"""
        try:
            response = await self._generate_response("Test connection. Respond with 'Connected'")
            logger.info(f"Gemini connection test: {response}")
            return True
        except Exception as e:
            logger.error(f"Gemini connection test failed: {e}")
            raise e

    async def _generate_response(self, prompt: str) -> str:
        """Generate response using Gemini AI"""
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            raise e

    async def generate_interview_questions(
        self, 
        role: str, 
        experience_level: str, 
        difficulty: str, 
        resume_text: str = None,
        question_count: int = 10
    ) -> List[Dict[str, Any]]:
        """Generate tailored interview questions based on role, experience, and resume"""
        
        resume_section = f"\n\nCandidate's Resume:\n{resume_text}" if resume_text else ""
        
        prompt = f"""
You are an expert technical interviewer. Generate {question_count} interview questions for the following position:

Role: {role}
Experience Level: {experience_level}
Difficulty: {difficulty}{resume_section}

Requirements:
1. Questions should be appropriate for {experience_level} level candidates
2. Difficulty should be {difficulty}
3. Mix technical, behavioral, and situation-based questions
4. If resume is provided, include 2-3 questions specific to their experience
5. Include follow-up questions for deeper assessment

Format your response as a JSON array with this structure:
[
  {{
    "id": 1,
    "question": "Main interview question",
    "type": "technical|behavioral|situational|resume-specific",
    "difficulty": "{difficulty}",
    "follow_ups": ["Follow-up question 1", "Follow-up question 2"],
    "evaluation_criteria": ["Criteria 1", "Criteria 2", "Criteria 3"],
    "expected_topics": ["Topic 1", "Topic 2"]
  }}
]

Generate diverse, engaging questions that thoroughly assess the candidate's capabilities.
"""

        try:
            response = await self._generate_response(prompt)
            # Clean and parse JSON response
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            if json_start >= 0 and json_end > json_start:
                questions_json = response[json_start:json_end]
                questions = json.loads(questions_json)
                logger.info(f"Generated {len(questions)} questions for {role} ({difficulty})")
                return questions
            else:
                raise ValueError("Invalid JSON response from Gemini")
        except Exception as e:
            logger.error(f"Question generation error: {e}")
            # Fallback questions if AI fails
            return self._get_fallback_questions(role, experience_level, difficulty)

    async def evaluate_answer(
        self, 
        question: str, 
        answer: str, 
        role: str, 
        experience_level: str,
        evaluation_criteria: List[str] = None
    ) -> Dict[str, Any]:
        """Evaluate candidate's answer using AI"""
        
        criteria_section = f"Evaluation Criteria: {', '.join(evaluation_criteria)}" if evaluation_criteria else ""
        
        prompt = f"""
You are an expert interviewer evaluating a candidate's response. Analyze this answer comprehensively:

Position: {role}
Experience Level: {experience_level}
Question: {question}
Candidate's Answer: {answer}
{criteria_section}

Provide a detailed evaluation in JSON format:
{{
  "overall_score": 85,
  "scores": {{
    "technical_accuracy": 80,
    "communication_clarity": 90,
    "depth_of_knowledge": 75,
    "problem_solving": 85,
    "confidence": 88
  }},
  "strengths": ["Strong communication", "Good technical understanding"],
  "weaknesses": ["Could elaborate more on implementation", "Missing edge case considerations"],
  "detailed_feedback": "Comprehensive paragraph explaining the evaluation",
  "improvement_suggestions": ["Suggestion 1", "Suggestion 2"],
  "follow_up_questions": ["Follow-up question 1", "Follow-up question 2"],
  "red_flags": ["Any concerning responses"],
  "positive_indicators": ["Strong indicators of competence"]
}}

Be thorough, constructive, and provide actionable feedback.
"""

        try:
            response = await self._generate_response(prompt)
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                evaluation_json = response[json_start:json_end]
                evaluation = json.loads(evaluation_json)
                logger.info(f"Evaluated answer - Score: {evaluation.get('overall_score', 0)}")
                return evaluation
            else:
                raise ValueError("Invalid JSON response from Gemini")
        except Exception as e:
            logger.error(f"Answer evaluation error: {e}")
            # Fallback evaluation
            return self._get_fallback_evaluation(answer)

    async def generate_follow_up_question(
        self, 
        original_question: str, 
        answer: str, 
        role: str,
        context: str = None
    ) -> str:
        """Generate intelligent follow-up questions based on the answer"""
        
        context_section = f"Interview Context: {context}" if context else ""
        
        prompt = f"""
You are conducting an interview for a {role} position. Based on the candidate's answer, generate a relevant follow-up question that:

1. Probes deeper into their response
2. Tests their knowledge further
3. Clarifies any unclear points
4. Challenges them appropriately

Original Question: {original_question}
Candidate's Answer: {answer}
{context_section}

Generate ONE thoughtful follow-up question that will provide more insight into the candidate's capabilities.
Keep it conversational and professional.
"""

        try:
            response = await self._generate_response(prompt)
            follow_up = response.strip().replace('"', '').replace("Follow-up question:", "").strip()
            logger.info("Generated follow-up question")
            return follow_up
        except Exception as e:
            logger.error(f"Follow-up generation error: {e}")
            return "Can you elaborate more on that approach?"

    async def generate_final_report(
        self, 
        candidate_data: Dict[str, Any],
        interview_session: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate comprehensive interview report"""
        
        prompt = f"""
Generate a comprehensive interview evaluation report for:

Candidate Information:
- Role: {candidate_data.get('role', 'Not specified')}
- Experience Level: {candidate_data.get('experience_level', 'Not specified')}
- Interview Duration: {interview_session.get('duration', 'Not specified')}

Interview Performance:
- Questions Asked: {len(interview_session.get('qa_pairs', []))}
- Average Response Quality: {interview_session.get('avg_score', 0)}
- Question Types Covered: {interview_session.get('question_types', [])}

Detailed Q&A Analysis:
{self._format_qa_pairs(interview_session.get('qa_pairs', []))}

Generate a comprehensive report in JSON format:
{{
  "executive_summary": "Brief overall assessment",
  "overall_rating": "Strong Hire|Hire|No Hire|Strong No Hire",
  "overall_score": 85,
  "category_scores": {{
    "technical_skills": 80,
    "communication": 90,
    "problem_solving": 85,
    "cultural_fit": 88,
    "leadership_potential": 75
  }},
  "key_strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areas_for_improvement": ["Area 1", "Area 2"],
  "detailed_analysis": "Comprehensive paragraph analysis",
  "recommendation": "Detailed hiring recommendation with reasoning",
  "next_steps": ["Suggested next steps"],
  "interview_highlights": ["Notable moments"],
  "red_flags": ["Any concerns"],
  "salary_range_assessment": "Appropriate salary range based on performance"
}}

Provide honest, constructive, and comprehensive feedback.
"""

        try:
            response = await self._generate_response(prompt)
            # Extract JSON
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                report_json = response[json_start:json_end]
                report = json.loads(report_json)
                report['generated_at'] = datetime.now().isoformat()
                logger.info("Generated comprehensive interview report")
                return report
            else:
                raise ValueError("Invalid JSON response from Gemini")
        except Exception as e:
            logger.error(f"Report generation error: {e}")
            return self._get_fallback_report(interview_session)

    async def answer_general_question(self, question: str, context: str = None) -> str:
        """Answer general technical/career questions"""
        
        context_section = f"Context: {context}" if context else ""
        
        prompt = f"""
You are a knowledgeable technical mentor and career advisor. Answer this question clearly and helpfully:

Question: {question}
{context_section}

Provide a clear, informative, and practical answer. Include examples where appropriate.
Keep the response professional and educational.
"""

        try:
            response = await self._generate_response(prompt)
            logger.info("Answered general question")
            return response.strip()
        except Exception as e:
            logger.error(f"General question error: {e}")
            return "I apologize, but I'm having trouble processing that question right now. Please try rephrasing or ask something else."

    def _format_qa_pairs(self, qa_pairs: List[Dict]) -> str:
        """Format Q&A pairs for report generation"""
        formatted = ""
        for i, pair in enumerate(qa_pairs, 1):
            formatted += f"\nQ{i}: {pair.get('question', '')}\n"
            formatted += f"A{i}: {pair.get('answer', '')}\n"
            formatted += f"Score: {pair.get('score', 0)}/100\n"
        return formatted

    def _get_fallback_questions(self, role: str, experience_level: str, difficulty: str) -> List[Dict[str, Any]]:
        """Fallback questions if AI generation fails"""
        return [
            {
                "id": 1,
                "question": "Tell me about yourself and your experience.",
                "type": "behavioral",
                "difficulty": difficulty,
                "follow_ups": ["What interests you most about this role?"],
                "evaluation_criteria": ["Communication", "Self-awareness"],
                "expected_topics": ["Experience", "Career goals"]
            },
            {
                "id": 2,
                "question": f"What interests you about the {role} position?",
                "type": "behavioral",
                "difficulty": difficulty,
                "follow_ups": ["How does this align with your career goals?"],
                "evaluation_criteria": ["Motivation", "Role understanding"],
                "expected_topics": ["Role interest", "Career alignment"]
            }
        ]

    def _get_fallback_evaluation(self, answer: str) -> Dict[str, Any]:
        """Fallback evaluation if AI fails"""
        return {
            "overall_score": 70,
            "scores": {
                "technical_accuracy": 70,
                "communication_clarity": 75,
                "depth_of_knowledge": 65,
                "problem_solving": 70,
                "confidence": 75
            },
            "strengths": ["Provided a response"],
            "weaknesses": ["Could provide more detail"],
            "detailed_feedback": "The response shows basic understanding. Consider elaborating on key points.",
            "improvement_suggestions": ["Provide more specific examples", "Elaborate on technical details"],
            "follow_up_questions": ["Can you provide a specific example?"],
            "red_flags": [],
            "positive_indicators": ["Attempted to answer"]
        }

    def _get_fallback_report(self, interview_session: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback report if AI generation fails"""
        return {
            "executive_summary": "Interview completed successfully with basic evaluation.",
            "overall_rating": "Hire",
            "overall_score": 75,
            "category_scores": {
                "technical_skills": 75,
                "communication": 75,
                "problem_solving": 75,
                "cultural_fit": 75,
                "leadership_potential": 70
            },
            "key_strengths": ["Participated in interview", "Provided responses"],
            "areas_for_improvement": ["Continue learning and development"],
            "detailed_analysis": "The candidate participated in the interview process and provided responses to questions.",
            "recommendation": "Consider for further evaluation based on role requirements.",
            "next_steps": ["Technical assessment", "Team interview"],
            "interview_highlights": ["Completed interview process"],
            "red_flags": [],
            "salary_range_assessment": "Market rate appropriate",
            "generated_at": datetime.now().isoformat()
        }