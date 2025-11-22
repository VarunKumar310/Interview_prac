// src/utils/audio.js

// Text-to-Speech: Speak AI interviewer's questions
export const speak = (text, onEnd = null) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Best voice for professional interviewer (female, US English)
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => 
    v.name.includes('Google US English') || 
    v.name.includes('Samantha') || 
    v.name.includes('Karen') || 
    v.lang === 'en-US'
  );
  
  utterance.voice = preferredVoice || voices[0];
  utterance.rate = 0.9;     // Natural pace
  utterance.pitch = 1.0;
  utterance.volume = 1;

  if (onEnd) utterance.onend = onEnd;

  // Small delay to prevent cutting off
  setTimeout(() => window.speechSynthesis.speak(utterance), 100);
};

// Play subtle typing sound when AI is "thinking"
export const playTypingSound = () => {
  const audio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");
  audio.volume = 0.1;
  audio.play().catch(() => {});
};

// Play soft "beep" when user finishes speaking
export const playDoneSound = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
};