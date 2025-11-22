import React, { useState, useEffect } from "react";

export default function Timer({ initialMinutes = 0 }) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);

  useEffect(() => {
    // Start ticking
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, []);

  // Convert seconds → MM:SS
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <span className="text-lg font-semibold text-gray-700">
        ⏱ Time: {formatTime(seconds)}
      </span>
    </div>
  );
}
