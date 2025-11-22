import React, { useContext } from "react";
import { jsPDF } from "jspdf";
import { InterviewContext } from "../utils/InterviewContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Report() {
  const navigate = useNavigate();

  const {
    overallScore,
    scores,
    bestAnswers,
    weakAnswers,
    recommendedQuestions,
  } = useContext(InterviewContext);

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("AI Interview Evaluation Report", 15, y);
    y += 15;

    // Overall Score
    doc.setFontSize(16);
    doc.text(`Overall Score: ${overallScore}/100`, 15, y);
    y += 12;

    // Performance Breakdown
    doc.setFontSize(18);
    doc.text("Performance Breakdown", 15, y);
    y += 10;
    doc.setFontSize(14);

    Object.entries(scores).forEach(([key, value]) => {
      doc.text(`${key.toUpperCase()}: ${value}%`, 20, y);
      y += 8;
    });

    y += 10;

    // Best Answers
    doc.setFontSize(18);
    doc.text("Best Answers", 15, y);
    y += 10;

    doc.setFontSize(13);
    bestAnswers.forEach((item) => {
      doc.text(`Q: ${item.question}`, 20, y);
      y += 7;

      const splitText = doc.splitTextToSize(item.answer, 170);
      doc.text(splitText, 25, y);
      y += splitText.length * 6 + 4;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10;

    // Weak Answers
    doc.setFontSize(18);
    doc.text("Weak Areas", 15, y);
    y += 10;

    doc.setFontSize(13);
    weakAnswers.forEach((item) => {
      doc.text(`Q: ${item.question}`, 20, y);
      y += 7;

      const splitText = doc.splitTextToSize(item.reason, 170);
      doc.text(splitText, 25, y);
      y += splitText.length * 6 + 4;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10;

    // Recommended Questions
    doc.setFontSize(18);
    doc.text("Recommended Questions to Practice", 15, y);
    y += 10;

    doc.setFontSize(13);
    recommendedQuestions.forEach((line) => {
      const formatted = doc.splitTextToSize(`• ${line}`, 170);
      doc.text(formatted, 20, y);
      y += formatted.length * 6;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Footer
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text("Report generated using AI Mock Interview System", 15, 285);

    // Download
    doc.save("Interview_Report.pdf");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Download Your Interview Report
      </h1>

      <p className="text-gray-700 text-center max-w-xl mb-6">
        This report contains your overall interview score, performance
        breakdown, strengths, improvement areas, and recommended practice
        questions.
      </p>

      <button
        onClick={generatePDF}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 text-lg"
      >
        📄 Download PDF
      </button>

      <button
        onClick={() => navigate("/summary")}
        className="mt-4 bg-gray-200 px-6 py-3 rounded-xl shadow hover:bg-gray-300"
      >
        ⬅ Back to Summary
      </button>
    </div>
  );
}
