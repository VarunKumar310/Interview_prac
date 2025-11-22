import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        
        {/* Logo / Title */}
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Interview Practice Partner
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email Input */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block font-medium mb-1 text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Error Display */}
          {error && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
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
          <div className="border-t w-1/3"></div>
          <span className="mx-2 text-gray-500">or</span>
          <div className="border-t w-1/3"></div>
        </div>

        {/* Guest Mode */}
        <button
          onClick={() => navigate("/role")}
          className="w-full py-2 border border-gray-400 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default Login;
