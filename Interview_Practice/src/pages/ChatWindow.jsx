import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// CORRECT IMPORT — NO EXTRA DOT!
import { useInterview } from "../utils/InterviewContext.jsx";

// Components
import QuestionDisplay from "../components/QuestionDisplay";
import InterviewerAvatar from "../components/InterviewerAvatar";
import Timer from "../components/Timer";

// Utils
import { speak, playTypingSound, playDoneSound } from "../utils/audio";
import { analyzeSpeech } from "../utils/speech";

// ===== Progress Bar (kept exactly as you had it) =====
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 h-2 mt-2 rounded">
    <div
      className="bg-blue-600 h-2 transition-all duration-300 rounded"
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default function ChatWindow() {
  const navigate = useNavigate();
  const { addMessage, chat, setScoreBreakdown, role } = useInterview();

  // Questions (you can move this to utils/questions.js later)
  const questions = [
    "Tell me about yourself.",
    "Why are you interested in this role?",
    "Explain your latest project or work experience.",
    "What are your greatest strengths?",
    "Tell me about a challenge you faced and how you handled it.",
    "Where do you see yourself in five years?"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [input, setInput] = useState("");
  const [progress, setProgress] = useState(15);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  // Initialize messages and speak first question
  useEffect(() => {
    const welcomeMsg = "Welcome! Let's start your mock interview.";
    setMessages([
      { sender: "bot", text: welcomeMsg },
      { sender: "bot", text: questions[0] }
    ]);
    addMessage("bot", welcomeMsg);
    speakQuestion(questions[0]);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.warn("Speech recognition not supported");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";

    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      handleUserResponse(transcript);
    };

    recog.onend = () => setIsListening(false);
    recognitionRef.current = recog;
  }, []);

  const speakQuestion = (text) => {
    setIsSpeaking(true);
    playTypingSound();
    speak(text, () => {
      setIsSpeaking(false);
    });
  };

  const handleUserResponse = (text) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    // Add to local and global state
    setMessages(prev => [...prev, { sender: "user", text: cleanText }]);
    addMessage("user", cleanText);

    // Analyze speech for scores
    const analysis = analyzeSpeech(cleanText);
    setScoreBreakdown(prev => ({
      ...prev,
      communication: Math.round((prev.communication + analysis.clarityScore) / 2),
      confidence: Math.round((prev.confidence + analysis.confidenceScore) / 2),
      fillerWords: Math.round((prev.fillerWords + (100 - analysis.fillerRatio * 100)) / 2)
    }));

    playDoneSound();

    // Move to next question
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        const nextQuestion = questions[nextIndex];
        setMessages(prev => [...prev, { sender: "bot", text: nextQuestion }]);
        addMessage("bot", nextQuestion);
        setProgress(prev => Math.min(prev + 17, 100));
        speakQuestion(nextQuestion);
      } else {
        setTimeout(() => navigate("/summary"), 1500);
      }
    }, 1000);
  };

  const sendText = () => {
    if (input.trim()) {
      handleUserResponse(input);
      setInput("");
    }
  };

  const startListening = () => {
    recognitionRef.current?.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const endInterview = () => {
    recognitionRef.current?.stop();
    navigate("/summary");
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white p-4 md:p-8">
      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto">
        <ProgressBar progress={progress} />
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto mt-8 space-y-8">
        {/* Interviewer Avatar */}
        <div className="flex justify-center">
          <InterviewerAvatar isSpeaking={isSpeaking} size="large" />
        </div>

        {/* Question Display */}
        <QuestionDisplay question={currentQuestion} />

        {/* Timer */}
        <div className="flex justify-center">
          <Timer initialMinutes={30} />
        </div>

        {/* Chat Messages */}
        <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl p-6 h-96 overflow-y-auto border border-cyan-500/30">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`my-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-5 py-3 rounded-2xl max-w-md break-words ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800/80 text-cyan-100"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Text Input */}
        <div className="flex gap-3">
          <input
            className="flex-1 bg-white/20 border border-cyan-500/50 rounded-xl px-4 py-3 placeholder-cyan-200 focus:outline-none focus:border-cyan-300"
            placeholder="Type your answer here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendText()}
          />
          <button
            onClick={sendText}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium transition"
          >
            Send
          </button>
        </div>

        {/* Voice Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={startListening}
            disabled={isListening}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
              isListening
                ? "bg-green-600 animate-pulse"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isListening ? "Listening..." : "Start Mic"}
          </button>

          <button
            onClick={stopListening}
            disabled={!isListening}
            className="bg-yellow-500 hover:bg-yellow-600 px-6 py-3 rounded-xl font-medium transition"
          >
            Stop Mic
          </button>

          <button
            onClick={endInterview}
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-medium transition"
          >
            End Interview
          </button>
        </div>
      </div>
    </div>
  );
}