import React, { createContext, useContext, useState } from "react";

// 1. Create Context
const InterviewContext = createContext();

// 2. Custom Hook (use this in all pages/components)
export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
};

// 3. Provider Component
export const InterviewProvider = ({ children }) => {
  // === Selection Steps ===
  const [role, setRole] = useState("");                    // e.g., "Software Engineer"
  const [experience, setExperience] = useState("");        // e.g., "Mid-level"
  const [difficulty, setDifficulty] = useState("");        // e.g., "Medium"

  // === Resume Handling ===
  const [resumeFile, setResumeFile] = useState(null);      // File object
  const [resumeText, setResumeText] = useState("");        // Extracted text from PDF
  const [builtResume, setBuiltResume] = useState("");      // User-built quick resume

  // === Interview Chat ===
  const [chat, setChat] = useState([]);                    // [{ sender: "bot" | "user", text: "...", timestamp: Date }]

  // === Scoring & Feedback ===
  const [overallScore, setOverallScore] = useState(0);

  const [scoreBreakdown, setScoreBreakdown] = useState({
    communication: 0,
    technical: 0,
    confidence: 0,
    fillerWords: 100,     // higher = better (100 = no fillers)
    pace: 0,
  });

  const [bestAnswers, setBestAnswers] = useState([]);      // Array of { question, answer }
  const [weakAnswers, setWeakAnswers] = useState([]);
  const [recommendedPractice, setRecommendedPractice] = useState([]);

  // === Helper: Add message to chat ===
  const addMessage = (sender, text) => {
    setChat(prev => [...prev, {
      sender,
      text: text.trim(),
      timestamp: new Date().toISOString()
    }]);
  };

  // === Helper: Reset everything (for "Practice Again") ===
  const resetInterview = () => {
    setRole("");
    setExperience("");
    setDifficulty("");
    setResumeFile(null);
    setResumeText("");
    setBuiltResume("");
    setChat([]);
    setOverallScore(0);
    setScoreBreakdown({ communication: 0, technical: 0, confidence: 0, fillerWords: 100, pace: 0 });
    setBestAnswers([]);
    setWeakAnswers([]);
    setRecommendedPractice([]);
  };

  // === Context Value ===
  const value = {
    // Selection
    role, setRole,
    experience, setExperience,
    difficulty, setDifficulty,

    // Resume
    resumeFile, setResumeFile,
    resumeText, setResumeText,
    builtResume, setBuiltResume,

    // Chat
    chat, addMessage, setChat,

    // Scores
    overallScore, setOverallScore,
    scoreBreakdown, setScoreBreakdown,

    // Feedback
    bestAnswers, setBestAnswers,
    weakAnswers, setWeakAnswers,
    recommendedPractice, setRecommendedPractice,

    // Actions
    resetInterview,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};

// Export Provider as default (for main.jsx)
export default InterviewProvider;