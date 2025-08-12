import React from 'react';
import { motion } from 'framer-motion';

export default function Sidebar({ tabs, activeTab, onTabChange }) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-r from-varia-purple to-varia-blue text-white shadow-lg shadow-varia-purple/25'
                : 'bg-varia-gray-800/30 text-varia-gray-400 hover:text-white hover:bg-varia-gray-700/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium font-inter">{tab.label}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}