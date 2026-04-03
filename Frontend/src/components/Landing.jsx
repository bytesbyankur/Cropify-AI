import React from 'react';
import { motion } from 'framer-motion';
// Import your JSON data directly!
import teamData from '../data/team.json'; 
import { TRANSLATIONS } from './translations'; // Import the dictionary

const Landing = ({ setActiveView, language = "English" }) => {
  // Grab the correct language dictionary based on the global state
  const t = TRANSLATIONS[language] || TRANSLATIONS["English"];

  return (
    <div className="w-full">
      
      {/* 1. HERO SECTION */}
      <header className="text-center py-24 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6"
        >
          {t.heroTitle1} <br/><span className="text-emerald-500">{t.heroTitle2}</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10"
        >
          {t.heroSub}
        </motion.p>
        <motion.button 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ 
            opacity: 1, 
            y: [0, -10, 0], 
            scale: [1, 1.05, 1], 
            boxShadow: [
              "0px 10px 20px rgba(16, 185, 129, 0.2)", 
              "0px 20px 40px rgba(16, 185, 129, 0.5)", 
              "0px 10px 20px rgba(16, 185, 129, 0.2)"
            ]
          }} 
          transition={{ 
            opacity: { delay: 0.2, duration: 0.5 },
            y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
            scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
            boxShadow: { repeat: Infinity, duration: 3, ease: "easeInOut" }
          }}
          whileHover={{ scale: 1.1, backgroundColor: "#059669", transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setActiveView('scanner'); window.scrollTo(0, 0); }}
          className="px-10 py-5 bg-emerald-500 text-white font-extrabold text-xl rounded-2xl shadow-2xl relative z-10"
        >
          {t.heroBtn}
        </motion.button>
      </header>

      {/* 2. PROBLEM STATEMENT */}
      <section id="problem" className="py-24 bg-slate-50 dark:bg-slate-800/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">{t.probTitle}</h2>
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {t.probHead}
                </h3>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{t.probP1}</p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{t.probP2}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative rounded-3xl overflow-hidden shadow-2xl h-80 md:h-[400px]">
              <img src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=1000" alt="Wilted crops" className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. SOLUTION */}
      <section id="solution" className="py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative rounded-3xl overflow-hidden shadow-2xl h-80 md:h-[400px] order-2 md:order-1">
              <img src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=1000" alt="Smart Agriculture" className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply"></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6 order-1 md:order-2">
              <div>
                <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">{t.solTitle}</h2>
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {t.solHead}
                </h3>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{t.solP1}</p>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">{t.solP2}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. SDGs */}
      <section id="sdg" className="py-24 bg-slate-50 dark:bg-slate-800/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">{t.sdgTitle}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">{t.sdgSub}</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300 text-left flex flex-col">
              <div className="h-48 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800" alt="Harvest" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 w-12 h-12 bg-yellow-500 text-white font-bold text-2xl rounded-xl flex items-center justify-center shadow-lg">2</div>
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t.sdg2Title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t.sdg2Desc}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300 text-left flex flex-col">
              <div className="h-48 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" alt="Technology" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 w-12 h-12 bg-orange-500 text-white font-bold text-2xl rounded-xl flex items-center justify-center shadow-lg">9</div>
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t.sdg9Title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t.sdg9Desc}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300 text-left flex flex-col">
              <div className="h-48 relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800" alt="Nature protection" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 left-4 w-12 h-12 bg-amber-600 text-white font-bold text-2xl rounded-xl flex items-center justify-center shadow-lg">12</div>
              </div>
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t.sdg12Title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{t.sdg12Desc}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. TEAM SECTION */}
      <section id="team" className="py-24">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Team {teamData.teamName}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-16">
            Engineered at {teamData.university}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamData.members.map((member) => (
              <div key={member.id} className="bg-slate-50 dark:bg-slate-800/60 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 text-left flex flex-col items-center sm:flex-row sm:items-start gap-6">
                <div className="flex-shrink-0">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-emerald-500" />
                  ) : (
                    <div className={`w-24 h-24 ${member.avatarColor} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white dark:border-slate-800`}>
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                  <p className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-3">{member.role}</p>
                  <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;