import React from 'react';
import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, color, delay = 0 }) {
  return (
    <motion.div
      className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 font-poppins">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed font-inter">{description}</p>
    </motion.div>
  );
}