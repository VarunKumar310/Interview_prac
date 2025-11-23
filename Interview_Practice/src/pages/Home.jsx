import React from "react";
import { useNavigate } from "react-router-dom";
import VideoBackground from "../components/VideoBackground";
import homeImage from "../assets/home.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <VideoBackground />
      
      <style>{`
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(34, 211, 238, 0.8), 0 0 60px rgba(34, 211, 238, 0.5);
          }
        }
        .glow-animation {
          animation: glow 3s ease-in-out infinite;
        }
        
        @keyframes bubbleIn {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .word {
          display: inline-block;
          margin-right: 0.3em;
          animation: bubbleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .feature-box {
          transition: all 0.3s ease;
          border-color: rgba(34, 211, 238, 0.4);
        }
        
        .feature-box:hover {
          border-color: rgba(34, 211, 238, 1);
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.6), inset 0 0 20px rgba(34, 211, 238, 0.1);
        }
      `}</style>
      
      <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        {/* Slogan - Top Section */}
        <div className="text-center mb-16 mt-8">
          <h1 className="text-5xl md:text-6xl font-bold text-cyan-300 mb-4">
            Master Your Interviews
          </h1>
          <p className="text-xl md:text-2xl font-semibold italic flex flex-wrap items-center justify-center gap-2 max-w-3xl">
            {["Practice","with","AI-powered","Mock","Interviews","Tailored","to","Your","Level"].map((word, index) => (
              <span
                key={index}
                className="word text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 font-bold"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {word}
              </span>
            ))}
          </p>
        </div>

        {/* Home Image - Circular (Positioned Below Slogan) */}
        <div className="mb-8 glow-animation">
          <img
            src={homeImage}
            alt="Interview Practice"
            className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover border-4 border-cyan-400/60"
          />
        </div>

        {/* Confidence Quote - After Image */}
        <p className="text-2xl md:text-3xl font-semibold italic mb-16 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300">
          "Confidence comes from preparation. Let's get you ready!"
        </p>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl">
          <div className="feature-box bg-black/40 backdrop-blur-md border border-cyan-400/40 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-cyan-300 font-bold mb-2">AI-Powered</h3>
            <p className="text-gray-300 text-sm">
              Get real-time feedback powered by advanced AI
            </p>
          </div>
          <div className="feature-box bg-black/40 backdrop-blur-md border border-cyan-400/40 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-cyan-300 font-bold mb-2">Detailed Analytics</h3>
            <p className="text-gray-300 text-sm">
              Track your progress with comprehensive reports
            </p>
          </div>
          <div className="feature-box bg-black/40 backdrop-blur-md border border-cyan-400/40 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-cyan-300 font-bold mb-2">Personalized</h3>
            <p className="text-gray-300 text-sm">
              Questions tailored to your role and level
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-2xl">
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg transform hover:scale-105"
          >
            🚀 Sign Up
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-4 bg-cyan-600/70 backdrop-blur-sm border border-cyan-400/60 text-white font-bold text-lg rounded-lg hover:bg-cyan-500/80 hover:border-cyan-300 transition-all shadow-lg transform hover:scale-105"
          >
            🔐 Login
          </button>
          <button
            onClick={() => navigate("/role")}
            className="px-8 py-4 bg-black/30 backdrop-blur-sm border border-cyan-400/50 text-cyan-200 font-bold text-lg rounded-lg hover:bg-black/40 hover:border-cyan-300 transition-all shadow-lg transform hover:scale-105"
          >
            👤 Continue as Guest
          </button>
        </div>

        {/* Footer Text */}
        <div className="mt-12 text-center text-gray-400">
          <p className="text-sm">
            Join thousands of professionals preparing for their dream roles
          </p>
        </div>
      </div>
    </div>
  );
}
