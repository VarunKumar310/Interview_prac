import React, { useState } from 'react';
import backgroundVideo from '../assets/background-video.mp4';

const VideoBackground = () => {
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          filter: 'brightness(0.7) contrast(1.2)',
        }}
        onError={() => {
          console.log('Video failed to load, using fallback background');
          setVideoError(true);
        }}
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* Fallback background when video fails */}
      {videoError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-black"></div>
      )}

      {/* Light overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Subtle animated particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400/20 rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-blue-400/30 rounded-full animate-float-delay"></div>
        <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-purple-400/15 rounded-full animate-float-slow"></div>
      </div>
    </div>
  );
};

export default VideoBackground;