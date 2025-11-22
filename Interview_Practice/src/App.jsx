import React from "react";
import AppRouter from "./router.jsx";
import "./styles/tailwind.css";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      <div className="fixed inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        <AppRouter />
      </div>
    </div>
  );
}

export default App;