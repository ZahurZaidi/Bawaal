import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAgentsStore } from '../store/agents.js';
import { useAuthStore } from '../store/auth.js';
import { Bot, Sparkles, ArrowRight, LogOut } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function WelcomePage() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();
  const { createAgent, loading } = useAgentsStore();
  const { user, signOut } = useAuthStore();

  const handleCreateAgent = async () => {
    if (!prompt.trim()) return;
    
    const result = await createAgent({
      name: extractAgentName(prompt),
      description: prompt.trim()
    });
    
    if (result.success) {
      navigate(`/agent/${result.agent.id}`);
    }
  };

  const extractAgentName = (description) => {
    // Simple extraction logic - could be enhanced
    const words = description.split(' ').slice(0, 3);
    return words.join(' ') + ' Agent';
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-varia-purple/20 rounded-full blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-varia-blue/20 rounded-full blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 flex justify-between items-center p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-varia-purple to-varia-blue rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold font-poppins text-white">Varia</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-varia-gray-300">
            Welcome, {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 text-varia-gray-300 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Main Heading */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold font-poppins text-white mb-4 leading-tight">
              Hey, welcome to{' '}
              <span className="bg-gradient-to-r from-varia-purple via-varia-blue to-varia-cyan bg-clip-text text-transparent">
                Varia!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-varia-gray-300 font-inter max-w-3xl mx-auto">
              Create intelligent AI agents with advanced knowledge bases and real-time conversations
            </p>
          </motion.div>

          {/* Sparkles decoration */}
          <motion.div
            className="flex justify-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                >
                  <Sparkles className="w-6 h-6 text-varia-purple" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Input Section */}
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your AI agent (e.g., 'Create a customer support agent for my e-commerce store')."
                className="w-full h-32 p-6 text-lg bg-varia-gray-800/50 backdrop-blur-sm border border-varia-gray-700/50 rounded-2xl text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300 resize-none"
                rows={3}
              />
              
              {/* Character count */}
              <div className="absolute bottom-3 right-3 text-xs text-varia-gray-500">
                {prompt.length}/500
              </div>
            </div>

            {/* Create Agent Button */}
            <motion.button
              onClick={handleCreateAgent}
              disabled={loading || !prompt.trim()}
              className="mt-8 w-full max-w-md mx-auto group relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-varia-purple via-varia-blue to-varia-cyan rounded-2xl opacity-100 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-varia-purple via-varia-blue to-varia-cyan rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
              
              <div className="relative flex items-center justify-center px-8 py-4 rounded-2xl bg-gradient-to-r from-varia-purple via-varia-blue to-varia-cyan">
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <LoadingSpinner size="sm" className="text-white" />
                    <span className="text-white font-semibold font-inter">Creating Agent...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Bot className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold font-inter text-lg">Create Agent</span>
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                )}
              </div>
            </motion.button>

            {/* Features Preview */}
            <motion.div
              className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              {[
                {
                  icon: Bot,
                  title: "Smart Agents",
                  description: "AI-powered agents with custom personalities"
                },
                {
                  icon: Sparkles,
                  title: "Knowledge Base",
                  description: "Upload documents and create intelligent responses"
                },
                {
                  icon: ArrowRight,
                  title: "Real-time Chat",
                  description: "Instant conversations with your AI agents"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-6 bg-varia-gray-800/30 backdrop-blur-sm border border-varia-gray-700/30 rounded-xl hover:border-varia-purple/30 transition-all duration-300"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="w-8 h-8 text-varia-purple mb-4 mx-auto" />
                  <h3 className="text-lg font-semibold text-white mb-2 font-inter">{feature.title}</h3>
                  <p className="text-varia-gray-400 text-sm font-roboto">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}