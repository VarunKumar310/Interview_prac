export default function InterviewerAvatar({ 
  isSpeaking = false, 
  size = "large" // "large" | "medium" | "small"
}) {
  // Using the local interviewer avatar image from public folder
  const interviewerImg = "/interviewer-avatar.png";
  const sizeMap = {
    large: "w-80 h-80 md:w-96 md:h-96",
    medium: "w-48 h-48 md:w-64 md:h-64",
    small: "w-32 h-32 md:w-40 md:h-40"
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glowing halo */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-3xl animate-pulse"></div>
      
      {/* Pulsing ring when speaking */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full border-8 border-cyan-400/60 animate-ping"></div>
      )}

      {/* Main avatar container */}
      <div className={`
        relative ${sizeMap[size]} rounded-full overflow-hidden
        border-4 border-cyan-400 shadow-2xl
        ring-8 ring-cyan-300/40 ring-offset-8 ring-offset-black/80
        transition-all duration-500
        ${isSpeaking ? 'ring-cyan-200/80 scale-105 shadow-cyan-400/50' : ''}
      `}>
        <img 
          src={interviewerImg} 
          alt="AI Interviewer" 
          className="w-full h-full object-cover"
        />

        {/* Holographic scanline effect when speaking */}
        {isSpeaking && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80 animate-scan"></div>
            <div className="h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-scan-delayed"></div>
          </div>
        )}

        {/* Subtle grid overlay (cyberpunk touch) */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 255, 255, 0.03) 10px, rgba(0, 255, 255, 0.03) 20px)`,
          }}
        />

        {/* Inner glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-cyan-400/20"></div>
      </div>

      {/* Floating particles when speaking */}
      {isSpeaking && (
        <>
          <div className="absolute w-2 h-2 bg-cyan-300 rounded-full animate-float top-8 left-12"></div>
          <div className="absolute w-3 h-3 bg-cyan-400 rounded-full animate-float-delay top-24 right-10"></div>
          <div className="absolute w-1 h-1 bg-white rounded-full animate-float-slow bottom-12 left-20"></div>
        </>
      )}
    </div>
  );
}