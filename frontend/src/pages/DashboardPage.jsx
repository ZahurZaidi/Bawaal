import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAgentsStore } from '../store/agents.js'
import { Bot, Plus, MessageSquare, Upload, Trash2, Settings } from 'lucide-react'
import { formatDate, truncateText } from '../lib/utils.js'
import CreateAgentModal from '../components/CreateAgentModal.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

const DashboardPage = () => {
  const { agents, loading, error, fetchAgents, deleteAgent } = useAgentsStore()
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      await deleteAgent(agentId)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your AI agents and conversations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Agents grid */}
      {agents.length === 0 ? (
        <div className="text-center py-12">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No agents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first AI agent.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.id} className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bot className="h-8 w-8 text-primary-600" />
                    <h3 className="ml-3 text-lg font-medium text-gray-900">
                      {agent.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/chat/${agent.id}`}
                      className="rounded p-1 text-gray-400 hover:text-gray-600"
                      title="Chat"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/agents/${agent.id}`}
                      className="rounded p-1 text-gray-400 hover:text-gray-600"
                      title="Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="rounded p-1 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {truncateText(agent.system_prompt, 100)}
                </p>
              </div>
              <div className="card-content">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created {formatDate(agent.created_at)}</span>
                </div>
              </div>
              <div className="card-footer">
                <div className="flex space-x-2 w-full">
                  <Link
                    to={`/chat/${agent.id}`}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Link>
                  <Link
                    to={`/agents/${agent.id}`}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}

export default DashboardPage 