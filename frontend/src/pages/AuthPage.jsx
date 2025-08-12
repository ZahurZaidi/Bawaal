import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/auth.js'
import { Bot, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'
import { cn } from '../lib/utils.js'

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const { signIn, signUp, loading, error, clearError } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    const result = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password)
    
    if (result.success) {
      // Auth state will be updated automatically
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <motion.div
        className="max-w-md w-full space-y-8 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-varia-purple to-varia-blue rounded-2xl flex items-center justify-center shadow-lg shadow-varia-purple/25">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white font-poppins mb-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="text-varia-gray-400 font-inter">
            {isSignUp ? 'Start building your AI agents' : 'Welcome back to Varia'}
          </p>
          
          {/* Decorative sparkles */}
          <div className="flex justify-center mt-4 space-x-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Sparkles className="w-4 h-4 text-varia-purple" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          className="bg-varia-gray-800/30 backdrop-blur-sm border border-varia-gray-700/50 rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="space-y-6">
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-varia-gray-300 mb-2">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-varia-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-lg text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-varia-gray-300 mb-2">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-varia-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-lg text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-varia-gray-400 hover:text-varia-gray-300 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-varia-gray-400 hover:text-varia-gray-300 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                className="rounded-lg bg-red-500/20 border border-red-500/30 p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="text-sm text-red-300">{error}</div>
              </motion.div>
            )}

            {/* Submit button */}
            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-varia-purple to-varia-blue text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-varia-purple/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center">
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-3"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                isSignUp ? 'Create account' : 'Sign in'
              )}
            </motion.button>

            {/* Toggle sign in/sign up */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  clearError()
                  setEmail('')
                  setPassword('')
                }}
                className="text-sm text-varia-purple hover:text-varia-blue transition-colors"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AuthPage 