import React, { useState, useEffect } from "react";

export default function Timer({ initialMinutes = 20 }) {
  const [seconds, setSeconds] = useState(0);
  const maxSeconds = initialMinutes * 60; // 20 minutes = 1200 seconds
  const isTimeWarning = seconds > maxSeconds * 0.75; // Warning when 75% of time is used

  useEffect(() => {
    // Start ticking
    const interval = setInterval(() => {
      setSeconds((prev) => {
        // Stop at max time
        if (prev >= maxSeconds) {
          return maxSeconds;
        }
        return prev + 1;
      });
    }, 1000);

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, [maxSeconds]);

  // Convert seconds → MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Determine color based on time usage
  const getTimeColor = () => {
    if (seconds >= maxSeconds) {
      return "text-red-600"; // Time's up
    }
    if (isTimeWarning) {
      return "text-orange-600"; // Warning
    }
    return "text-gray-700"; // Normal
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <span className={`text-lg font-semibold ${getTimeColor()}`}>
        ⏱ Time: {formatTime(seconds)}
      </span>
      {seconds >= maxSeconds && (
        <span className="text-sm text-red-600 font-semibold">Time's up!</span>
      )}
    </div>
  );
}
