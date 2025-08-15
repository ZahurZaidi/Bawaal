import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils.js';

export default function Input({ 
  label, 
  icon: Icon, 
  error, 
  className = '', 
  ...props 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300 font-inter">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        )}
        
        <motion.input
          className={cn(
            "w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 font-inter",
            Icon && "pl-12",
            error && "border-red-500/50 focus:ring-red-500/50",
            className
          )}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          {...props}
        />
      </div>
      
      {error && (
        <motion.p
          className="text-sm text-red-400 font-inter"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}