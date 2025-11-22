import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useInterview } from "../utils/InterviewContext.jsx";

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-xl p-8 rounded-xl shadow-lg">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Select Your Experience Level
        </h1>

        {/* Experience Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {experienceLevels.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedExp(item.value)}
              className={`p-4 border rounded-lg text-center font-medium transition-all 
                ${
                  selectedExp === item.value
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-blue-50 border-gray-300 shadow-sm"
                }
              `}
            >
              {item.label}
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

export default ExperienceSelector;
