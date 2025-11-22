import { useState, useEffect, useRef } from 'react';
import { useInterview } from '../utils/InterviewContext.jsx';

export default function VoiceControls({ onTranscript }) {
  const { addMessage } = useInterview();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showTextFallback, setShowTextFallback] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setShowTextFallback(true);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript);
        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(stopListening, 2000); // 2 sec silence = stop
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
      setShowTextFallback(true);
    };

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  const startListening = () => {
    setTranscript('');
    setIsListening(true);
    setShowTextFallback(false);
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (transcript.trim()) {
      const cleanTranscript = transcript.trim();
      addMessage('user', cleanTranscript);        // Saves to chat logs
      if (onTranscript) onTranscript(cleanTranscript); // For ChatWindow to continue AI response
    }
  };

  const handleTextSubmit = () => {
    if (transcript.trim()) {
      addMessage('user', transcript.trim());
      if (onTranscript) onTranscript(transcript.trim());
      setTranscript('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Voice Button */}
      {!showTextFallback ? (
        <div className="text-center">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl transition-all duration-300 
              ${isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {/* Pulsing ring when listening */}
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping"></span>
                <span className="absolute inset-2 rounded-full border-4 border-red-300 animate-ping delay-300"></span>
              </>
            )}
            
            <div className="flex flex-col items-center justify-center h-full text-white">
              {isListening ? (
                <>
                  <svg className="w-10 h-10 md:w-14 md:h-14" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3a1 1 0 00-1 1v5a1 1 0 002 0V4a1 1 0 00-1-1z" />
                    <path fillRule="evenodd" d="M4 8a6 6 0 1112 0v4a6 6 0 11-12 0V8z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs mt-1">Stop</span>
                </>
              ) : (
                <>
                  <svg className="w-10 h-10 md:w-14 md:h-14" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" clipRule="evenodd" />
                    <path d="M5.5 9.5a3.5 3.5 0 117 0v4a3.5 3.5 0 11-7 0v-4z" />
                  </svg>
                  <span className="text-xs mt-1">Speak</span>
                </>
              )}
            </div>
          </button>

          <p className="mt-6 text-lg font-medium text-gray-700">
            {isListening ? 'Listening… Speak your answer' : 'Click the microphone to start'}
          </p>
          {transcript && (
            <p className="mt-4 text-gray-600 italic">"{transcript}"</p>
          )}
        </div>
      ) : (
        /* Text Fallback */
        <div className="space-y-4">
          <p className="text-center text-gray-600">Microphone not available. Type your answer:</p>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
            rows="4"
          />
          <button
            onClick={handleTextSubmit}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Send Answer
          </button>
        </div>
      )}
    </div>
  );
}