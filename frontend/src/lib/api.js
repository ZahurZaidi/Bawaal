import { supabase } from './supabase.js'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Helper function to get auth token
const getAuthToken = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    return session?.access_token || null
  } catch (error) {
    console.error('Error in getAuthToken:', error)
    return null
  }
}

// Helper function to make authenticated requests
const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken()
  
  if (!token) {
    throw new Error('No authentication token available. Please log in.')
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  }

  console.log('Making API request to:', `${API_BASE_URL}${endpoint}`)
  console.log('With token:', token.substring(0, 20) + '...')
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }))
    if (response.status === 401) {
      // Token might be expired, try to refresh session
      await supabase.auth.refreshSession()
      throw new Error('Authentication failed. Please log in again.')
    }
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

// Agents API
export const agentsApi = {
  // Create a new agent
  create: async (agentData) => {
    return apiRequest('/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    })
  },

  // Get all agents for the current user
  list: async () => {
    return apiRequest('/agents')
  },

  // Get a specific agent
  get: async (agentId) => {
    return apiRequest(`/agents/${agentId}`)
  },

  // Delete an agent
  delete: async (agentId) => {
    return apiRequest(`/agents/${agentId}`, {
      method: 'DELETE',
    })
  },

  // Update an agent
  update: async (agentId, agentData) => {
    return apiRequest(`/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    })
  },
}

// Knowledge Base API
export const kbApi = {
  // Upload a file to knowledge base
  uploadFile: async (agentId, file) => {
    const token = await getAuthToken()
    
    if (!token) {
      throw new Error('No authentication token available. Please log in.')
    }
    
    const formData = new FormData()
    formData.append('file', file)

    console.log('Uploading file with token:', token.substring(0, 20) + '...')

    const response = await fetch(`${API_BASE_URL}/agents/${agentId}/kb/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
      if (response.status === 401) {
        await supabase.auth.refreshSession()
        throw new Error('Authentication failed. Please log in again.')
      }
      throw new Error(error.detail || `Upload failed! status: ${response.status}`)
    }

    return response.json()
  },

  // Get KB chunks for an agent
  getChunks: async (agentId) => {
    return apiRequest(`/agents/${agentId}/kb`)
  },

  // Search KB chunks
  search: async (agentId, query, limit = 5) => {
    return apiRequest(`/agents/${agentId}/kb/search?query=${encodeURIComponent(query)}&limit=${limit}`)
  },

  // Delete KB chunk
  deleteChunk: async (agentId, chunkId) => {
    return apiRequest(`/agents/${agentId}/kb/chunks/${chunkId}`, {
      method: 'DELETE',
    })
  },
}

// Chat API
export const chatApi = {
  // Get chat logs for an agent
  getLogs: async (agentId) => {
    return apiRequest(`/chat/logs/${agentId}`)
  },

  // Get messages for a conversation
  getMessages: async (conversationId) => {
    return apiRequest(`/conversations/${conversationId}/messages`)
  },

  // Create new conversation
  createConversation: async (agentId) => {
    return apiRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    })
  },
}

// WebSocket connection for real-time chat
export const createChatWebSocket = async (agentId) => {
  const token = await getAuthToken()
  if (!token) {
    throw new Error('No authentication token available. Please log in.')
  }
  
  const wsUrl = API_BASE_URL.replace('http', 'ws')
  const wsEndpoint = `${wsUrl}/chat/${agentId}?token=${token}`
  console.log('Creating WebSocket connection to:', wsEndpoint)
  
  return new WebSocket(wsEndpoint)
}

// Health check API
export const healthApi = {
  check: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      return response.ok
    } catch (error) {
      return false
    }
  }
}