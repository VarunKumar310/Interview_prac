const BASE_URL = "http://localhost:8000"; // FastAPI backend URL

class InterviewAPI {
  constructor() {
    this.baseURL = BASE_URL;
    this.sessionId = null;
    this.isConnected = false;
  }

  // Generic request handler with proper error handling
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error (${endpoint}):`, err);
      return { 
        success: false, 
        error: true, 
        message: err.message || 'API request failed',
        details: err
      };
    }
  }

  // Health check to verify backend connection
  async checkHealth() {
    try {
      const response = await this.request('/health');
      this.isConnected = response.status === 'healthy';
      return response;
    } catch (err) {
      this.isConnected = false;
      return { success: false, error: 'Backend not available' };
    }
  }

  // Authentication endpoints
  async login(email, password) {
    return this.request('/login', {
      method: 'POST',
      body: { email, password }
    });
  }

  async createGuestSession() {
    return this.request('/api/auth/guest-session', {
      method: 'POST'
    });
  }

  // Interview setup endpoints (enhanced)
  async setupCompleteInterview(interviewData) {
    const response = await this.request('/api/interview/setup', {
      method: 'POST',
      body: interviewData
    });
    
    if (response.success && response.session_id) {
      this.sessionId = response.session_id;
    }
    
    return response;
  }

  // Legacy endpoints for existing frontend compatibility
  async setRole(role) {
    const response = await this.request('/set-role', {
      method: 'POST',
      body: { role }
    });
    
    if (response.success && response.data?.session_id) {
      this.sessionId = response.data.session_id;
    }
    
    return response;
  }

  async setExperience(experience) {
    const response = await this.request('/set-experience', {
      method: 'POST',
      body: { experience }
    });
    
    if (response.success && response.data?.session_id) {
      this.sessionId = response.data.session_id;
    }
    
    return response;
  }

  async setDifficulty(difficulty) {
    const response = await this.request('/set-difficulty', {
      method: 'POST',
      body: { difficulty }
    });
    
    if (response.success && response.data?.session_id) {
      this.sessionId = response.data.session_id;
    }
    
    return response;
  }

  async uploadResume(resumeText, fileName = null) {
    if (!this.sessionId) {
      throw new Error('No active session. Please start interview setup first.');
    }

    return this.request(`/api/interview/set-resume?session_id=${this.sessionId}`, {
      method: 'POST',
      body: { resume_text: resumeText, file_name: fileName }
    });
  }

  // Enhanced interview management
  async getNextQuestion() {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return this.request(`/api/interview/next-question/${this.sessionId}`);
  }

  async getInterviewProgress() {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return this.request(`/api/interview/progress/${this.sessionId}`);
  }

  async generateQuestions(questionCount = 10) {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return this.request(`/api/interview/generate-questions?session_id=${this.sessionId}&question_count=${questionCount}`, {
      method: 'POST'
    });
  }

  // Answer evaluation with AI feedback
  async submitAnswer(questionId, questionText, answerText, responseTimeSeconds = null) {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return this.request('/api/evaluation/submit-answer', {
      method: 'POST',
      body: {
        session_id: this.sessionId,
        question_id: questionId,
        question_text: questionText,
        answer_text: answerText,
        response_time_seconds: responseTimeSeconds
      }
    });
  }

  // Enhanced backend answer submission
  async submitInterviewAnswer(answer) {
    return this.request('/api/interview/answer', {
      method: 'POST',
      body: {
        answer: answer,
        sessionId: this.sessionId
      }
    });
  }

  // Start new interview session
  async startInterview() {
    const response = await this.request('/api/interview/start', {
      method: 'POST'
    });
    
    if (response.success && response.sessionId) {
      this.sessionId = response.sessionId;
    }
    
    return response;
  }

  // Get current question
  async getCurrentQuestion() {
    const params = this.sessionId ? `?sessionId=${this.sessionId}` : '';
    const response = await this.request(`/api/interview/question${params}`);
    
    if (response.success && response.sessionId) {
      this.sessionId = response.sessionId;
    }
    
    return response;
  }

  async generateFollowUp(originalQuestion, answer) {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return this.request(`/api/evaluation/generate-followup?session_id=${this.sessionId}`, {
      method: 'POST',
      body: {
        original_question: originalQuestion,
        answer: answer
      }
    });
  }

  async getEvaluationHistory() {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return this.request(`/api/evaluation/evaluation-history/${this.sessionId}`);
  }

  // Report generation
  async generateFinalReport() {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return this.request('/api/reports/generate', {
      method: 'POST',
      body: {
        session_id: this.sessionId,
        include_detailed_analysis: true,
        format_type: 'json'
      }
    });
  }

  async downloadReport(format = 'json') {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return this.request(`/api/reports/download/${this.sessionId}?format_type=${format}`);
  }

  async getReportSummary() {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return this.request(`/api/reports/summary/${this.sessionId}`);
  }

  async getInterviewAnalytics() {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    return this.request(`/api/reports/analytics/${this.sessionId}`);
  }

  // General questions (AI mentor)
  async askGeneralQuestion(question, context = null) {
    return this.request('/api/questions/ask', {
      method: 'POST',
      body: { question, context }
    });
  }

  async getPopularQuestions() {
    return this.request('/api/questions/popular-questions');
  }

  async explainConcept(concept, level = 'intermediate', includeExamples = true) {
    return this.request(`/api/questions/explain-concept?concept=${encodeURIComponent(concept)}&level=${level}&include_examples=${includeExamples}`, {
      method: 'POST'
    });
  }

  async reviewCode(code, language, focusAreas = null) {
    return this.request('/api/questions/code-review', {
      method: 'POST',
      body: { code, language, focus_areas: focusAreas }
    });
  }

  async getInterviewTips(role = null, experienceLevel = null, interviewType = 'technical') {
    return this.request(`/api/questions/interview-tips?role=${role || ''}&experience_level=${experienceLevel || ''}&interview_type=${interviewType}`, {
      method: 'POST'
    });
  }

  // Session management
  setSessionId(sessionId) {
    this.sessionId = sessionId;
  }

  getSessionId() {
    return this.sessionId;
  }

  clearSession() {
    this.sessionId = null;
  }

  // Utility methods
  isSessionActive() {
    return !!this.sessionId;
  }

  async deleteSession() {
    if (this.sessionId) {
      const response = await this.request(`/api/interview/session/${this.sessionId}`, {
        method: 'DELETE'
      });
      this.clearSession();
      return response;
    }
    return { success: true, message: 'No active session to delete' };
  }
}

// Create and export singleton instance
const apiInstance = new InterviewAPI();

// Legacy API object for backward compatibility
export const api = {
  // Enhanced methods
  instance: apiInstance,
  
  // Legacy methods (maintain compatibility)
  post: async (endpoint, data) => {
    return apiInstance.request(endpoint, {
      method: 'POST',
      body: data
    });
  },

  get: async (endpoint) => {
    return apiInstance.request(endpoint);
  },

  // Enhanced methods
  setupInterview: (data) => apiInstance.setupCompleteInterview(data),
  submitAnswer: (qId, qText, aText, time) => apiInstance.submitAnswer(qId, qText, aText, time),
  generateReport: () => apiInstance.generateFinalReport(),
  askQuestion: (question, context) => apiInstance.askGeneralQuestion(question, context),
  
  // Enhanced backend methods
  startInterview: () => apiInstance.startInterview(),
  getCurrentQuestion: () => apiInstance.getCurrentQuestion(),
  submitInterviewAnswer: (answer) => apiInstance.submitInterviewAnswer(answer),
  
  // Session management
  setSession: (sessionId) => apiInstance.setSessionId(sessionId),
  getSession: () => apiInstance.getSessionId(),
  clearSession: () => apiInstance.clearSession(),
  
  // Health check
  checkHealth: () => apiInstance.checkHealth()
};

// Export both for flexibility
export default apiInstance;
