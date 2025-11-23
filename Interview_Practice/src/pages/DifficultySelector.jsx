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

    navigate("/interview");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <VideoBackground />
      <div className="bg-black/60 backdrop-blur-md border border-cyan-400/40 w-full max-w-xl p-8 rounded-xl shadow-2xl relative z-10">

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-cyan-300 mb-6">
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
                    ? "bg-cyan-600/70 text-white border-cyan-400 shadow-lg"
                    : "bg-black/30 hover:bg-black/40 border-cyan-400/30 text-gray-200 hover:border-cyan-400/60"
                }
              `}
            >
              <h3 className="font-semibold text-lg">{item.label}</h3>
              <p
                className={`text-sm ${
                  selectedDifficulty === item.value
                    ? "text-cyan-100"
                    : "text-gray-300"
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
          className="w-full mt-6 py-3 bg-cyan-600/70 backdrop-blur-sm border border-cyan-400/60 text-white font-semibold rounded-lg hover:bg-cyan-500/80 hover:border-cyan-300 transition-all shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default DifficultySelector;
