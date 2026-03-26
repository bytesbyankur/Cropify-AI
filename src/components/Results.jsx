import React from 'react';
import { motion } from 'framer-motion';

const Results = ({ data }) => {
  // If there's no data yet, don't render anything
  if (!data) return null;

  // Determine severity color dynamically
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <motion.div 
      // Animation: Slides up from 50px below and fades in
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md mx-auto mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-t-4 border-emerald-500 overflow-hidden"
    >
      <div className="p-6 space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Analysis Complete
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.name}
            </h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(data.severity)}`}>
            {data.severity} Risk
          </span>
        </div>

        {/* Confidence Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-300">
            <span>AI Confidence Score</span>
            <span>{data.confidence}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              // Animation: The progress bar fills up from 0% to the confidence score
              initial={{ width: 0 }}
              animate={{ width: data.confidence }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>

        {/* Actionable Remedy Section */}
        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
          <h3 className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-2">
            <span>💡</span> Recommended Action Plan
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            {data.remedy}
          </p>
        </div>

        {/* Call to Action for Farmers */}
        <button className="w-full py-3 mt-4 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-slate-700/50 hover:bg-emerald-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
          Find Nearest Ag-Expert
        </button>

      </div>
    </motion.div>
  );
};

export default Results;