import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TRANSLATIONS } from './translations';

// --- Custom Typewriter Component (Now Bulletproofed!) ---
const TypewriterText = React.memo(({ text = "", delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const textMemory = useRef(''); // Remembers the text so it doesn't restart on re-renders

  useEffect(() => {
    if (!text) return;

    const safeText = Array.isArray(text) ? text.join('\n') : String(text);
    const cleanText = safeText.replace(/\*\*/g, '').replace(/\*/g, '');

    // 🔥 If we already typed this exact text, skip the animation and just show it!
    if (textMemory.current === cleanText) {
      setDisplayedText(cleanText);
      return;
    }

    textMemory.current = cleanText;
    setDisplayedText('');
    let i = 0;

    const startTimer = setTimeout(() => {
      const typingInterval = setInterval(() => {
        setDisplayedText(cleanText.substring(0, i + 1));
        i++;
        if (i >= cleanText.length) clearInterval(typingInterval);
      }, 15); 
      
      return () => clearInterval(typingInterval);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, delay]);

  return <span>{displayedText}</span>;
});

// --- Main Results Card ---
const ResultsCard = ({ data, onReset, language = "English" }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null); // 🔥 DEFINED HERE! Controls the Google Cloud Audio
  const [availableVoices, setAvailableVoices] = useState([]); 
  
  // Pre-load offline fallback voices
  useEffect(() => {
    const loadVoices = () => setAvailableVoices(window.speechSynthesis.getVoices());
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Safety cleanup: Stop audio if user navigates away
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!data) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS["English"];

  const rawSeverity = data.severity || "";
  const cleanSeverity = rawSeverity.split(/[ .\n,]/)[0].replace(/[^a-zA-Z]/g, '');

  const severityColor = cleanSeverity ? (
    cleanSeverity.toLowerCase().match(/(high|critical|alta|critique|hoch|tinggi)/) ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
    cleanSeverity.toLowerCase().match(/(medium|moderate|media|moyen|mittel|sedang)/) ? 'bg-amber-500 text-white shadow-amber-500/30' :
    'bg-emerald-500 text-white shadow-emerald-500/30'
  ) : '';

  // ==========================================
  // 🔊 GOOGLE CLOUD + OFFLINE FALLBACK ENGINE
  // ==========================================
  const handleTTS = () => {
    // 1. If currently speaking, stop it!
    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; 
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return; 
    }

    // 2. Play the high-quality Google Cloud audio from Django!
    if (data.audio_data) {
      const audio = new Audio(data.audio_data);
      audioRef.current = audio;
      
      audio.onended = () => setIsSpeaking(false);
      
      audio.play().catch(err => {
         console.error("Audio playback failed:", err);
         setIsSpeaking(false);
      });
      
      setIsSpeaking(true);
    } 
    // 3. OFFLINE FALLBACK (If internet drops or backend fails)
    else if ('speechSynthesis' in window) {
      const script = `${t.diagConfirmed}: ${data.name}. ${t.symptoms} ${t.treatmentPlan}: ${data.remedy}`;
      const cleanScript = script.replace(/\*/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanScript);
      
      const voiceMap = { "English": "en", "Spanish": "es", "French": "fr", "German": "de", "Indonesian": "id" };
      const targetLang = voiceMap[language] || "en";
      
      if (availableVoices.length > 0) {
        const matchingVoices = availableVoices.filter(v => v.lang.startsWith(targetLang));
        if (matchingVoices.length > 0) {
          let bestVoice = matchingVoices.find(v => 
            v.name.toLowerCase().includes('female') || v.name.includes('Samantha') || v.name.includes('Google')
          );
          utterance.voice = bestVoice || matchingVoices[0];
        }
      }
      
      utterance.lang = targetLang; 
      utterance.rate = 0.9;
      utterance.pitch = 1.1; 
      
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto mt-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      {/* 1. TOP HEADER */}
      <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.diagConfirmed}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {data.name}
            </h2>
          </div>
          
          {cleanSeverity && (
            <span className={`inline-flex items-center justify-center px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide whitespace-nowrap ${severityColor}`}>
              {data.severity} {t.risk}
            </span>
          )}
        </div>

        {/* Confidence Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-600 dark:text-slate-400">{t.confidenceScore}</span>
            <span className="text-emerald-600 dark:text-emerald-400">{data.confidence}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: data.confidence }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* 2. THE 4-BOX GRID */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box 1: Weather */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/50 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">🌦️</div>
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
              {t.weatherCtx}
            </h3>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200/80 font-medium leading-relaxed flex-grow">
            <TypewriterText text={data.weather_warning || data.weatherContext} delay={500} />
          </p>
        </div>

        {/* Box 2: Symptoms */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">🔬</div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t.symptoms}
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
            <TypewriterText text={data.symptoms} delay={1500} />
          </p>
        </div>

        {/* Box 3: Root Cause */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">🦠</div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t.rootCause}
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow">
            <TypewriterText text={data.reasons || data.rootCause} delay={2500} />
          </p>
        </div>

        {/* Box 4: Treatment Plan */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">🛡️</div>
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider">
              {t.treatmentPlan}
            </h3>
          </div>
          <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200/90 leading-relaxed whitespace-pre-line flex-grow">
            <TypewriterText text={data.remedy} delay={4000} />
          </div>
        </div>

      </div>

      {/* 3. BOTTOM ACTION BAR */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between">
        
        {/* DYNAMIC TTS BUTTON */}
        <button 
          onClick={handleTTS}
          className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
            isSpeaking 
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
          }`}
        >
          <span className="text-xl">{isSpeaking ? '🛑' : '🔊'}</span>
          {isSpeaking ? t.stopAudio : t.listen}
        </button>

        <button 
          onClick={onReset}
          className="w-full md:w-auto px-8 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/30 active:scale-95"
        >
          {t.scanAnother}
        </button>
      </div>
    </motion.div>
  );
};

export default ResultsCard;