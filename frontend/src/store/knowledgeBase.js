import { create } from 'zustand'
import { kbApi } from '../lib/api.js'

export const useKnowledgeBaseStore = create((set, get) => ({
  chunks: [],
  files: [],
  loading: false,
  uploading: false,
  error: null,

  // Fetch KB chunks for an agent
  fetchChunks: async (agentId) => {
    try {
      set({ loading: true, error: null })
      const chunks = await kbApi.getChunks(agentId)
      set({ chunks, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Upload file to knowledge base
  uploadFile: async (agentId, file) => {
    try {
      set({ uploading: true, error: null })
      const result = await kbApi.uploadFile(agentId, file)
      
      // Refresh chunks after upload
      await get().fetchChunks(agentId)
      
      set({ uploading: false })
      return { success: true, result }
    } catch (error) {
      set({ error: error.message, uploading: false })
      return { success: false, error: error.message }
    }
  },

  // Search knowledge base
  searchKB: async (agentId, query, limit = 5) => {
    try {
      set({ loading: true, error: null })
      const results = await kbApi.search(agentId, query, limit)
      set({ loading: false })
      return results
    } catch (error) {
      set({ error: error.message, loading: false })
      return { results: [], count: 0 }
    }
  },

  // Delete KB chunk
  deleteChunk: async (agentId, chunkId) => {
    try {
      set({ loading: true, error: null })
      await kbApi.deleteChunk(agentId, chunkId)
      
      // Remove from local state
      set(state => ({
        chunks: state.chunks.filter(chunk => chunk.id !== chunkId),
        loading: false
      }))
      
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Reset store
  reset: () => {
    set({
      chunks: [],
      files: [],
      loading: false,
      uploading: false,
      error: null
    })
  },
}))