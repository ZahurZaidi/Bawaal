import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth.js';
import { Bot, User, LogOut } from 'lucide-react';

export default function Header({ title = "Varia" }) {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <motion.header
      className="relative z-10 p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Bot className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold font-poppins gradient-text">{title}</h1>
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-full">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-slate-300 font-medium">{user?.email}</span>
            </div>
            <motion.button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.header>
  );
}