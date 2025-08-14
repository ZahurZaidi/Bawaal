import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentsStore } from '../store/agents.js';
import { useAuthStore } from '../store/auth.js';
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Zap,
  ArrowRight,
  LogOut,
  User,
  Brain,
  Rocket
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { createAgent, loading } = useAgentsStore();
  const { user, signOut } = useAuthStore();
  const [prompt, setPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAgent = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your AI agent');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createAgent({
        name: extractAgentName(prompt),
        description: prompt.trim()
      });

      if (result.success) {
        toast.success('Agent created successfully!');
        navigate(`/agent/${result.agent.id}`);
      } else {
        toast.error(result.error || 'Failed to create agent');
      }
    } catch (error) {
      toast.error('Failed to create agent. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const extractAgentName = (description) => {
    const words = description.split(' ').slice(0, 3);
    return words.join(' ') + ' Agent';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateAgent();
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-varia-purple/20 to-varia-blue/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-varia-cyan/15 to-varia-pink/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-varia-purple/10 to-varia-blue/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 bg-gradient-to-r from-varia-purple to-varia-blue rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Bot className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold font-poppins gradient-text">Varia</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 bg-varia-gray-800/30 backdrop-blur-sm border border-varia-gray-700/50 rounded-full">
              <div className="w-8 h-8 bg-gradient-to-r from-varia-purple to-varia-blue rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-varia-gray-300 font-medium">{user?.email}</span>
            </div>
            <motion.button
              onClick={handleSignOut}
              className="p-2 text-varia-gray-400 hover:text-white transition-colors rounded-lg hover:bg-varia-gray-800/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold font-poppins mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <span className="text-white">Hey, welcome to </span>
            <span className="gradient-text">Varia!</span>
          </motion.h1>
          
          <motion.p
            className="text-xl text-varia-gray-300 font-inter max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Create intelligent AI agents with advanced knowledge bases and real-time chat capabilities. 
            Transform your ideas into powerful conversational AI.
          </motion.p>
        </motion.div>

        {/* Agent Creation Form */}
        <motion.div
          className="glass rounded-3xl p-8 mb-16 glow-hover"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-varia-purple to-varia-blue rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white font-poppins">Create Your AI Agent</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-varia-gray-300 mb-3 font-inter">
                Describe your AI agent
              </label>
              <motion.textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 'Create a customer support agent for my e-commerce store that can handle returns, product questions, and order tracking'"
                className="w-full h-32 px-6 py-4 bg-varia-gray-800/50 border border-varia-gray-600/50 rounded-2xl text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300 resize-none font-inter leading-relaxed"
                maxLength={500}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-varia-gray-500 font-inter">
                  Press Enter to create or Shift+Enter for new line
                </p>
                <span className="text-xs text-varia-gray-500 font-inter">
                  {prompt.length}/500
                </span>
              </div>
            </div>

            <motion.button
              onClick={handleCreateAgent}
              disabled={!prompt.trim() || isCreating || loading}
              className="w-full py-4 px-8 bg-gradient-to-r from-varia-purple via-varia-blue to-varia-cyan text-white font-semibold rounded-2xl hover:shadow-2xl hover:shadow-varia-purple/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-poppins text-lg relative overflow-hidden group"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-varia-purple/20 to-varia-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center space-x-3">
                {isCreating || loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Creating Agent...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    <span>Create Agent</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Feature Preview Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {[
            {
              icon: Brain,
              title: "Intelligent Agents",
              description: "Create AI agents with custom personalities and specialized knowledge",
              color: "from-varia-purple to-varia-blue"
            },
            {
              icon: MessageSquare,
              title: "Real-time Chat",
              description: "Engage in natural conversations with WebSocket-powered streaming",
              color: "from-varia-blue to-varia-cyan"
            },
            {
              icon: FileText,
              title: "Knowledge Base",
              description: "Upload documents and files to enhance your agent's capabilities",
              color: "from-varia-cyan to-varia-pink"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 font-poppins">{feature.title}</h3>
              <p className="text-varia-gray-400 text-sm leading-relaxed font-inter">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="flex items-center justify-center space-x-8 text-varia-gray-400">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-varia-purple" />
              <span className="text-sm font-inter">Low Latency</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 text-varia-blue" />
              <span className="text-sm font-inter">Multi-tenant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-varia-cyan" />
              <span className="text-sm font-inter">AI-Powered</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Hint */}
      <AnimatePresence>
        {prompt.length > 10 && (
          <motion.div
            className="fixed bottom-8 right-8 bg-gradient-to-r from-varia-purple to-varia-blue text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Ready to create!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}