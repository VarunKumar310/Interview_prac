import React, { useState } from "react";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { useInterview } from "../utils/InterviewContext.jsx";
import VideoBackground from "../components/VideoBackground.jsx";

export default function BuildResume() {
  const navigate = useNavigate();
  const { setBuiltResume, setResumeText, experience } = useInterview();
  
  // Check if user is a fresher (selected "0" in experience)
  const isFresher = experience === "0";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    education: [{ degree: "", institution: "", year: "" }],
    skills: [""],
    experience: [{ role: "", company: "", duration: "", details: "" }],
    certifications: [""],
    achievements: [""],
    projects: [{ title: "", description: "" }],
  });

  // Simple fields
  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Array fields
  const updateArrayField = (field, index, value) => {
    const updated = [...form[field]];
    updated[index] = value;
    setForm({ ...form, [field]: updated });
  };

  const addArrayField = (field, emptyValue) => {
    setForm({ ...form, [field]: [...form[field], emptyValue] });
  };

  // Nested object fields
  const updateNestedField = (field, index, key, value) => {
    const updated = [...form[field]];
    updated[index][key] = value;
    setForm({ ...form, [field]: updated });
  };

  const addNestedField = (field, emptyObj) => {
    setForm({ ...form, [field]: [...form[field], emptyObj] });
  };

  // -------- PDF + Global Save --------
  const generatePDF = () => {
    // Save to global context
    setBuiltResume(form);
    setResumeText(JSON.stringify(form, null, 2));

    const doc = new jsPDF();
    let y = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(34, 211, 238);
    doc.text(form.name || "Your Name", 105, y, { align: "center" });
    y += 12;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black text for contact info
    doc.text(`${form.email} | ${form.phone}`, 105, y, { align: "center" });
    y += 20;

    const addSection = (title) => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(34, 134, 238); // Darker cyan for better visibility
      doc.text(title, 20, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // Black text for content
    };

    // Education
    if (form.education.some(e => e.degree && e.degree.trim())) {
      addSection("EDUCATION");
      form.education.forEach(edu => {
        if (edu.degree && edu.degree.trim()) {
          doc.setFont("helvetica", "bold");
          doc.text(`${edu.degree}`, 20, y);
          doc.setFont("helvetica", "normal");
          if (edu.institution) {
            doc.text(`${edu.institution}`, 20, y + 5);
          }
          if (edu.year) {
            doc.setFont("helvetica", "italic");
            doc.text(`(${edu.year})`, 20, y + 10);
            doc.setFont("helvetica", "normal");
          }
          y += 18;
        }
      });
      y += 5;
    }

    // Skills
    if (form.skills.some(s => s.trim())) {
      addSection("SKILLS");
      const skillsText = form.skills.filter(s => s.trim()).join(" • ");
      const skillsLines = doc.splitTextToSize(skillsText, 170);
      doc.text(skillsLines, 20, y);
      y += skillsLines.length * 5 + 8;
    }

    // Experience (skip for freshers)
    if (!isFresher && form.experience.some(e => e.role && e.role.trim())) {
      addSection("EXPERIENCE");
      form.experience.forEach(exp => {
        if (exp.role && exp.role.trim()) {
          doc.setFont("helvetica", "bold");
          doc.text(`${exp.role}${exp.company ? ` at ${exp.company}` : ''}`, 20, y);
          doc.setFont("helvetica", "italic");
          if (exp.duration) {
            doc.text(exp.duration, 20, y + 5);
          }
          doc.setFont("helvetica", "normal");
          if (exp.details && exp.details.trim()) {
            const details = doc.splitTextToSize(exp.details, 170);
            doc.text(details, 20, y + 10);
            y += details.length * 5 + 15;
          } else {
            y += 15;
          }
        }
      });
      y += 5;
    }

    // Projects
    if (form.projects.some(p => p.title && p.title.trim())) {
      addSection("PROJECTS");
      form.projects.forEach(p => {
        if (p.title && p.title.trim()) {
          doc.setFont("helvetica", "bold");
          doc.text(p.title, 20, y);
          doc.setFont("helvetica", "normal");
          if (p.description && p.description.trim()) {
            const desc = doc.splitTextToSize(p.description, 170);
            doc.text(desc, 20, y + 5);
            y += desc.length * 5 + 12;
          } else {
            y += 8;
          }
        }
      });
      y += 5;
    }

    // Certifications
    if (form.certifications.some(c => c && c.trim())) {
      addSection("CERTIFICATIONS");
      form.certifications.filter(c => c && c.trim()).forEach(c => {
        const certLines = doc.splitTextToSize(`• ${c}`, 170);
        doc.text(certLines, 20, y);
        y += certLines.length * 5 + 3;
      });
      y += 5;
    }

    // Achievements
    if (form.achievements.some(a => a && a.trim())) {
      addSection("ACHIEVEMENTS");
      form.achievements.filter(a => a && a.trim()).forEach(a => {
        const achieveLines = doc.splitTextToSize(`• ${a}`, 170);
        doc.text(achieveLines, 20, y);
        y += achieveLines.length * 5 + 3;
      });
      y += 5;
    }

    doc.save("My_Resume.pdf");
    navigate("/difficulty"); // Select difficulty level
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <VideoBackground />
      <div className="bg-black/60 backdrop-blur-md border border-cyan-400/40 w-full max-w-4xl p-8 rounded-xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-cyan-300">Build Your Resume</h1>

        {/* BASIC INFO */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <input
            type="text"
            placeholder="Full Name"
            className="p-3 bg-black/30 border border-cyan-400/50 rounded-lg placeholder-gray-300 text-white focus:outline-none focus:border-cyan-300 focus:bg-black/40"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="p-3 bg-black/30 border border-cyan-400/50 rounded-lg placeholder-gray-300 text-white focus:outline-none focus:border-cyan-300 focus:bg-black/40"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
          <input
            type="text"
            placeholder="Phone Number"
            className="p-3 bg-black/30 border border-cyan-400/50 rounded-lg placeholder-gray-300 text-white focus:outline-none focus:border-cyan-300 focus:bg-black/40"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>

        {/* EDUCATION */}
        <h2 className="text-xl font-bold mt-8 mb-4 text-cyan-300">Education</h2>
        {form.education.map((edu, i) => (
          <div key={i} className="grid md:grid-cols-3 gap-4 mb-4">
            <input placeholder="Degree" className="p-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40" value={edu.degree} onChange={(e) => updateNestedField("education", i, "degree", e.target.value)} />
            <input placeholder="Institution" className="p-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40" value={edu.institution} onChange={(e) => updateNestedField("education", i, "institution", e.target.value)} />
            <input placeholder="Year" className="p-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40" value={edu.year} onChange={(e) => updateNestedField("education", i, "year", e.target.value)} />
          </div>
        ))}
        <button onClick={() => addNestedField("education", { degree: "", institution: "", year: "" })} className="text-cyan-400 hover:text-cyan-300 text-sm">+ Add More Education</button>

        {/* SKILLS */}
        <h2 className="text-xl font-bold mt-8 mb-4 text-cyan-300">Skills</h2>
        {form.skills.map((s, i) => (
          <input key={i} className="w-full p-3 mb-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40" placeholder="e.g., React, Python, AWS" value={s} onChange={(e) => updateArrayField("skills", i, e.target.value)} />
        ))}
        <button onClick={() => addArrayField("skills", "")} className="text-cyan-400 hover:text-cyan-300 text-sm">+ Add Skill</button>

        {/* EXPERIENCE - Hidden for freshers */}
        {!isFresher && (
          <>
            <h2 className="text-xl font-bold mt-8 mb-4 text-cyan-300">Experience</h2>
            {form.experience.map((exp, i) => (
              <div key={i} className="space-y-3 mb-6 p-4 bg-black/20 rounded-xl border border-cyan-400/30">
                <input className="w-full p-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40" placeholder="Role" value={exp.role} onChange={(e) => updateNestedField("experience", i, "role", e.target.value)} />
                <input className="w-full p-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40" placeholder="Company" value={exp.company} onChange={(e) => updateNestedField("experience", i, "company", e.target.value)} />
                <input className="w-full p-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40" placeholder="Duration (e.g., Jan 2023 - Present)" value={exp.duration} onChange={(e) => updateNestedField("experience", i, "duration", e.target.value)} />
                <textarea className="w-full p-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40 h-24" placeholder="Key responsibilities and achievements..." value={exp.details} onChange={(e) => updateNestedField("experience", i, "details", e.target.value)} />
              </div>
            ))}
            <button onClick={() => addNestedField("experience", { role: "", company: "", duration: "", details: "" })} className="text-cyan-400 hover:text-cyan-300 text-sm">+ Add Experience</button>
          </>
        )}

        {/* Message for freshers */}
        {isFresher && (
          <div className="mt-8 p-6 bg-cyan-900/20 backdrop-blur-sm border border-cyan-400/40 rounded-lg">
            <h2 className="text-xl font-bold mb-2 text-cyan-300">Experience Section</h2>
            <p className="text-gray-300">
              Since you selected "Fresher" as your experience level, the experience section has been automatically skipped. 
              Focus on highlighting your education, skills, projects, and achievements!
            </p>
          </div>
        )}

        {/* CERTIFICATIONS */}
        <h2 className="text-xl font-bold mt-8 mb-4 text-cyan-300">Certifications</h2>
        {form.certifications.map((c, i) => (
          <input key={i} className="w-full p-3 mb-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40" placeholder="e.g., AWS Certified Solutions Architect" value={c} onChange={(e) => updateArrayField("certifications", i, e.target.value)} />
        ))}
        <button onClick={() => addArrayField("certifications", "")} className="text-cyan-400 hover:text-cyan-300 text-sm">+ Add Certification</button>

        {/* ACHIEVEMENTS */}
        <h2 className="text-xl font-bold mt-8 mb-4 text-cyan-300">Achievements</h2>
        {form.achievements.map((a, i) => (
          <input key={i} className="w-full p-3 mb-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40" placeholder="e.g., Increased revenue by 40%" value={a} onChange={(e) => updateArrayField("achievements", i, e.target.value)} />
        ))}
        <button onClick={() => addArrayField("achievements", "")} className="text-cyan-400 hover:text-cyan-300 text-sm">+ Add Achievement</button>

        {/* PROJECTS */}
        <h2 className="text-xl font-bold mt-8 mb-4 text-cyan-300">Projects</h2>
        {form.projects.map((p, i) => (
          <div key={i} className="space-y-3 mb-6 p-4 bg-black/20 rounded-xl border border-cyan-400/30">
            <input className="w-full p-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40" placeholder="Project Title" value={p.title} onChange={(e) => updateNestedField("projects", i, "title", e.target.value)} />
            <textarea className="w-full p-3 bg-black/30 border border-cyan-400/50 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-cyan-300 focus:bg-black/40 h-24" placeholder="Description, tech stack, impact..." value={p.description} onChange={(e) => updateNestedField("projects", i, "description", e.target.value)} />
          </div>
        ))}
        <button onClick={() => addNestedField("projects", { title: "", description: "" })} className="text-cyan-400 hover:text-cyan-300 text-sm">+ Add Project</button>

        {/* SUBMIT */}
        <button
          onClick={generatePDF}
          className="mt-8 w-full bg-cyan-600/70 backdrop-blur-sm border border-cyan-400/60 text-white py-4 rounded-lg text-xl font-bold hover:bg-cyan-500/80 hover:border-cyan-300 transition-all shadow-lg"
        >
          Generate Resume & Start Interview
        </button>
      </div>
    </div>
  );
}