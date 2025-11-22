// src/utils/speech.js

// Detect filler words and speech metrics
export const analyzeSpeech = (transcript) => {
  const lower = transcript.toLowerCase();
  const words = transcript.trim().split(/\s+/);
  const wordCount = words.length;
  const durationSec = 10; // You can measure real duration later

  const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'right', 'kind of'];
  let fillerCount = 0;
  
  words.forEach(word => {
    if (fillerWords.includes(word.replace(/[^\w]/g, '').toLowerCase())) {
      fillerCount++;
    }
  });

  const wpm = Math.round((wordCount / durationSec) * 60); // words per minute
  const fillerRatio = fillerCount / wordCount;

  return {
    fillerWords: fillerCount,
    fillerRatio,
    wordsPerMinute: wpm,
    clarityScore: wpm > 100 && wpm < 170 ? 90 : wpm < 100 ? 70 : 60,
    confidenceScore: fillerRatio < 0.05 ? 95 : fillerRatio < 0.1 ? 80 : 60,
    hasLongPauses: transcript.includes('...') || transcript.match(/,\s{2,}/g),
    wordCount,
    durationSec
  };
};

// Optional: Detect hesitation from audio volume (advanced)
export const detectHesitationFromAudio = async (audioBlob) => {
  // This is a bonus — you can expand later with Web Audio API
  return new Promise((resolve) => {
    const audioContext = new AudioContext();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      
      let silentChunks = 0;
      const threshold = 0.01;
      const chunkSize = 1024;

      for (let i = 0; i < channelData.length; i += chunkSize) {
        let sum = 0;
        for (let j = 0; j < chunkSize && i + j < channelData.length; j++) {
          sum += Math.abs(channelData[i + j]);
        }
        if (sum / chunkSize < threshold) silentChunks++;
      }

      const hesitationScore = silentChunks > 50 ? 60 : 90;
      resolve({ hesitationScore, longPauses: silentChunks > 100 });
    };
    reader.readBlob(audioBlob);
  });
};