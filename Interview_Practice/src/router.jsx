import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import RoleSelector from "./pages/RoleSelector";
import ExperienceSelector from "./pages/ExperienceSelector";
import DifficultySelector from "./pages/DifficultySelector";
import ResumeUpload from "./pages/ResumeUpload";
import ResumeScore from "./pages/ResumeScore";
import BuildResume from "./pages/BuildResume";
import ChatWindow from "./pages/ChatWindow";
import Summary from "./pages/Summary";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/role" element={<RoleSelector />} />
        <Route path="/experience" element={<ExperienceSelector />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        <Route path="/resume-score" element={<ResumeScore />} />
        <Route path="/build-resume" element={<BuildResume />} />
        <Route path="/difficulty" element={<DifficultySelector />} />
        <Route path="/interview" element={<ChatWindow />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
