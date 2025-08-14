import { create } from 'zustand'
import { agentsApi } from '../lib/api.js'

export const useAgentsStore = create((set, get) => ({
  agents: [],
  currentAgent: null,
  loading: false,
  error: null,

  // Fetch all agents
  fetchAgents: async () => {
    try {
      set({ loading: true, error: null })
      const agents = await agentsApi.list()
      set({ agents, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Create a new agent
  createAgent: async (agentData) => {
    try {
      set({ loading: true, error: null })
      const newAgent = await agentsApi.create(agentData)
      set(state => ({
        agents: [...state.agents, newAgent],
        currentAgent: newAgent,
        loading: false
      }))
      return { success: true, agent: newAgent }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Update an agent
  updateAgent: async (agentId, agentData) => {
    try {
      set({ loading: true, error: null })
      const updatedAgent = await agentsApi.update(agentId, agentData)
      set(state => ({
        agents: state.agents.map(agent => 
          agent.id === agentId ? updatedAgent : agent
        ),
        currentAgent: state.currentAgent?.id === agentId ? updatedAgent : state.currentAgent,
        loading: false
      }))
      return { success: true, agent: updatedAgent }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Get a specific agent
  fetchAgent: async (agentId) => {
    try {
      set({ loading: true, error: null })
      const agent = await agentsApi.get(agentId)
      set({ currentAgent: agent, loading: false })
      return { success: true, agent }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Delete an agent
  deleteAgent: async (agentId) => {
    try {
      set({ loading: true, error: null })
      await agentsApi.delete(agentId)
      set(state => ({
        agents: state.agents.filter(agent => agent.id !== agentId),
        currentAgent: state.currentAgent?.id === agentId ? null : state.currentAgent,
        loading: false
      }))
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Set current agent
  setCurrentAgent: (agent) => {
    set({ currentAgent: agent })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Clear current agent
  clearCurrentAgent: () => {
    set({ currentAgent: null })
  },

  // Reset store
  reset: () => {
    set({
      agents: [],
      currentAgent: null,
      loading: false,
      error: null
    })
  },
})) 