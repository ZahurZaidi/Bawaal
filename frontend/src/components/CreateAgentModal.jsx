import { useState } from 'react'
import { useAgentsStore } from '../store/agents.js'
import { X, Bot } from 'lucide-react'
import { cn } from '../lib/utils.js'

const CreateAgentModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { createAgent, loading, error, clearError } = useAgentsStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    const result = await createAgent({ name, description })
    if (result.success) {
      setName('')
      setDescription('')
      onClose()
    }
  }

  const handleClose = () => {
    clearError()
    setName('')
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Bot className="h-6 w-6 text-primary-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Create New Agent</h3>
            </div>
            <button
              onClick={handleClose}
              className="rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Agent Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input mt-1"
                placeholder="Enter agent name"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="input mt-1 resize-none"
                placeholder="Describe what this agent should do..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">
                {description.length}/500 characters
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || !description.trim()}
                className="btn btn-primary"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Agent'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateAgentModal 