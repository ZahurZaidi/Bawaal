import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../store/auth.js'
import { useAgentsStore } from '../store/agents.js'
import { useChatStore } from '../store/chat.js'
import { Send, ArrowLeft, Bot, User } from 'lucide-react'
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
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentAgent) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Agent not found</h3>
        <p className="text-gray-600">The agent you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn btn-primary mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <Link to="/dashboard" className="mr-4 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center">
            <Bot className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-lg font-medium text-gray-900">{currentAgent.name}</h1>
              <div className="flex items-center">
                <div 
                  className={`h-2 w-2 rounded-full mr-2 ${
                    isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                  }`}
                />
                <p className="text-sm text-gray-500">
                  {isConnected ? 'Connected • Ready to chat' : 'Connecting...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Start a conversation</h3>
            <p className="mt-1 text-sm text-gray-500">
              Send a message to begin chatting with {currentAgent.name}.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm">
                    {message.isTyping ? (
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-primary-200' : 'text-gray-500'
                    }`}
                  >
                    {formatDate(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
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