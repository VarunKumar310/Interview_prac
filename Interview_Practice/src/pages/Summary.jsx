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
  const { chat, scoreBreakdown, overallScore, setOverallScore, role, resetInterview } = useInterview();

  // Calculate overall score from breakdown
  React.useEffect(() => {
    if (overallScore === 0 && Object.values(scoreBreakdown).some(v => v > 0)) {
      const scores = [
        scoreBreakdown.communication || 0,
        scoreBreakdown.technical || 0,
        scoreBreakdown.confidence || 0,
        Math.max(0, 100 - (scoreBreakdown.fillerWords || 0)), // Convert filler words (lower is better)
        scoreBreakdown.pace || 0,
      ];
      const calculated = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      setOverallScore(calculated);
    }
  }, [scoreBreakdown, overallScore, setOverallScore]);

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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(24);
    doc.setTextColor(34, 211, 238);
    doc.text("Interview Feedback Report", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Header Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Role: ${role || "Not specified"}`, margin, y);
    y += 8;
    doc.text(`Overall Score: ${overallScore}/100`, margin, y);
    y += 8;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 15;

    // Performance Breakdown
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Performance Breakdown", margin, y);
    y += 10;
    
    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    const scores = [
      { label: "Communication", value: scoreBreakdown.communication },
      { label: "Confidence", value: scoreBreakdown.confidence },
      { label: "Technical", value: scoreBreakdown.technical },
      { label: "Pace", value: scoreBreakdown.pace },
      { label: "Filler Words", value: scoreBreakdown.fillerWords },
    ];
    
    scores.forEach((score) => {
      doc.text(`${score.label}: ${score.value}%`, margin + 5, y);
      y += 7;
    });
    y += 10;

    // Questions and Answers
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Questions & Answers", margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    // Parse chat to extract Q&A pairs
    let currentQuestion = null;
    let qaCount = 0;
    
    chat.forEach((msg) => {
      // Check for AI/Bot messages (questions)
      if (msg.sender === "ai" || msg.sender === "bot") {
        currentQuestion = msg.text;
      } 
      // Check for user messages (answers)
      else if ((msg.sender === "user" || msg.sender === "assistant") && currentQuestion) {
        // Check if we need a new page
        if (y > pageHeight - 40) {
          doc.addPage();
          y = 20;
        }

        qaCount++;

        // Question
        doc.setFont(undefined, "bold");
        doc.setTextColor(34, 211, 238);
        const questionLines = doc.splitTextToSize(`Q${qaCount}: ${currentQuestion}`, maxWidth - 10);
        doc.text(questionLines, margin + 5, y);
        y += questionLines.length * 6 + 3;

        // Answer
        doc.setFont(undefined, "normal");
        doc.setTextColor(0, 0, 0);
        const answerLines = doc.splitTextToSize(`A: ${msg.text}`, maxWidth - 10);
        doc.text(answerLines, margin + 5, y);
        y += answerLines.length * 6 + 8;

        currentQuestion = null;
      }
    });

    // If no Q&A pairs found, add a note
    if (qaCount === 0 && chat.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("(Full transcript available in the Full Transcript section above)", margin + 5, y);
    }

    // Improvements Section
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    y += 10;
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Areas for Improvement", margin, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    const improvements = [
      "• Practice technical concepts with real-world examples",
      "• Work on communication clarity and conciseness",
      "• Reduce filler words (um, uh, like) in responses",
      "• Improve response pace - take time to think before answering",
      "• Build confidence through mock interviews",
      "• Study system design patterns for your role",
      "• Practice explaining complex concepts simply",
    ];

    improvements.forEach((improvement) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      const lines = doc.splitTextToSize(improvement, maxWidth - 10);
      doc.text(lines, margin + 5, y);
      y += lines.length * 6 + 3;
    });

    // Footer
    y = pageHeight - 10;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by AI Interview Practice Partner", pageWidth / 2, y, { align: "center" });

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