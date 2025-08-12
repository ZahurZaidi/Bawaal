import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatInterface({ agentId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    
    const userMessage = { role: "user", text: input, id: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, message: input }),
      });
      const data = await res.json();
      
      const agentMessage = { role: "agent", text: data.reply, id: Date.now() + 1 };
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: "agent", text: "Sorry, I encountered an error. Please try again.", id: Date.now() + 1 };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setInput("");
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 bg-gradient-to-r from-varia-purple to-varia-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready to chat!</h3>
              <p className="text-varia-gray-400">Start a conversation with your AI agent.</p>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === "user" ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-3 max-w-xs lg:max-w-2xl ${
                    msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-varia-purple to-varia-blue text-white'
                        : 'bg-varia-gray-700 text-varia-gray-300'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-varia-purple to-varia-blue text-white'
                        : 'bg-varia-gray-800/50 backdrop-blur-sm border border-varia-gray-700/50 text-white'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      {/* Input Area */}
      <motion.div
        className="border-t border-varia-gray-700/50 bg-varia-gray-800/30 backdrop-blur-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              disabled={loading}
              className="w-full px-6 py-4 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-2xl text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300"
            />
          </div>
          <motion.button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-4 bg-gradient-to-r from-varia-purple to-varia-blue text-white rounded-2xl hover:shadow-lg hover:shadow-varia-purple/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <Sparkles className="w-5 h-5 animate-pulse" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
