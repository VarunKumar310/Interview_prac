import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// CORRECT IMPORT — NO EXTRA DOT!
import { useInterview } from "../utils/InterviewContext.jsx";

// Components
import QuestionDisplay from "../components/QuestionDisplay";
import InterviewerAvatar from "../components/InterviewerAvatar";
import Timer from "../components/Timer";
import VideoBackground from "../components/VideoBackground";

// Utils
import { speak, playTypingSound, playDoneSound } from "../utils/audio";
import { analyzeSpeech } from "../utils/speech";

// ===== Progress Bar =====
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-black/30 backdrop-blur-sm border border-cyan-400/30 h-3 rounded-lg overflow-hidden">
    <div
      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500 shadow-lg"
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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <VideoBackground />
      
      {/* Main Container */}
      <div className="bg-black/60 backdrop-blur-md border border-cyan-400/40 w-full max-w-6xl p-6 rounded-xl shadow-2xl relative z-10 max-h-[95vh] overflow-y-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <ProgressBar progress={progress} />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
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
        <div className="bg-black/40 backdrop-blur-sm shadow-2xl rounded-2xl p-6 h-80 overflow-y-auto border border-cyan-400/50">
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
            className="flex-1 bg-black/30 border border-cyan-400/50 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40"
            placeholder="Type your answer here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendText()}
          />
          <button
            onClick={sendText}
            className="bg-cyan-600/70 backdrop-blur-sm border border-cyan-400/60 text-white hover:bg-cyan-500/80 hover:border-cyan-300 px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Send
          </button>
        </div>

        {/* Voice Controls */}
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={startListening}
            disabled={isListening}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all backdrop-blur-sm border ${
              isListening
                ? "bg-green-600/70 border-green-400/60 animate-pulse text-white"
                : "bg-green-600/70 border-green-400/60 text-white hover:bg-green-500/80 hover:border-green-300"
            }`}
          >
            {isListening ? "Listening..." : "Start Mic"}
          </button>

          <button
            onClick={stopListening}
            disabled={!isListening}
            className="bg-yellow-600/70 backdrop-blur-sm border border-yellow-400/60 text-white hover:bg-yellow-500/80 hover:border-yellow-300 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stop Mic
          </button>

          <button
            onClick={endInterview}
            className="bg-red-600/70 backdrop-blur-sm border border-red-400/60 text-white hover:bg-red-500/80 hover:border-red-300 px-6 py-3 rounded-lg font-semibold transition-all"
          >
            End Interview
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}