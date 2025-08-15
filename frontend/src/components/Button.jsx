import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils.js';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  className = '',
  onClick,
  ...props 
}) {
  const baseClasses = "font-semibold rounded-xl transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:shadow-lg hover:shadow-purple-500/25 focus:ring-purple-500/50",
    secondary: "bg-slate-700/50 hover:bg-slate-600/50 text-white border border-slate-600/50 hover:border-slate-500/50 focus:ring-slate-500/50",
    outline: "border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400 focus:ring-purple-500/50",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50 focus:ring-slate-500/50"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const classes = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.05 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading && <LoadingSpinner size="sm" />}
        <span>{children}</span>
      </div>
    </motion.button>
  );
}