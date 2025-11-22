# AI Interview Practice Partner - Backend

A comprehensive FastAPI backend powered by Google Gemini AI for intelligent interview practice and evaluation.

## 🚀 Features

### Core AI Capabilities
- **Question Generation**: Dynamic interview questions based on role, experience, and difficulty
- **Answer Evaluation**: Real-time AI-powered assessment with detailed feedback
- **Follow-up Generation**: Intelligent follow-up questions based on responses
- **Final Report Generation**: Comprehensive interview reports with insights
- **General Q&A**: Technical and career guidance ("What is bubble sort?", "Explain REST API")

### Technical Stack
- **Framework**: FastAPI (high-performance async Python web framework)
- **AI Provider**: Google Gemini (Google AI SDK) - Latest and most capable model
- **Session Management**: File-based session storage with automatic cleanup
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **CORS Support**: Configured for React frontend integration

## 📦 Quick Start

### 1. Setup (Windows)
```bash
# Clone or navigate to backend directory
cd backend

# Run automated setup
setup.bat
```

### 2. Configuration
Edit `.env` file and add your Google AI API key:
```env
GOOGLE_AI_API_KEY=your_api_key_here
```
Get your API key from: https://makersuite.google.com/app/apikey

### 3. Start Server
```bash
# Start the FastAPI server
start_server.bat
```

Server will be available at:
- **Main API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🏗️ Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── requirements.txt        # Python dependencies
├── setup.bat              # Windows setup script
├── start_server.bat       # Server startup script
├── .env.example           # Environment variables template
├── config/
│   └── settings.py        # Application configuration
├── services/
│   ├── gemini_service.py  # Google Gemini AI integration
│   ├── session_service.py # Session management
│   └── interview_service.py # Interview orchestration
├── routes/
│   ├── auth.py           # Authentication endpoints
│   ├── interview.py      # Interview management
│   ├── evaluation.py     # Answer evaluation
│   ├── reports.py        # Report generation
│   └── user_questions.py # General Q&A
├── models/
│   └── api_models.py     # Pydantic data models
└── data/                 # Session and report storage
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/guest-session` - Create guest session
- `POST /api/auth/logout` - Logout

### Interview Management  
- `POST /api/interview/create-session` - Create interview session
- `POST /api/interview/setup` - Setup complete interview
- `POST /api/interview/set-role` - Set job role (legacy)
- `POST /api/interview/set-experience` - Set experience level (legacy)
- `POST /api/interview/set-difficulty` - Set difficulty (legacy)
- `GET /api/interview/next-question/{session_id}` - Get next question
- `GET /api/interview/progress/{session_id}` - Get interview progress

### Answer Evaluation
- `POST /api/evaluation/submit-answer` - Submit and evaluate answer
- `POST /api/evaluation/generate-followup` - Generate follow-up question
- `GET /api/evaluation/evaluation-history/{session_id}` - Get evaluation history

### Report Generation
- `POST /api/reports/generate` - Generate final report
- `GET /api/reports/download/{session_id}` - Download report
- `GET /api/reports/summary/{session_id}` - Get report summary
- `GET /api/reports/analytics/{session_id}` - Get detailed analytics

### General Questions
- `POST /api/questions/ask` - Ask general technical questions
- `GET /api/questions/popular-questions` - Get popular questions
- `POST /api/questions/explain-concept` - Get concept explanations
- `POST /api/questions/code-review` - Get AI code review

## 🎯 AI Capabilities

### Question Generation
```python
# Generates tailored questions based on:
- Job role (Software Engineer, Data Scientist, etc.)
- Experience level (Fresher to 5+ years)  
- Difficulty (Easy, Medium, Hard, Expert)
- Resume content (personalized questions)
- Question count (5-20 questions)
```

### Answer Evaluation
```python
# AI evaluates answers on:
- Technical accuracy (0-100)
- Communication clarity (0-100)  
- Depth of knowledge (0-100)
- Problem-solving approach (0-100)
- Confidence level (0-100)
- Provides detailed feedback and improvement suggestions
```

### Report Generation
```python
# Comprehensive reports include:
- Executive summary
- Overall hiring recommendation
- Category-wise scores
- Key strengths and weaknesses
- Detailed analysis
- Next steps and salary assessment
```

## 🔗 Frontend Integration

### API Base URL
```javascript
const BASE_URL = "http://localhost:8000";
```

### Example API Calls
```javascript
// Create interview session
const response = await fetch(`${BASE_URL}/api/interview/setup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: "Software Engineer",
    experience_level: "1-2", 
    difficulty: "medium",
    resume_text: "...",
    question_count: 10
  })
});

// Submit answer for evaluation
const evaluation = await fetch(`${BASE_URL}/api/evaluation/submit-answer`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: "session_abc123",
    question_id: 1,
    question_text: "Tell me about yourself",
    answer_text: "I am a software engineer..."
  })
});
```

## 🛠️ Development

### Manual Setup
```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies  
pip install -r requirements.txt

# Create directories
mkdir data data\sessions data\reports logs

# Copy environment file
copy .env.example .env

# Start server
python -m uvicorn main:app --reload
```

### Adding New Features
1. Add data models in `models/api_models.py`
2. Implement service logic in `services/`
3. Create API routes in `routes/`
4. Update `main.py` to include new routes

## 🔒 Security & Best Practices

- Environment variable configuration
- Input validation with Pydantic
- CORS properly configured for frontend
- Rate limiting ready for production
- Comprehensive error handling
- Structured logging

## 📊 Monitoring & Analytics

- Session statistics tracking
- Performance analytics
- Interview completion rates
- Popular question tracking
- Score distribution analysis

## 🚢 Deployment

### Production Checklist
1. Set strong `SECRET_KEY` in production
2. Configure proper `ALLOWED_ORIGINS`
3. Set up proper database (PostgreSQL recommended)
4. Configure logging to files/services
5. Set up monitoring and health checks
6. Use proper HTTPS certificates
7. Configure rate limiting

### Docker Deployment
```dockerfile
# Dockerfile example
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Integration Points

### Frontend Compatibility
- All existing frontend API calls supported
- Legacy endpoints maintained for smooth transition
- Enhanced error responses with detailed feedback
- Real-time interview progress tracking

### Data Flow
```
Frontend → FastAPI → Gemini AI → Response → Frontend
     ↓
Session Storage → Report Generation → Analytics
```

## 📈 Scalability

- Async FastAPI for high concurrency
- Stateless design for horizontal scaling  
- File-based storage (easily replaceable with database)
- Modular service architecture
- Caching ready for Redis integration

---

## 🎯 Why This Backend?

✅ **Extremely Easy Integration** - Drop-in replacement for existing API calls  
✅ **Zero Complex Setup** - Simple batch files get you running in minutes  
✅ **Google Gemini AI** - Latest and most capable AI model  
✅ **Stable & Fast** - FastAPI async performance with proper error handling  
✅ **Production Ready** - Comprehensive logging, monitoring, and security  
✅ **Instant Results** - Real-time question generation and evaluation  

Ready to transform your interview practice with AI! 🚀