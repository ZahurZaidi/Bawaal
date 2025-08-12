import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAgentsStore } from '../store/agents.js'
import { kbApi } from '../lib/api.js'
import { ArrowLeft, Upload, FileText, Trash2, MessageSquare } from 'lucide-react'
import { formatDate } from '../lib/utils.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import toast from 'react-hot-toast'

const AgentPage = () => {
  const { agentId } = useParams()
  const { currentAgent, fetchAgent, loading, error } = useAgentsStore()
  const [kbChunks, setKbChunks] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (agentId) {
      fetchAgent(agentId)
      fetchKbChunks()
    }
  }, [agentId, fetchAgent])

  const fetchKbChunks = async () => {
    try {
      const chunks = await kbApi.getChunks(agentId)
      setKbChunks(chunks)
    } catch (error) {
      console.error('Error fetching KB chunks:', error)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      await kbApi.uploadFile(agentId, file)
      toast.success('File uploaded successfully!')
      fetchKbChunks()
    } catch (error) {
      toast.error('Failed to upload file: ' + error.message)
    } finally {
      setUploading(false)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard" className="mr-4 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentAgent.name}</h1>
            <p className="text-gray-600">Agent settings and knowledge base</p>
          </div>
        </div>
        <Link
          to={`/chat/${agentId}`}
          className="btn btn-primary"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Agent Details</h3>
          </div>
          <div className="card-content space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{currentAgent.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">System Prompt</label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {currentAgent.system_prompt}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(currentAgent.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Knowledge Base */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Knowledge Base</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn btn-outline btn-sm cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                </label>
              </div>
            </div>
          </div>
          <div className="card-content">
            {kbChunks.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No knowledge base</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload PDF or text files to enhance your agent's knowledge.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {kbChunks.length} knowledge chunks available
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {kbChunks.slice(0, 5).map((chunk) => (
                    <div
                      key={chunk.id}
                      className="p-3 bg-gray-50 rounded-md text-sm"
                    >
                      <p className="text-gray-900 line-clamp-3">
                        {chunk.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(chunk.created_at)}
                      </p>
                    </div>
                  ))}
                  {kbChunks.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{kbChunks.length - 5} more chunks
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentPage 