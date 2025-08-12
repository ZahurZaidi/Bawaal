import { create } from 'zustand'
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../lib/supabase.js'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Initialize auth state
  initialize: async () => {
    try {
      set({ loading: true, error: null })
      
      // Get current user
      const { user, error } = await getCurrentUser()
      if (error) throw error
      
      set({ user, loading: false })
      
      // Listen for auth changes
      supabase.auth.onAuthStateChange((event, session) => {
        set({ user: session?.user || null, loading: false })
      })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  // Sign in
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null })
      const { data, error } = await signIn(email, password)
      if (error) throw error
      
      set({ user: data.user, loading: false })
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Sign up
  signUp: async (email, password) => {
    try {
      set({ loading: true, error: null })
      const { data, error } = await signUp(email, password)
      if (error) throw error
      
      set({ user: data.user, loading: false })
      return { success: true }
    } catch (error) {
      set({ error: error.message, loading: false })
      return { success: false, error: error.message }
    }
  },

  // Sign out
  signOut: async () => {
    try {
      set({ loading: true, error: null })
      const { error } = await signOut()
      if (error) throw error
      
      set({ user: null, loading: false })
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
})) 