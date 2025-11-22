import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useInterview } from "../utils/InterviewContext.jsx";
import VideoBackground from "../components/VideoBackground";

const experienceLevels = [
  { label: "Fresher", value: "0" },
  { label: "0 - 1 years", value: "0-1" },
  { label: "1 - 2 years", value: "1-2" },
  { label: "2 - 3 years", value: "2-3" },
  { label: "3 - 5 years", value: "3-5" },
  { label: "5+ years", value: "5+" },
];

const ExperienceSelector = () => {
  const navigate = useNavigate();
  const { experience, setExperience } = useInterview();
  const [selectedExp, setSelectedExp] = useState(experience || "");
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!selectedExp) {
      setError("Please choose your experience level.");
      return;
    }

    setError("");

    // Save to context
    setExperience(selectedExp);

    // Send experience to backend
    await api.post("/set-experience", { experience: selectedExp });

    navigate("/difficulty");
  };

  return (
    <VideoBackground>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white/90 backdrop-blur-lg w-full max-w-xl p-8 rounded-xl shadow-2xl border border-white/20">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          Select Your Experience Level
        </h1>

        {/* Experience Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {experienceLevels.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedExp(item.value)}
              className={`p-4 border rounded-lg text-center font-medium transition-all backdrop-blur-sm
                ${
                  selectedExp === item.value
                    ? "bg-blue-600/80 text-white border-blue-400 shadow-lg" // Selected: semi-transparent blue
                    : "bg-white/15 hover:bg-white/25 border-white/30 text-white" // Unselected: transparent with white text
                }
              `}
            >
              {item.label}
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

export default ExperienceSelector;
