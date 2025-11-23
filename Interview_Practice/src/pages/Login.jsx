import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import VideoBackground from "../components/VideoBackground";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    if (isSignup) {
      // Handle Signup
      try {
        console.log("🔄 Attempting signup with:", form.email);
        const response = await api.signup(form.email, form.password);
        console.log("📥 Signup response:", response);
        setLoading(false);
        
        if (response?.success) {
          setSuccessMessage("Account created successfully! Please login.");
          setIsSignup(false); // Switch back to login mode
          setForm({ email: "", password: "" }); // Clear form
        } else {
          console.log("❌ Signup failed:", response?.message);
          setError(response?.message || "Signup failed. Try again.");
        }
      } catch (error) {
        console.error("💥 Signup error:", error);
        setLoading(false);
        setError("Signup failed. Please try again.");
      }
    } else {
      // Handle Login
      const response = await api.login(form.email, form.password);
      setLoading(false);

      if (response?.success) {
        navigate("/role"); // move to role selector page
      } else {
        setError(response?.message || "Invalid login. Try again.");
      }
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
    setSuccessMessage("");
    setForm({ email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <VideoBackground />
      <div className="bg-black/60 backdrop-blur-md border border-cyan-400/40 w-full max-w-md p-8 rounded-xl shadow-2xl relative z-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-cyan-300 hover:text-cyan-200 flex items-center gap-2 text-sm font-medium transition"
        >
          ← Back to Home
        </button>

        {/* Logo / Title */}
        <h1 className="text-2xl font-bold text-center mb-6 text-cyan-300">
          Interview Practice Partner
        </h1>

        {/* Mode Toggle Buttons */}
        <div className="flex mb-6 bg-black/40 backdrop-blur-sm rounded-lg p-1 border border-cyan-400/30">
          <button
            type="button"
            onClick={() => setIsSignup(false)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              !isSignup
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-cyan-300 hover:bg-cyan-400/10'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsSignup(true)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
              isSignup
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-cyan-300 hover:bg-cyan-400/10'
            }`}
          >
            Sign Up
          </button>
        </div>

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

          {/* Success Message */}
          {successMessage && (
            <p className="text-green-300 text-sm font-medium bg-green-900/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-green-500/30">{successMessage}</p>
          )}

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
            {loading ? (isSignup ? "Creating Account..." : "Logging in...") : (isSignup ? "Sign Up" : "Login")}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
