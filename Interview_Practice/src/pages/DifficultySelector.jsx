import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useInterview } from "../utils/InterviewContext.jsx";

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl p-8 rounded-xl shadow-lg">

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Select Difficulty Level
        </h1>

        {/* Difficulty Cards */}
        <div className="grid grid-cols-1 gap-4">
          {difficultyLevels.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedDifficulty(item.value)}
              className={`w-full p-4 border rounded-lg shadow-sm text-left transition-all
                ${
                  selectedDifficulty === item.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-blue-50 border-gray-300"
                }
              `}
            >
              <h3 className="font-semibold text-lg">{item.label}</h3>
              <p
                className={`text-sm ${
                  selectedDifficulty === item.value
                    ? "text-blue-100"
                    : "text-gray-600"
                }`}
              >
                {item.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && <p className="text-red-600 mt-3 text-center">{error}</p>}

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full mt-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default DifficultySelector;
