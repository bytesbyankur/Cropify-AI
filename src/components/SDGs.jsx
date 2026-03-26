import React from 'react';
import { motion } from 'framer-motion';

const SDGs = () => {
  const goals = [
    {
      num: "2",
      title: "Zero Hunger",
      desc: "By identifying diseases early, Cropify AI helps prevent crop failure, ensuring better yields and food security.",
      color: "bg-yellow-500"
    },
    {
      num: "9",
      title: "Industry & Innovation",
      desc: "Bringing cutting-edge AI and mobile infrastructure to traditional agricultural practices in rural areas.",
      color: "bg-orange-500"
    },
    {
      num: "12",
      title: "Responsible Consumption",
      desc: "Calculates precise fungicide dosages, preventing the overuse of harmful chemicals in the environment.",
      color: "bg-amber-600"
    }
  ];

  // Animation variants for staggering the cards
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className="w-full py-20 bg-slate-50 dark:bg-slate-800/50 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
            Aligned with UN SDGs
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Our solution directly targets the United Nations Sustainable Development Goals.
          </p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {goals.map((goal, index) => (
            <motion.div key={index} variants={item} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300">
              <div className={`w-12 h-12 ${goal.color} text-white font-bold text-xl rounded-lg flex items-center justify-center mb-4 shadow-md`}>
                {goal.num}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{goal.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{goal.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SDGs;