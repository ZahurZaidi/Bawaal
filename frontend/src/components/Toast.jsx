import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
};

const colors = {
  success: 'from-green-500 to-emerald-500',
  error: 'from-red-500 to-rose-500',
  warning: 'from-yellow-500 to-orange-500',
  info: 'from-blue-500 to-cyan-500'
};

export default function Toast({ 
  type = 'info', 
  title, 
  message, 
  isVisible, 
  onClose,
  duration = 4000 
}) {
  const Icon = icons[type];

  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden`}
          initial={{ opacity: 0, x: 300, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Gradient accent */}
          <div className={`h-1 bg-gradient-to-r ${colors[type]}`} />
          
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-r ${colors[type]} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                {title && (
                  <h4 className="text-sm font-semibold text-white font-poppins">
                    {title}
                  </h4>
                )}
                <p className="text-sm text-slate-300 font-inter">
                  {message}
                </p>
              </div>
              
              <motion.button
                onClick={onClose}
                className="flex-shrink-0 p-1 text-slate-400 hover:text-white transition-colors rounded"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}