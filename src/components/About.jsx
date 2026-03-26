import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <section className="w-full py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            About <span className="text-emerald-500">Cropify AI</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Crop diseases cause massive agricultural losses globally, disproportionately affecting smallholder farmers. 
            <strong> Cropify AI</strong> bridges the gap between advanced Machine Learning and grassroots agriculture. 
            By utilizing Edge AI and a mobile-first approach, we provide farmers with instant, offline-capable disease 
            identification and actionable, eco-friendly treatment plans—right in the palm of their hands.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;