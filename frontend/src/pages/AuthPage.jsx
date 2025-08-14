import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/auth.js';
import { 
  Bot, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight,
  Zap,
  Brain,
  MessageSquare
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const { signIn, signUp, loading, error } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = isSignUp 
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);

    if (!result.success) {
      toast.error(result.error || 'Authentication failed');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900 relative overflow-hidden">
      {/* Animated Background */}
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
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-varia-purple to-varia-blue rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Bot className="w-7 h-7 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold gradient-text font-poppins">Varia</h1>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6 font-poppins leading-tight">
              Create Intelligent
              <br />
              <span className="gradient-text">AI Agents</span>
            </h2>

            <p className="text-xl text-varia-gray-300 mb-12 leading-relaxed font-inter">
              Build powerful conversational AI with advanced knowledge bases, 
              real-time chat, and seamless integrations.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: Brain,
                  title: "Smart AI Agents",
                  description: "Create specialized agents with custom personalities"
                },
                {
                  icon: Zap,
                  title: "Real-time Chat",
                  description: "Low-latency conversations with WebSocket streaming"
                },
                {
                  icon: MessageSquare,
                  title: "Knowledge Base",
                  description: "Upload documents to enhance agent capabilities"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                >
                  <div className="w-10 h-10 bg-varia-gray-800/50 border border-varia-gray-700/50 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-varia-purple" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold font-poppins">{feature.title}</h3>
                    <p className="text-varia-gray-400 text-sm font-inter">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-varia-purple to-varia-blue rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold gradient-text font-poppins">Varia</h1>
              </div>
              <p className="text-varia-gray-400 font-inter">Create intelligent AI agents</p>
            </div>

            <motion.div
              className="glass rounded-3xl p-8"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 font-poppins">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-varia-gray-400 font-inter">
                  {isSignUp 
                    ? 'Start building your AI agents today' 
                    : 'Sign in to continue to your agents'
                  }
                </p>
              </div>

              <div className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-varia-gray-300 mb-2 font-inter">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-varia-gray-400" />
                    <motion.input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-4 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-xl text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300 font-inter"
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-varia-gray-300 mb-2 font-inter">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-varia-gray-400" />
                    <motion.input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-12 py-4 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-xl text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300 font-inter"
                      whileFocus={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-varia-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  onClick={handleSubmit}
                  disabled={loading || !email.trim() || !password.trim()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-varia-purple via-varia-blue to-varia-cyan text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-varia-purple/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-poppins relative overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-varia-purple/20 to-varia-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center space-x-3">
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </div>
                </motion.button>

                {/* Toggle Auth Mode */}
                <div className="text-center">
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-varia-gray-400 hover:text-white transition-colors font-inter"
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign in' 
                      : "Don't have an account? Sign up"
                    }
                  </button>
                </div>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-inter"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Features (Mobile) */}
      <div className="lg:hidden relative z-10 px-6 pb-8">
        <motion.div
          className="grid grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { icon: Brain, label: "Smart AI" },
            { icon: Zap, label: "Real-time" },
            { icon: MessageSquare, label: "Chat Ready" }
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
            >
              <div className="w-12 h-12 bg-varia-gray-800/50 border border-varia-gray-700/50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <feature.icon className="w-5 h-5 text-varia-purple" />
              </div>
              <span className="text-xs text-varia-gray-400 font-inter">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}