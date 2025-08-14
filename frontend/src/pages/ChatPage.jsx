import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentsStore } from '../store/agents.js';
import { useChatStore } from '../store/chat.js';
import { useAuthStore } from '../store/auth.js';
import { 
  ArrowLeft, 
  Bot, 
  Send, 
  User, 
  Sparkles,
  MessageSquare,
  Wifi,
  WifiOff,
  MoreVertical,
  Settings
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { currentAgent, fetchAgent } = useAgentsStore();
  const { 
    messages, 
    isConnected, 
    isTyping, 
    connectWebSocket, 
    disconnectWebSocket, 
    sendMessage,
    startNewConversation,
    error,
    clearError
  } = useChatStore();
  const { user } = useAuthStore();
  
  const [input, setInput] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (agentId && !isInitialized) {
      initializeChat();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [agentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error]);

  const initializeChat = async () => {
    try {
      await fetchAgent(agentId);
      startNewConversation();
      await connectWebSocket(agentId, user?.id);
      setIsInitialized(true);
    } catch (error) {
      toast.error('Failed to initialize chat');
      navigate('/');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!input.trim() || !isConnected || isTyping) return;

    const success = sendMessage(input.trim());
    if (success) {
      setInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentAgent || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900 flex flex-col">
      {/* Header */}
      <motion.header
        className="border-b border-varia-gray-700/50 bg-varia-gray-800/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate(`/agent/${agentId}`)}
                className="flex items-center space-x-2 text-varia-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-inter">Back</span>
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-varia-purple to-varia-blue rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-poppins">{currentAgent.name}</h1>
                  <div className="flex items-center space-x-2">
                    {isConnected ? (
                      <div className="flex items-center space-x-1">
                        <Wifi className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 font-inter">Connected</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <WifiOff className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-red-400 font-inter">Disconnected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => navigate(`/agent/${agentId}`)}
                className="p-2 text-varia-gray-400 hover:text-white transition-colors rounded-lg hover:bg-varia-gray-700/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="p-2 text-varia-gray-400 hover:text-white transition-colors rounded-lg hover:bg-varia-gray-700/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-varia-purple to-varia-blue rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 font-poppins">Start a conversation</h3>
              <p className="text-varia-gray-400 max-w-md mx-auto font-inter">
                Ask {currentAgent.name} anything! Your AI agent is ready to help with questions and tasks.
              </p>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-3 max-w-xs lg:max-w-2xl ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <motion.div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-varia-purple to-varia-blue text-white'
                          : 'bg-varia-gray-700/50 text-varia-gray-300 border border-varia-gray-600/50'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {message.role === 'user' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </motion.div>
                    
                    <motion.div
                      className={`rounded-2xl px-6 py-4 shadow-lg relative ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-varia-purple to-varia-blue text-white'
                          : 'bg-varia-gray-800/50 backdrop-blur-sm border border-varia-gray-700/50 text-white'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap font-inter">
                        {message.content}
                        {message.isTyping && (
                          <motion.span
                            className="inline-block w-2 h-4 bg-varia-purple ml-1"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </div>
                      {message.timestamp && (
                        <div className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-white/70' : 'text-varia-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-varia-gray-300" />
                    </div>
                    <div className="bg-varia-gray-800/50 backdrop-blur-sm border border-varia-gray-700/50 rounded-2xl px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-varia-purple rounded-full"
                              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                              transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-varia-gray-400 font-inter">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div
        className="border-t border-varia-gray-700/50 bg-varia-gray-800/30 backdrop-blur-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <motion.textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${currentAgent.name}...`}
                disabled={!isConnected || isTyping}
                rows={1}
                className="w-full px-6 py-4 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-2xl text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300 resize-none font-inter leading-relaxed disabled:opacity-50"
                style={{ minHeight: '56px', maxHeight: '120px' }}
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              
              {/* Connection Status Indicator */}
              <div className="absolute right-4 top-4">
                {isConnected ? (
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                ) : (
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                )}
              </div>
            </div>
            
            <motion.button
              onClick={handleSendMessage}
              disabled={!input.trim() || !isConnected || isTyping}
              className="px-6 py-4 bg-gradient-to-r from-varia-purple to-varia-blue text-white rounded-2xl hover:shadow-lg hover:shadow-varia-purple/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[64px]"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {isTyping ? (
                <Sparkles className="w-5 h-5 animate-pulse" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>
          
          {/* Input Hints */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4 text-xs text-varia-gray-500">
              <span className="font-inter">Press Enter to send, Shift+Enter for new line</span>
              {!isConnected && (
                <span className="text-red-400 font-inter">Reconnecting...</span>
              )}
            </div>
            <div className="text-xs text-varia-gray-500 font-inter">
              {input.length}/1000
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}