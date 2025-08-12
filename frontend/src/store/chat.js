import { create } from 'zustand'
import { chatApi, createChatWebSocket } from '../lib/api.js'

export const useChatStore = create((set, get) => ({
  messages: [],
  conversations: [],
  currentConversation: null,
  isConnected: false,
  isTyping: false,
  loading: false,
  error: null,
  ws: null,

  // Initialize WebSocket connection
  connectWebSocket: async (agentId, userId) => {
    try {
      // Clear any existing connection
      const { ws } = get()
      if (ws) {
        ws.close()
      }

      set({ isConnected: false, error: null })
      
      const newWs = await createChatWebSocket(agentId)
      
      newWs.onopen = () => {
        console.log('WebSocket connected')
        set({ isConnected: true, error: null })
      }

      newWs.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'token') {
          set(state => ({
            messages: state.messages.map(msg => 
              msg.id === 'typing' 
                ? { ...msg, content: msg.content + data.content }
                : msg
            )
          }))
        } else if (data.type === 'end') {
          set(state => ({
            messages: state.messages.map(msg => 
              msg.id === 'typing' 
                ? { ...msg, id: data.message_id, isTyping: false }
                : msg
            ),
            isTyping: false
          }))
        }
      }

      newWs.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
        set({ isConnected: false })
        
        // Auto-reconnect if connection was lost unexpectedly
        if (event.code !== 1000 && event.code !== 1001) {
          setTimeout(() => {
            const { ws: currentWs } = get()
            if (!currentWs || currentWs.readyState === WebSocket.CLOSED) {
              console.log('Attempting to reconnect...')
              get().connectWebSocket(agentId, userId)
            }
          }, 3000)
        }
      }

      newWs.onerror = (error) => {
        console.error('WebSocket error:', error)
        set({ error: 'WebSocket connection failed', isConnected: false })
      }

      set({ ws: newWs })
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      set({ error: 'Failed to connect to chat. Please check your authentication and try again.', isConnected: false })
    }
  },

  // Disconnect WebSocket
  disconnectWebSocket: () => {
    const { ws } = get()
    if (ws) {
      ws.close()
      set({ ws: null, isConnected: false })
    }
  },

  // Send a message
  sendMessage: (message) => {
    const { ws, isConnected } = get()
    
    if (!ws) {
      set({ error: 'WebSocket not initialized' })
      return false
    }

    // Check WebSocket ready state
    if (ws.readyState !== WebSocket.OPEN) {
      set({ error: 'Connection not ready. Please wait a moment and try again.' })
      return false
    }

    if (!isConnected) {
      set({ error: 'Not connected to chat' })
      return false
    }

    // Add user message to the list
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }

    // Add typing indicator
    const typingMessage = {
      id: 'typing',
      role: 'agent',
      content: '',
      isTyping: true,
      timestamp: new Date().toISOString(),
    }

    set(state => ({
      messages: [...state.messages, userMessage, typingMessage],
      isTyping: true
    }))

    try {
      // Send message via WebSocket
      ws.send(JSON.stringify({ message }))
      return true
    } catch (error) {
      console.error('Failed to send message:', error)
      set({ error: 'Failed to send message. Please try again.' })
      return false
    }
  },

  // Fetch conversation history
  fetchConversations: async (agentId) => {
    try {
      set({ loading: true, error: null })
      const conversations = await chatApi.getLogs(agentId)
      set({ conversations, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Fetch messages for a conversation
  fetchMessages: async (conversationId) => {
    try {
      set({ loading: true, error: null })
      const messages = await chatApi.getMessages(conversationId)
      set({ messages, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Start a new conversation
  startNewConversation: () => {
    set({ 
      messages: [], 
      currentConversation: null,
      isTyping: false 
    })
  },

  // Set current conversation
  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation })
  },

  // Clear messages
  clearMessages: () => {
    set({ messages: [] })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
})) 