import React from 'react';
import { motion } from 'framer-motion';

const Scanner = ({ 
  imagePreview, 
  setImagePreview, 
  isAnalyzing, 
  setIsAnalyzing, 
  setDiseaseData 
}) => {

  // Handle file selection
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setDiseaseData(null); // Clear previous results when a new image is added
    }
  };

  // Mock API Call (Replace with Django later)
  const handleScan = () => {
    setIsAnalyzing(true);
    
    // Simulating a 3-second delay for the ML model to process
    setTimeout(() => {
      setDiseaseData({
        name: "Tomato Early Blight",
        confidence: "92%",
        severity: "High",
        remedy: "Prune infected lower leaves immediately. Apply copper-based fungicide to prevent spreading."
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  // Clear everything
  const handleDiscard = () => {
    setImagePreview(null);
    setDiseaseData(null);
  };

  return (
    // Framer Motion: Slides up and fades in when the page loads
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 transition-colors duration-300"
    >
      
      {!imagePreview ? (
        /* --- UPLOAD STATE --- */
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-400 dark:border-emerald-500 rounded-xl p-10 bg-emerald-50 dark:bg-emerald-900/20 transition-colors">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            id="leaf-upload" 
            className="hidden" 
          />
          <label 
            htmlFor="leaf-upload" 
            className="cursor-pointer flex flex-col items-center text-center space-y-3"
          >
            <span className="text-5xl">📸</span>
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              Tap to upload or take a photo of the affected plant.
            </p>
            <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors">
              Select Image
            </span>
          </label>
        </div>

      ) : (
        /* --- PREVIEW & SCAN STATE --- */
        <div className="space-y-4">
          
          {/* Image Container with Scanning Animation */}
          <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden shadow-inner">
            <img 
              src={imagePreview} 
              alt="Plant Leaf" 
              className={`w-full h-full object-cover transition-all ${isAnalyzing ? 'brightness-75 blur-sm' : ''}`}
            />
            
            {/* The "Laser" Scan Line Animation */}
            {isAnalyzing && (
              <motion.div 
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-1 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] z-10"
              />
            )}
            
            {/* Analyzing Overlay Text */}
            {isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <p className="bg-black/60 text-emerald-400 font-bold px-4 py-2 rounded-lg backdrop-blur-sm animate-pulse">
                  Analyzing Plant...
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleScan} 
              disabled={isAnalyzing}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors ${
                isAnalyzing ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/30'
              }`}
            >
              {isAnalyzing ? 'Processing...' : 'Identify Disease'}
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleDiscard}
              disabled={isAnalyzing}
              className="px-5 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
            >
              Discard
            </motion.button>
          </div>

        </div>
      )}
    </motion.div>
  );
};

export default Scanner;