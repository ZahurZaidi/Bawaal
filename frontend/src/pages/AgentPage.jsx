import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentsStore } from '../store/agents.js';
import { kbApi } from '../lib/api.js';
import { 
  ArrowLeft, 
  Bot, 
  Settings, 
  Upload, 
  FileText, 
  MessageSquare,
  Save,
  Trash2,
  Plus
} from 'lucide-react';
import { formatDate } from '../lib/utils.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import Sidebar from '../components/Sidebar.jsx';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'manage', label: 'Manage Agent', icon: Settings },
  { id: 'knowledge', label: 'Knowledge Base', icon: FileText },
];

export default function AgentPage() {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const { currentAgent, fetchAgent, loading, error } = useAgentsStore();
  const [activeTab, setActiveTab] = useState('manage');
  const [kbChunks, setKbChunks] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');

  useEffect(() => {
    if (agentId) {
      fetchAgent(agentId);
      fetchKbChunks();
    }
  }, [agentId, fetchAgent]);

  useEffect(() => {
    if (currentAgent) {
      setAgentName(currentAgent.name);
      setAgentDescription(currentAgent.system_prompt);
    }
  }, [currentAgent]);

  const fetchKbChunks = async () => {
    try {
      const chunks = await kbApi.getChunks(agentId);
      setKbChunks(chunks);
    } catch (error) {
      console.error('Error fetching KB chunks:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await kbApi.uploadFile(agentId, file);
      toast.success('File uploaded successfully!');
      fetchKbChunks();
      event.target.value = ''; // Reset file input
    } catch (error) {
      toast.error('Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAgent = async () => {
    // TODO: Implement agent update API
    toast.success('Agent settings saved!');
  };

  const handleStartChat = () => {
    navigate(`/chat/${agentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">Agent not found</h3>
          <p className="text-varia-gray-400 mb-6">The agent you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 px-6 py-3 bg-varia-purple hover:bg-varia-purple/80 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-varia-darker via-varia-dark to-varia-gray-900">
      {/* Header */}
      <motion.header
        className="border-b border-varia-gray-700/50 bg-varia-gray-800/30 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-varia-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-varia-purple to-varia-blue rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-poppins">{currentAgent.name}</h1>
                  <p className="text-sm text-varia-gray-400">Created {formatDate(currentAgent.created_at)}</p>
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleStartChat}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-varia-purple to-varia-blue text-white rounded-lg hover:shadow-lg hover:shadow-varia-purple/25 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">Start Chat</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Sidebar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-varia-gray-800/30 backdrop-blur-sm border border-varia-gray-700/50 rounded-2xl p-8"
              >
                {activeTab === 'manage' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white font-poppins">Agent Settings</h2>
                      <motion.button
                        onClick={handleSaveAgent}
                        className="flex items-center space-x-2 px-4 py-2 bg-varia-purple hover:bg-varia-purple/80 text-white rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </motion.button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-varia-gray-300 mb-2">
                          Agent Name
                        </label>
                        <input
                          type="text"
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                          className="w-full px-4 py-3 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-lg text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300"
                          placeholder="Enter agent name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-varia-gray-300 mb-2">
                          System Prompt
                        </label>
                        <textarea
                          value={agentDescription}
                          onChange={(e) => setAgentDescription(e.target.value)}
                          rows={8}
                          className="w-full px-4 py-3 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-lg text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300 resize-none"
                          placeholder="Describe how your agent should behave..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'knowledge' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white font-poppins">Knowledge Base</h2>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept=".pdf,.txt,.md"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex items-center space-x-2 px-4 py-2 bg-varia-blue hover:bg-varia-blue/80 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                        </label>
                      </div>
                    </div>

                    {kbChunks.length === 0 ? (
                      <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <FileText className="w-16 h-16 text-varia-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">No knowledge base yet</h3>
                        <p className="text-varia-gray-400 mb-6 max-w-md mx-auto">
                          Upload PDF or text files to enhance your agent's knowledge and improve responses.
                        </p>
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-varia-purple to-varia-blue text-white rounded-lg hover:shadow-lg hover:shadow-varia-purple/25 transition-all duration-300 cursor-pointer"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Upload First File</span>
                        </label>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-varia-gray-300">
                            {kbChunks.length} knowledge chunks available
                          </p>
                        </div>
                        
                        <div className="grid gap-4 max-h-96 overflow-y-auto">
                          {kbChunks.map((chunk, index) => (
                            <motion.div
                              key={chunk.id}
                              className="p-4 bg-varia-gray-700/30 border border-varia-gray-600/30 rounded-lg hover:border-varia-purple/30 transition-all duration-300"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <p className="text-white text-sm line-clamp-3 mb-2">
                                {chunk.content}
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-varia-gray-500">
                                  {formatDate(chunk.created_at)}
                                </p>
                                <button className="text-varia-gray-400 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          className="fixed bottom-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}