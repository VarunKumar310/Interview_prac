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
    <div className="min-h-screen flex items-center justify-center px-4">
      <VideoBackground />
      <div className="bg-black/60 backdrop-blur-md border border-cyan-400/40 w-full max-w-xl p-8 rounded-xl shadow-2xl relative z-10">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-cyan-300 mb-6">
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
                    ? "bg-cyan-600/70 text-white border-cyan-400 shadow-lg" // Selected: cyan theme
                    : "bg-black/30 hover:bg-black/40 border-cyan-400/30 text-gray-200 hover:border-cyan-400/60" // Unselected: dark with cyan accents
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
          className="w-full mt-6 py-3 bg-cyan-600/70 backdrop-blur-sm border border-cyan-400/60 text-white font-semibold rounded-lg hover:bg-cyan-500/80 hover:border-cyan-300 transition-all shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ExperienceSelector;
