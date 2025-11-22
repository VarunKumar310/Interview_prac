import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterview } from "../utils/InterviewContext.jsx";
import * as pdfjsLib from "pdfjs-dist";
import VideoBackground from "../components/VideoBackground";

// THIS LINE USES CDN — NO LOCAL FILE NEEDED
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  "https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ResumeUpload() {
  const navigate = useNavigate();
  const { setResumeText, setResumeFile } = useInterview();

  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const extractTextFromPDF = async (file) => {
    setLoading(true);
    setProgress(20);
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgress(40);

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setProgress(60);

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n\n";
        setProgress(60 + (i / pdf.numPages) * 35);
      }

      setProgress(100);
      setResumeText(text);
      setResumeFile(file);
      setTimeout(() => navigate("/interview"), 1000);
    } catch (err) {
      setError("Failed to read PDF. Try pasting text.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) return setError("File too large");
    if (file.type !== "application/pdf") return setError("Only PDF allowed");
    setFileName(file.name);
    extractTextFromPDF(file);
  };

  return (
    <VideoBackground overlay={true} overlayOpacity={0.6}>
      <div className="min-h-screen text-white flex items-center justify-center p-8">
        <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-bold mb-8 text-cyan-300">
          Upload Your Resume
        </h1>

        <div
          className="border-4 border-dashed border-cyan-400/60 bg-black/30 backdrop-blur-md rounded-3xl p-20 hover:border-cyan-300 hover:bg-black/40 transition-all cursor-pointer relative"
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="text-9xl mb-6">PDF</div>
          <p className="text-4xl font-bold text-cyan-300">
            {loading ? "Reading PDF..." : "Drop PDF here or click"}
          </p>
          {fileName && <p className="text-2xl text-green-400 mt-6">Selected: {fileName}</p>}
        </div>

        {loading && (
          <div className="mt-10">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full h-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 shadow-lg" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xl mt-2 font-semibold">{progress}%</p>
          </div>
        )}

        {error && <p className="text-red-300 mt-8 text-xl bg-red-900/20 backdrop-blur-sm px-4 py-3 rounded-lg border border-red-500/30 inline-block">{error}</p>}

        <div className="mt-16 space-x-8">
          <button
            onClick={() => { setResumeText("No resume"); navigate("/interview"); }}
            className="px-12 py-5 bg-white/15 backdrop-blur-lg border border-white/30 hover:bg-white/25 rounded-xl text-2xl font-bold transition-all"
          >
            Skip
          </button>
          <button
            onClick={() => navigate("/build-resume")}
            className="px-12 py-5 bg-gradient-to-r from-cyan-500/80 to-purple-600/80 backdrop-blur-lg border border-cyan-400/50 hover:from-cyan-400/90 hover:to-purple-500/90 rounded-xl text-2xl font-bold transition-all"
          >
            Build Resume
          </button>
        </div>
        </div>
      </div>
    </VideoBackground>
  );
}