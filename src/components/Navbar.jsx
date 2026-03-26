import React from 'react';
import { motion } from 'framer-motion';

const Navbar = ({ isDarkMode, setIsDarkMode, activeView, setActiveView }) => {
  
  // Helper function for smooth scrolling with offset
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      // We calculate the position and subtract 80px (navbar height)
      const offset = 80; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="w-full px-8 py-4 flex justify-between items-center">
        
        {/* Brand / Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            setActiveView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <span className="text-3xl">🌿</span>
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-emerald-400 tracking-tight">
            Cropify AI
          </h1>
        </motion.div>

        {/* Updated Navigation Links with smooth scroll */}
        {activeView === 'landing' && (
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600 dark:text-slate-300">
            <button onClick={(e) => scrollToSection(e, 'problem')} className="hover:text-emerald-500 transition-colors">Problem</button>
            <button onClick={(e) => scrollToSection(e, 'solution')} className="hover:text-emerald-500 transition-colors">Solution</button>
            <button onClick={(e) => scrollToSection(e, 'sdg')} className="hover:text-emerald-500 transition-colors">SDGs</button>
            <button onClick={(e) => scrollToSection(e, 'team')} className="hover:text-emerald-500 transition-colors">Team</button>
          </div>
        )}
        
        {/* Controls (Toggle & Dark Mode remain same) */}
        <div className="flex items-center gap-4">
           {activeView === 'landing' ? (
            <button 
              onClick={() => {
                setActiveView('scanner');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-md shadow-emerald-500/20"
            >
              Launch Scanner
            </button>
          ) : (
            <button 
              onClick={() => setActiveView('landing')}
              className="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Back to Home
            </button>
          )}

          <div 
            className={`w-14 h-7 flex items-center bg-slate-200 dark:bg-slate-700 rounded-full p-1 cursor-pointer transition-colors shadow-inner ${isDarkMode ? 'justify-end' : 'justify-start'}`}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            <motion.div 
              layout 
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              className="w-5 h-5 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center"
            >
              {isDarkMode ? <span className="text-[10px]">🌙</span> : <span className="text-[10px]">☀️</span>}
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;