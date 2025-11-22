import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useInterview } from "../utils/InterviewContext.jsx";

const rolesList = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Machine Learning Engineer",
  "Data Scientist",
  "AI Engineer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "QA / Test Engineer",
  "Mobile App Developer",
  "UI/UX Designer",
  "Product Manager",
  "Data Analyst",
  "Blockchain Developer",
  "Game Developer",
  "Network Engineer",
  "Database Administrator",
  "IT Support Engineer",
  "Site Reliability Engineer",
  "Embedded Systems Engineer",
  "Big Data Engineer",
  "Business Analyst",
];

const RoleSelector = () => {
  const navigate = useNavigate();
  const { role, setRole } = useInterview();
  const [selectedRole, setSelectedRole] = useState(role || "");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const filteredRoles = rolesList.filter((role) =>
    role.toLowerCase().includes(search.toLowerCase())
  );

  const handleContinue = async () => {
    if (!selectedRole) {
      setError("Please select a job role.");
      return;
    }

    setError("");

    // Save to context
    setRole(selectedRole);

    // SAVE ROLE TO BACKEND SESSION
    await api.post("/set-role", { role: selectedRole });

    navigate("/experience");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-3xl p-8 rounded-xl shadow-lg">
        
        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Select Your Job Role
        </h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search job roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        {/* Grid of Roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
          {filteredRoles.length === 0 ? (
            <p className="text-center text-gray-500">No roles found</p>
          ) : (
            filteredRoles.map((role, index) => (
              <button
                key={index}
                onClick={() => setSelectedRole(role)}
                className={`p-4 border rounded-lg text-left font-medium transition-all shadow-sm
                  ${
                    selectedRole === role
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-blue-50 border-gray-300"
                  }`}
              >
                {role}
              </button>
            ))
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-red-600 mt-3">{error}</p>}

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

export default RoleSelector;
