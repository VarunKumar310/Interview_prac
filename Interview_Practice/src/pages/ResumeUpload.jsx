import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterview } from "../utils/InterviewContext.jsx";
import VideoBackground from "../components/VideoBackground";
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ResumeUpload() {
  const navigate = useNavigate();
  const { setResumeText, setResumeFile } = useInterview();

  const [fileName, setFileName] = useState("");
  const [resumeTextInput, setResumeTextInput] = useState("");
  const [error, setError] = useState("");
  const [showAtsChecker, setShowAtsChecker] = useState(false);

  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    
    return new Promise((resolve, reject) => {
      fileReader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const loadingTask = pdfjsLib.getDocument({
            data: typedarray,
            // Use standard fonts to avoid font issues
            standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
          });
          
          const pdf = await loadingTask.promise;
          let fullText = '';
          
          // Extract text from all pages
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent({
              normalizeWhitespace: true,
              disableCombineTextItems: false
            });
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          resolve(fullText.trim());
        } catch (error) {
          console.error('PDF extraction error:', error);
          // Fallback: try a simpler approach
          try {
            const typedarray = new Uint8Array(e.target.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let fullText = '';
            
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(' ');
              fullText += pageText + '\n';
            }
            
            resolve(fullText.trim());
          } catch (fallbackError) {
            reject(fallbackError);
          }
        }
      };
      
      fileReader.onerror = () => reject(new Error('Failed to read file'));
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handlePDFUpload = async (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large (max 5MB)");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }
    
    setFileName(file.name);
    setResumeFile(file);
    setError("📄 Extracting text from PDF...");
    
    try {
      const extractedText = await extractTextFromPDF(file);
      
      if (extractedText.trim().length > 0) {
        setResumeTextInput(extractedText);
        setError("✅ PDF text extracted successfully! Review the text below and click 'Submit Resume Text' for ATS analysis.");
        
        // Auto-submit if text is long enough
        if (extractedText.trim().length >= 1000) {
          setTimeout(() => {
            setResumeText(extractedText.trim());
            setShowAtsChecker(true);
            setError("✅ Resume text extracted and submitted! You can now check your ATS score or continue to interview.");
          }, 1000);
        }
      } else {
        setError("⚠️ No text found in PDF. Please copy and paste your resume text manually.");
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      setError("❌ Failed to extract text from PDF. Please copy and paste your resume text manually.");
    }
  };

  const handleManualTextSubmit = () => {
    if (!resumeTextInput.trim()) {
      setError("Please enter your resume text before proceeding.");
      return;
    }
    
    if (resumeTextInput.trim().length < 1000) {
      setError("Resume text seems too short. Please ensure you've copied the complete resume (minimum 1000 characters required).");
      return;
    }
    
    setResumeText(resumeTextInput.trim());
    setShowAtsChecker(true);
    setError("✅ Resume text submitted successfully! You can now check your ATS score or continue to interview.");
  };

  const checkAtsScore = () => {
    if (!resumeTextInput.trim()) {
      setError("Please enter your resume text before checking ATS score.");
      return;
    }
    
    // Store resume text for ATS scoring
    localStorage.setItem('resumeText', resumeTextInput.trim());
    navigate('/resume-score');
  };

  const proceedWithoutResume = () => {
    setResumeText("No resume provided");
    navigate("/difficulty");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <VideoBackground />
      <div className="bg-black/60 backdrop-blur-md border border-cyan-400/40 w-full max-w-4xl p-8 rounded-xl shadow-2xl relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-cyan-300 text-center">
          Upload Your Resume
        </h1>

        {/* PDF Upload Area */}
        <div
          className="border-4 border-dashed border-cyan-400/50 bg-black/20 backdrop-blur-sm rounded-2xl p-12 hover:border-cyan-300 hover:bg-black/30 transition-all cursor-pointer relative mb-8"
          onDrop={(e) => { e.preventDefault(); handlePDFUpload(e.dataTransfer.files[0]); }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handlePDFUpload(e.target.files?.[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <div className="text-6xl mb-4 text-cyan-400">📄</div>
            <p className="text-2xl font-bold text-cyan-200 mb-2">
              Drop PDF here or click to select
            </p>
            <p className="text-sm text-gray-300">
              After uploading, you'll need to paste the text below
            </p>
            {fileName && (
              <p className="text-lg text-green-400 mt-4 font-semibold">
                ✓ Selected: {fileName}
              </p>
            )}
          </div>
        </div>

        {/* Manual Text Input Area */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-cyan-300">
            Paste Your Resume Text Here:
          </h2>
          <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/40 rounded-lg p-4">
            <p className="text-cyan-200 mb-3 text-sm">
              Copy the text from your PDF and paste it here for the most accurate interview questions:
            </p>
            <textarea
              className="w-full h-48 p-4 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40 resize-none"
              placeholder="Paste your complete resume content here...
"
              value={resumeTextInput}
              onChange={(e) => {
                setResumeTextInput(e.target.value);
                setError(""); // Clear error when user starts typing
              }}
            />
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-gray-400">
                Characters: {resumeTextInput.length} (minimum 1000 required)
              </p>
              <button
                onClick={handleManualTextSubmit}
                disabled={resumeTextInput.trim().length < 1000}
                className="px-6 py-2 bg-cyan-600/70 backdrop-blur-sm border border-cyan-400/60 text-white hover:bg-cyan-500/80 hover:border-cyan-300 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Resume Text
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <p className={`text-xl ${error.includes('uploaded!') ? 'text-green-300 bg-green-900/20 border-green-500/30' : 'text-red-300 bg-red-900/20 border-red-500/30'} backdrop-blur-sm px-4 py-3 rounded-lg border`}>
              {error}
            </p>
          </div>
        )}

        {/* ATS Checker Button - Shows after text submission */}
        {showAtsChecker && (
          <div className="mb-6 text-center">
            <button
              onClick={checkAtsScore}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg transform hover:scale-105 mb-3"
            >
              📊 Check ATS Resume Score
            </button>
            <p className="text-sm text-gray-400 mb-4">
              Get your resume scored by ATS algorithms
            </p>
            <button
              onClick={() => navigate('/difficulty')}
              className="px-6 py-2 bg-cyan-600/70 backdrop-blur-sm border border-cyan-400/60 text-white hover:bg-cyan-500/80 hover:border-cyan-300 rounded-lg font-semibold transition-all"
            >
              Continue to Interview
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={proceedWithoutResume}
            className="px-8 py-3 bg-black/30 backdrop-blur-sm border border-cyan-400/50 text-cyan-200 hover:bg-black/40 hover:border-cyan-300 rounded-lg text-lg font-semibold transition-all"
          >
            Skip Resume
          </button>
          <button
            onClick={() => navigate("/build-resume")}
            className="px-8 py-3 bg-cyan-600/70 backdrop-blur-sm border border-cyan-400/60 text-white hover:bg-cyan-500/80 hover:border-cyan-300 rounded-lg text-lg font-semibold transition-all"
          >
            Build New Resume
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            💡 <span className="text-cyan-300">Tip:</span> For best results, copy and paste your resume text rather than relying on PDF extraction
          </p>
        </div>
      </div>
    </div>
  );
}