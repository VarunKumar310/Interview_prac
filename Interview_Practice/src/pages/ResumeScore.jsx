import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VideoBackground from "../components/VideoBackground";

export default function ResumeScore() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState("");
  const [score, setScore] = useState(0);
  const [analysis, setAnalysis] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // ATS Scoring Algorithm
  const calculateAtsScore = (text) => {
    let totalScore = 0;
    let maxScore = 100;
    const feedback = {};

    // 1. Length Analysis (15 points)
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount >= 300) {
      totalScore += 15;
      feedback.length = { score: 15, max: 15, message: "Good resume length" };
    } else if (wordCount >= 200) {
      totalScore += 10;
      feedback.length = { score: 10, max: 15, message: "Resume could be more detailed" };
    } else {
      totalScore += 5;
      feedback.length = { score: 5, max: 15, message: "Resume is too short" };
    }

    // 2. Contact Information (10 points)
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text);
    const hasPhone = /\b\d{10,}\b/.test(text) || /\(\d{3}\)\s*\d{3}-\d{4}/.test(text);
    const hasLinkedIn = /linkedin\.com|linkedin/.test(text.toLowerCase());
    
    let contactScore = 0;
    if (hasEmail) contactScore += 4;
    if (hasPhone) contactScore += 4;
    if (hasLinkedIn) contactScore += 2;
    
    totalScore += contactScore;
    feedback.contact = { score: contactScore, max: 10, message: `Contact info: ${contactScore}/10` };

    // 3. Skills Section (20 points)
    const technicalSkills = ['javascript', 'python', 'java', 'react', 'node', 'html', 'css', 'sql', 'aws', 'docker', 'git', 'mongodb', 'postgresql', 'typescript', 'angular', 'vue', 'django', 'flask', 'spring', 'microservices'];
    const softSkills = ['communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking', 'creativity', 'adaptability', 'time management', 'collaboration', 'project management'];
    
    const foundTechnical = technicalSkills.filter(skill => text.toLowerCase().includes(skill)).length;
    const foundSoft = softSkills.filter(skill => text.toLowerCase().includes(skill)).length;
    
    const skillsScore = Math.min((foundTechnical * 2) + (foundSoft * 1), 20);
    totalScore += skillsScore;
    feedback.skills = { score: skillsScore, max: 20, message: `Skills found: ${foundTechnical} technical, ${foundSoft} soft` };

    // 4. Experience Section (20 points)
    const experienceKeywords = ['experience', 'work', 'job', 'career', 'employment', 'position', 'role', 'company', 'organization'];
    const hasExperience = experienceKeywords.some(keyword => text.toLowerCase().includes(keyword));
    const yearsPattern = /\d+\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|work)/i;
    const hasYears = yearsPattern.test(text);
    
    let experienceScore = 0;
    if (hasExperience) experienceScore += 10;
    if (hasYears) experienceScore += 10;
    
    totalScore += experienceScore;
    feedback.experience = { score: experienceScore, max: 20, message: `Experience section: ${experienceScore}/20` };

    // 5. Education Section (15 points)
    const educationKeywords = ['education', 'university', 'college', 'degree', 'bachelor', 'master', 'phd', 'diploma', 'certification'];
    const hasEducation = educationKeywords.some(keyword => text.toLowerCase().includes(keyword));
    const degreePattern = /\b(bachelor|master|phd|b\.s\.|m\.s\.|b\.tech|m\.tech|b\.eng|m\.eng)\b/i;
    const hasDegree = degreePattern.test(text);
    
    let educationScore = 0;
    if (hasEducation) educationScore += 8;
    if (hasDegree) educationScore += 7;
    
    totalScore += educationScore;
    feedback.education = { score: educationScore, max: 15, message: `Education section: ${educationScore}/15` };

    // 6. Action Verbs (10 points)
    const actionVerbs = ['managed', 'developed', 'implemented', 'created', 'led', 'designed', 'built', 'achieved', 'improved', 'increased', 'reduced', 'optimized', 'launched', 'coordinated', 'trained', 'mentored', 'analyzed', 'researched', 'presented', 'negotiated'];
    const foundActionVerbs = actionVerbs.filter(verb => text.toLowerCase().includes(verb)).length;
    const actionVerbsScore = Math.min(foundActionVerbs * 0.5, 10);
    totalScore += actionVerbsScore;
    feedback.actionVerbs = { score: actionVerbsScore, max: 10, message: `Action verbs found: ${foundActionVerbs}` };

    // 7. Formatting & Structure (10 points)
    const hasSections = text.toLowerCase().includes('summary') || text.toLowerCase().includes('objective');
    const hasBulletPoints = /[•·▪▫‣⁃]/.test(text) || /^\s*[-*]\s/m.test(text);
    
    let formattingScore = 0;
    if (hasSections) formattingScore += 5;
    if (hasBulletPoints) formattingScore += 5;
    
    totalScore += formattingScore;
    feedback.formatting = { score: formattingScore, max: 10, message: `Structure: ${formattingScore}/10` };

    // Ensure score doesn't exceed 100
    totalScore = Math.min(totalScore, maxScore);

    return {
      total: Math.round(totalScore),
      max: maxScore,
      breakdown: feedback
    };
  };

  useEffect(() => {
    // Get resume text from localStorage
    const storedText = localStorage.getItem('resumeText');
    if (storedText) {
      setResumeText(storedText);
      
      // Simulate analysis delay
      setTimeout(() => {
        const result = calculateAtsScore(storedText);
        setScore(result.total);
        setAnalysis(result.breakdown);
        setIsAnalyzing(false);
      }, 2000);
    } else {
      // No resume found, redirect back
      navigate('/resume-upload');
    }
  }, [navigate]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent! Your resume is ATS optimized';
    if (score >= 60) return 'Good! Your resume has decent ATS compatibility';
    if (score >= 40) return 'Fair! Your resume needs some improvements';
    return 'Poor! Your resume needs significant improvements';
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <VideoBackground />
        <div className="bg-black/60 backdrop-blur-md border border-cyan-400/40 w-full max-w-2xl p-8 rounded-xl shadow-2xl relative z-10 text-center">
          <div className="text-6xl mb-4 text-cyan-400">📊</div>
          <h1 className="text-3xl font-bold mb-4 text-cyan-300">Analyzing Your Resume...</h1>
          <p className="text-gray-300 mb-6">Our ATS algorithm is scanning your resume for optimization</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <VideoBackground />
      <div className="bg-black/60 backdrop-blur-md border border-cyan-400/40 w-full max-w-4xl p-8 rounded-xl shadow-2xl relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-cyan-300 text-center">
          ATS Resume Score Analysis
        </h1>

        {/* Score Display */}
        <div className="text-center mb-8">
          <div className={`text-6xl font-bold mb-4 ${getScoreColor(score)}`}>
            {score}/100
          </div>
          <p className={`text-xl font-semibold ${getScoreColor(score)}`}>
            {getScoreMessage(score)}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/40 rounded-lg p-6">
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Score Breakdown</h3>
            {Object.entries(analysis).map(([key, data]) => (
              <div key={key} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-cyan-300 font-semibold">{data.score}/{data.max}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(data.score / data.max) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">{data.message}</p>
              </div>
            ))}
          </div>

          <div className="bg-black/40 backdrop-blur-sm border border-cyan-400/40 rounded-lg p-6">
            <h3 className="text-xl font-bold text-cyan-300 mb-4">Improvement Tips</h3>
            <ul className="space-y-3 text-gray-300">
              {analysis.contact?.score < 10 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span>Add complete contact information (email, phone, LinkedIn)</span>
                </li>
              )}
              {analysis.skills?.score < 15 && (
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Include more technical and soft skills relevant to your target role</span>
                </li>
              )}
              {analysis.experience?.score < 15 && (
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Detail your work experience with years and achievements</span>
                </li>
              )}
              {analysis.actionVerbs?.score < 7 && (
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Use more action verbs to describe your accomplishments</span>
                </li>
              )}
              {analysis.formatting?.score < 8 && (
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400">•</span>
                  <span>Improve structure with clear sections and bullet points</span>
                </li>
              )}
              {score >= 80 && (
                <li className="flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Great job! Your resume is well-optimized for ATS systems</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/difficulty')}
            className="px-8 py-3 bg-cyan-600/70 backdrop-blur-sm border border-cyan-400/60 text-white hover:bg-cyan-500/80 hover:border-cyan-300 rounded-lg text-lg font-semibold transition-all"
          >
            Continue to Interview
          </button>
          <button
            onClick={() => navigate('/resume-upload')}
            className="px-8 py-3 bg-black/30 backdrop-blur-sm border border-cyan-400/50 text-cyan-200 hover:bg-black/40 hover:border-cyan-300 rounded-lg text-lg font-semibold transition-all"
          >
            Edit Resume
          </button>
        </div>
      </div>
    </div>
  );
}
