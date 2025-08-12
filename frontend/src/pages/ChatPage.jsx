import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/auth.js'
import { useAgentsStore } from '../store/agents.js'
import { useChatStore } from '../store/chat.js'
import { Send, ArrowLeft, Bot, User, Sparkles } from 'lucide-react'
import { formatDate } from '../lib/utils.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

const ChatPage = () => {
  const { agentId } = useParams()
  const { user } = useAuthStore()
  const { currentAgent, fetchAgent } = useAgentsStore()
  const { 
    messages, 
    isConnected, 
    isTyping, 
    loading, 
    error,
    connectWebSocket, 
    disconnectWebSocket, 
    sendMessage,
    startNewConversation 
  } = useChatStore()
  
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  // Fetch agent details
  useEffect(() => {
    if (agentId) {
      fetchAgent(agentId)
    }
  }, [agentId, fetchAgent])

  // Connect to WebSocket
  useEffect(() => {
    if (agentId && user) {
      const connect = async () => {
        await connectWebSocket(agentId, user.id)
      }
      connect()
      startNewConversation()
    }

    return () => {
      disconnectWebSocket()
    }
  }, [agentId, user, connectWebSocket, disconnectWebSocket, startNewConversation])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || !isConnected) return

    const success = sendMessage(inputMessage.trim())
    if (success) {
      setInputMessage('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Agent not found</h3>
          <p className="text-varia-gray-400 mb-6">The agent you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-varia-purple hover:bg-varia-purple/80 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900 flex flex-col">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between p-6 border-b border-varia-gray-700/50 bg-varia-gray-800/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center">
          <Link to="/" className="mr-4 text-varia-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-varia-purple to-varia-blue rounded-lg flex items-center justify-center mr-3">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-poppins">{currentAgent.name}</h1>
              <div className="flex items-center">
                <div 
                  className={`h-2 w-2 rounded-full mr-2 transition-colors ${
                    isConnected ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
                  }`}
                />
                <p className="text-sm text-varia-gray-400">
                  {isConnected ? 'Connected • Ready to chat' : 'Connecting...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          className="bg-red-500/20 border-b border-red-500/30 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm text-red-300">{error}</div>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-varia-purple to-varia-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Start a conversation</h3>
            <p className="text-varia-gray-400 max-w-md mx-auto">
              Send a message to begin chatting with {currentAgent.name}.
            </p>
          </motion.div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`flex items-start space-x-3 max-w-xs lg:max-w-2xl ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-varia-purple to-varia-blue text-white'
                      : 'bg-varia-gray-700 text-varia-gray-300'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-varia-purple to-varia-blue text-white'
                      : 'bg-varia-gray-800/50 backdrop-blur-sm border border-varia-gray-700/50 text-white'
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {message.isTyping ? (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span className="text-varia-gray-300">AI is thinking...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-white/70' : 'text-varia-gray-500'
                    }`}
                  >
                    {formatDate(message.timestamp)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div
        className="border-t border-varia-gray-700/50 bg-varia-gray-800/30 backdrop-blur-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={
                  !isConnected 
                    ? "Connecting to chat..." 
                    : isTyping 
                    ? "AI is typing..." 
                    : "Type your message..."
                }
                disabled={!isConnected || isTyping}
                className="w-full px-6 py-4 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-2xl text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300"
              />
            </div>
            <motion.button
              onClick={handleSendMessage}
              disabled={!isConnected || isTyping || !inputMessage.trim()}
              className="px-6 py-4 bg-gradient-to-r from-varia-purple to-varia-blue text-white rounded-2xl hover:shadow-lg hover:shadow-varia-purple/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ChatPage
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              !isConnected 
                ? "Connecting to chat..." 
                : isTyping 
                ? "AI is typing..." 
                : "Type your message..."
            }
            disabled={!isConnected || isTyping}
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={!isConnected || isTyping || !inputMessage.trim()}
            className="btn btn-primary"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage 