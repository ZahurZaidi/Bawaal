import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils.js';

export default function Textarea({ 
  label, 
  error, 
  className = '', 
  maxLength,
  value = '',
  ...props 
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300 font-inter">
          {label}
        </label>
      )}
      
      <motion.textarea
        className={cn(
          "w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 resize-none font-inter leading-relaxed",
          error && "border-red-500/50 focus:ring-red-500/50",
          className
        )}
        value={value}
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        {...props}
      />
      
      <div className="flex items-center justify-between">
        {error ? (
          <motion.p
            className="text-sm text-red-400 font-inter"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        ) : (
          <span></span>
        )}
        
        {maxLength && (
          <span className="text-xs text-slate-500 font-inter">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}