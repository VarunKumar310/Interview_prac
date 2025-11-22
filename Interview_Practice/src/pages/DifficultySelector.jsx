import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useInterview } from "../utils/InterviewContext.jsx";
import VideoBackground from "../components/VideoBackground";

const difficultyLevels = [
  { label: "Easy", value: "easy", desc: "Basic-level questions" },
  { label: "Medium", value: "medium", desc: "Moderate difficulty" },
  { label: "Hard", value: "hard", desc: "Advanced interview questions" },
  { label: "Expert", value: "expert", desc: "For senior-level challenge" },
];

const DifficultySelector = () => {
  const navigate = useNavigate();
  const { difficulty, setDifficulty } = useInterview();
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty || "");
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!selectedDifficulty) {
      setError("Please choose a difficulty level.");
      return;
    }

    setError("");

    // Save to context
    setDifficulty(selectedDifficulty);

    // Save difficulty to backend session
    await api.post("/set-difficulty", { difficulty: selectedDifficulty });

    navigate("/resume-upload");
  };

  return (
    <VideoBackground>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/90 backdrop-blur-lg w-full max-w-xl p-8 rounded-xl shadow-2xl border border-white/20">

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          Select Difficulty Level
        </h1>

        {/* Difficulty Cards */}
        <div className="grid grid-cols-1 gap-4">
          {difficultyLevels.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedDifficulty(item.value)}
              className={`w-full p-4 border rounded-lg shadow-sm text-left transition-all backdrop-blur-sm
                ${
                  selectedDifficulty === item.value
                    ? "bg-blue-600/80 text-white border-blue-400 shadow-lg"
                    : "bg-white/15 hover:bg-white/25 border-white/30 text-white"
                }
              `}
            >
              <h3 className="font-semibold text-lg">{item.label}</h3>
              <p
                className={`text-sm ${
                  selectedDifficulty === item.value
                    ? "text-blue-100"
                    : "text-white/80"
                }`}
              >
                {item.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && <p className="text-red-300 mt-3 text-center bg-red-900/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-500/30 inline-block">{error}</p>}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full mt-6 py-3 bg-blue-600/80 backdrop-blur-sm border border-blue-400/50 text-white font-semibold rounded-lg hover:bg-blue-500/90 transition-all shadow-lg"
        >
          Continue
        </button>
        </div>
      </div>
    </VideoBackground>
  );
};

export default DifficultySelector;
