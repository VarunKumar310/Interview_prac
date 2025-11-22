import React from "react";
import { useNavigate } from "react-router-dom";
import { useInterview } from "../utils/InterviewContext.jsx";
import { Radar } from "react-chartjs-2";
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js";
import jsPDF from "jspdf";

// Register Chart.js components
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Summary() {
  const navigate = useNavigate();
  const { chat, scoreBreakdown, overallScore, role, resetInterview } = useInterview();

  const radarData = {
    labels: ["Communication", "Confidence", "Technical", "Pace", "Filler Words"],
    datasets: [
      {
        label: "Your Score",
        data: [
          scoreBreakdown.communication,
          scoreBreakdown.confidence,
          scoreBreakdown.technical,
          scoreBreakdown.pace,
          scoreBreakdown.fillerWords,
        ],
        backgroundColor: "rgba(34, 211, 238, 0.2)",
        borderColor: "#22d3ee",
        borderWidth: 3,
        pointBackgroundColor: "#22d3ee",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#22d3ee",
      },
    ],
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(24);
    doc.setTextColor(34, 211, 238);
    doc.text("Interview Feedback Report", 105, y, { align: "center" });
    y += 15;

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`Role: ${role || "Not specified"}`, 20, y);
    y += 10;
    doc.text(`Overall Score: ${overallScore}/100`, 20, y);
    y += 20;

    doc.setFontSize(14);
    doc.text("Performance Radar:", 20, y);
    y += 40;

    doc.setFontSize(12);
    doc.text("Full Transcript:", 20, y);
    y += 10;

    chat.forEach((msg, i) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const prefix = msg.sender === "user" ? "You: " : "AI: ";
      doc.text(prefix + msg.text.substring(0, 80) + (msg.text.length > 80 ? "..." : ""), 20, y);
      y += 7;
    });

    doc.save("Interview_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-10 text-cyan-300">Interview Summary</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Radar Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/30">
            <h2 className="text-3xl font-bold mb-6 text-center">Performance Radar</h2>
            <Radar data={radarData} options={{ responsive: true, scales: { r: { angleLines: { color: "#22d3ee50" }, grid: { color: "#22d3ee30" }, pointLabels: { color: "#fff" } } } }} />
          </div>

          {/* Score */}
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-8 border border-cyan-400/50 flex flex-col justify-center items-center">
            <h2 className="text-3xl font-bold mb-4">Overall Score</h2>
            <div className="text-8xl font-bold text-cyan-300">{overallScore || 0}</div>
            <p className="text-2xl mt-2">/ 100</p>
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/30">
          <h2 className="text-3xl font-bold mb-6">Full Transcript</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {chat.map((msg, i) => (
              <div key={i} className={`p-4 rounded-xl ${msg.sender === "user" ? "bg-blue-600/70 ml-10" : "bg-gray-800/70 mr-10"}`}>
                <p className="font-semibold">{msg.sender === "user" ? "You" : "Interviewer"}</p>
                <p className="mt-1">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-8 mt-12">
          <button
            onClick={downloadReport}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-5 rounded-xl text-xl font-bold hover:from-cyan-400 hover:to-blue-500 transition shadow-2xl"
          >
            Download PDF Report
          </button>
          <button
            onClick={() => { resetInterview(); navigate("/"); }}
            className="bg-gray-700 px-10 py-5 rounded-xl text-xl font-bold hover:bg-gray-600 transition shadow-2xl"
          >
            Practice Again
          </button>
        </div>
      </div>
    </div>
  );
}