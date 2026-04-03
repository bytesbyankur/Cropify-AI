import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Scanner from './components/Scanner';
import Results from './components/ResultsCard';
import { TRANSLATIONS } from './components/translations'; // IMPORT DICTIONARY

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // 🔥 GLOBAL LANGUAGE STATE
  const [language, setLanguage] = useState("English");
  const t = TRANSLATIONS[language] || TRANSLATIONS["English"];

  const [activeView, setActiveView] = useState('landing'); 
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diseaseData, setDiseaseData] = useState(null);

  return (
    <div className={`app-container ${isDarkMode ? 'dark-mode' : 'light-mode'} min-h-screen overflow-x-hidden pt-24`}>
      <Navbar 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        activeView={activeView}
        setActiveView={setActiveView}
        language={language}          // PASSED DOWN
        setLanguage={setLanguage}    // PASSED DOWN
      />
      
      <AnimatePresence mode="wait">
        {activeView === 'landing' ? (
          <motion.main 
            key="landing-view"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.3 }}
          >
            {/* PASSED DOWN TO LANDING */}
            <Landing setActiveView={setActiveView} language={language} /> 
          </motion.main>
        ) : (
          <motion.main 
            key="scanner-view"
            initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-4xl mx-auto pt-10 px-4 pb-20"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Disease Diagnostic Scanner</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">{t.uploadText}</p>
            </div>

            {/* PASSED DOWN TO SCANNER */}
            <Scanner 
              imagePreview={imagePreview} setImagePreview={setImagePreview}
              isAnalyzing={isAnalyzing} setIsAnalyzing={setIsAnalyzing}
              setDiseaseData={setDiseaseData} language={language}
            />
            {diseaseData && <Results data={diseaseData} onReset={() => setDiseaseData(null)} language={language} />}
          </motion.main>
        )}
      </AnimatePresence>

      <footer className="w-full py-12 bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🌿</span>
                <span className="text-xl font-bold text-white tracking-tight">Cropify AI</span>
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">VSSUT Burla, Odisha</p>
            </div>
            <div className="text-center md:text-right space-y-2">
              <p className="text-sm font-medium">© 2026 <span className="text-emerald-500">Team Pixel Pirates</span>. {t.footerRights}</p>
              <div className="flex items-center justify-center md:justify-end gap-3 text-xs text-slate-500">
                <span>IEEE YESIST 12</span><span className="w-1 h-1 bg-slate-700 rounded-full"></span><span>Innovation Challenge</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">{t.footerMotto}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;