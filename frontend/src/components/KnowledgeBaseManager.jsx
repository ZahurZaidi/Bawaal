import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKnowledgeBaseStore } from '../store/knowledgeBase.js';
import { 
  FileText, 
  Search, 
  Trash2, 
  Plus,
  File,
  Calendar,
  Hash,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../lib/utils.js';
import FileUpload from './FileUpload.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import toast from 'react-hot-toast';

export default function KnowledgeBaseManager({ agentId }) {
  const { 
    chunks, 
    loading, 
    uploading, 
    error,
    fetchChunks, 
    uploadFile, 
    deleteChunk, 
    searchKB,
    clearError 
  } = useKnowledgeBaseStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (agentId) {
      fetchChunks(agentId);
    }
  }, [agentId, fetchChunks]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleUpload = async (file) => {
    const result = await uploadFile(agentId, file);
    if (result.success) {
      toast.success('File uploaded successfully!');
      setShowUpload(false);
    }
    return result;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchKB(agentId, searchQuery.trim());
      setSearchResults(results.results || []);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteChunk = async (chunkId) => {
    if (!confirm('Are you sure you want to delete this knowledge chunk?')) {
      return;
    }

    const result = await deleteChunk(agentId, chunkId);
    if (result.success) {
      toast.success('Knowledge chunk deleted');
      // Clear search results if the deleted chunk was in them
      setSearchResults(prev => prev.filter(chunk => chunk.id !== chunkId));
    }
  };

  const displayChunks = searchQuery.trim() ? searchResults : chunks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-poppins">Knowledge Base</h2>
          <p className="text-varia-gray-400 font-inter">
            Upload documents and manage your agent's knowledge
          </p>
        </div>
        <motion.button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center space-x-2 px-4 py-2 bg-varia-blue hover:bg-varia-blue/80 text-white rounded-lg transition-colors font-inter font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
          <span>Upload File</span>
        </motion.button>
      </div>

      {/* File Upload */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FileUpload onUpload={handleUpload} uploading={uploading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-varia-gray-400" />
          <motion.input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search knowledge base..."
            className="w-full pl-12 pr-4 py-3 bg-varia-gray-700/50 border border-varia-gray-600/50 rounded-xl text-white placeholder-varia-gray-400 focus:outline-none focus:ring-2 focus:ring-varia-purple/50 focus:border-varia-purple/50 transition-all duration-300 font-inter"
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <motion.button
          onClick={handleSearch}
          disabled={isSearching}
          className="px-6 py-3 bg-varia-purple hover:bg-varia-purple/80 text-white rounded-xl transition-colors disabled:opacity-50 font-inter font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSearching ? <LoadingSpinner size="sm" /> : 'Search'}
        </motion.button>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="flex items-center space-x-2 text-sm text-varia-gray-400 font-inter">
          <Hash className="w-4 h-4" />
          <span>{displayChunks.length} results found</span>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="text-varia-purple hover:text-varia-purple/80 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Knowledge Chunks */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : displayChunks.length === 0 ? (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {searchQuery ? (
            <>
              <AlertCircle className="w-16 h-16 text-varia-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2 font-poppins">No results found</h3>
              <p className="text-varia-gray-400 font-inter">
                Try different keywords or upload more documents
              </p>
            </>
          ) : (
            <>
              <FileText className="w-16 h-16 text-varia-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2 font-poppins">No knowledge base yet</h3>
              <p className="text-varia-gray-400 mb-6 max-w-md mx-auto font-inter">
                Upload PDF or text files to enhance your agent's knowledge and improve responses.
              </p>
              <motion.button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-varia-purple to-varia-blue text-white rounded-xl hover:shadow-lg hover:shadow-varia-purple/25 transition-all duration-300 font-poppins font-medium"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-5 h-5" />
                <span>Upload First File</span>
              </motion.button>
            </>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {displayChunks.map((chunk, index) => (
              <motion.div
                key={chunk.id}
                className="p-6 bg-varia-gray-800/30 border border-varia-gray-700/30 rounded-xl hover:border-varia-purple/30 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.01, y: -2 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-3">
                      <File className="w-4 h-4 text-varia-blue flex-shrink-0" />
                      <span className="text-xs text-varia-gray-500 font-inter">
                        Knowledge Chunk
                      </span>
                    </div>
                    
                    <p className="text-white text-sm line-clamp-3 mb-4 leading-relaxed font-inter">
                      {chunk.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-varia-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span className="font-inter">{formatDate(chunk.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Hash className="w-3 h-3" />
                        <span className="font-inter">{chunk.content.length} chars</span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => handleDeleteChunk(chunk.id)}
                    className="p-2 text-varia-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}