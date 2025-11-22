import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import VideoBackground from "../components/VideoBackground";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    // API CALL
    const response = await api.post("/login", form);

    setLoading(false);

    if (response?.success) {
      navigate("/role"); // move to role selector page
    } else {
      setError(response?.message || "Invalid login. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <VideoBackground />
      <div className="bg-black/60 backdrop-blur-md border border-cyan-400/40 w-full max-w-md p-8 rounded-xl shadow-2xl relative z-10">
        
        {/* Logo / Title */}
        <h1 className="text-2xl font-bold text-center mb-6 text-cyan-300">
          Interview Practice Partner
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email Input */}
          <div>
            <label className="block font-medium mb-1 text-white">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="your email@gmail.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black/30 backdrop-blur-sm border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-300 focus:bg-black/40"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block font-medium mb-1 text-white">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-black/30 backdrop-blur-sm border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-300 focus:bg-black/40"
              required
            />
          </div>

          {/* Error Display */}
          {error && (
            <p className="text-red-300 text-sm font-medium bg-red-900/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-500/30">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center justify-center">
          <div className="border-t border-cyan-400/30 w-1/3"></div>
          <span className="mx-2 text-cyan-200">or</span>
          <div className="border-t border-cyan-400/30 w-1/3"></div>
        </div>

        {/* Guest Mode */}
        <button
          onClick={() => navigate("/role")}
          className="w-full py-3 border border-cyan-400/50 text-cyan-200 font-medium rounded-lg hover:bg-cyan-400/10 hover:border-cyan-300 transition backdrop-blur-sm"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default Login;
