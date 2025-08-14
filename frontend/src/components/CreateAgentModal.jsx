import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentsStore } from '../store/agents.js';
import { 
  X, 
  Bot, 
  Sparkles, 
  ArrowRight,
  FileText,
  Zap
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner.jsx';
import toast from 'react-hot-toast';

export default function CreateAgentModal({ isOpen, onClose, onSuccess }) {
  const { createAgent, loading } = useAgentsStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await createAgent({
      name: name.trim(),
      description: description.trim()
    });

    if (result.success) {
      toast.success('Agent created successfully!');
      setName('');
      setDescription('');
      onClose();
      if (onSuccess) {
        onSuccess(result.agent);
      }
    } else {
      toast.error(result.error || 'Failed to create agent');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              className="relative w-full max-w-lg bg-varia-gray-800/90 backdrop-blur-sm border border-varia-gray-700/50 rounded-3xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-varia-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-varia-purple to-varia-blue rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-poppins">Create New Agent</h3>
                </div>
                <motion.button
                  onClick={handleClose}
                  className="p-2 text-varia-gray-400 hover:text-white transition-colors rounded-lg hover:bg-varia-gray-700/50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                {/* Agent Name */}
                <div>
                  <label className="block text-sm font-medium text-varia-gray-300 mb-2 font-inter">
                    Agent Name
                  </label>
                  <motion.input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., Customer Support Agent"
                    maxLength={100}
                    className="w-full px-4 py-3 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-xl text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300 font-inter"
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-varia-gray-500 font-inter">Choose a descriptive name</span>
                    <span className="text-xs text-varia-gray-500 font-inter">{name.length}/100</span>
                  </div>
                </div>

                {/* Agent Description */}
                <div>
                  <label className="block text-sm font-medium text-varia-gray-300 mb-2 font-inter">
                    Description & Purpose
                  </label>
                  <motion.textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe what your agent should do, its personality, and how it should help users..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-xl text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300 resize-none font-inter leading-relaxed"
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-varia-gray-500 font-inter">Ctrl+Enter to create</span>
                    <span className="text-xs text-varia-gray-500 font-inter">{description.length}/500</span>
                  </div>
                </div>

                {/* Feature Hints */}
                <div className="bg-varia-gray-700/30 border border-varia-gray-600/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="w-4 h-4 text-varia-purple" />
                    <span className="text-sm font-medium text-white font-inter">Pro Tips</span>
                  </div>
                  <div className="space-y-2 text-xs text-varia-gray-400 font-inter">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3 h-3 text-varia-blue" />
                      <span>Upload documents to enhance knowledge</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-varia-cyan" />
                      <span>Real-time responses with local LLM</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4">
                  <motion.button
                    onClick={handleClose}
                    className="flex-1 py-3 px-4 bg-varia-gray-700/50 border border-varia-gray-600/50 text-varia-gray-300 rounded-xl hover:bg-varia-gray-600/50 transition-all duration-300 font-inter font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={loading || !name.trim() || !description.trim()}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-varia-purple to-varia-blue text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-varia-purple/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-poppins relative overflow-hidden group"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-varia-purple/20 to-varia-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center space-x-2">
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Agent</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}