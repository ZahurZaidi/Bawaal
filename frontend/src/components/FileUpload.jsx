import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  File, 
  FileText, 
  X, 
  Check,
  AlertCircle
} from 'lucide-react';

export default function FileUpload({ onUpload, uploading, accept = '.pdf,.txt,.md' }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          console.error(`File ${file.name}: ${error.message}`);
        });
      });
    }

    if (acceptedFiles.length > 0) {
      acceptedFiles.forEach(file => {
        setUploadedFiles(prev => [...prev, { file, status: 'uploading' }]);
        
        onUpload(file)
          .then(() => {
            setUploadedFiles(prev => 
              prev.map(item => 
                item.file === file 
                  ? { ...item, status: 'success' }
                  : item
              )
            );
            // Remove from list after 3 seconds
            setTimeout(() => {
              setUploadedFiles(prev => prev.filter(item => item.file !== file));
            }, 3000);
          })
          .catch(() => {
            setUploadedFiles(prev => 
              prev.map(item => 
                item.file === file 
                  ? { ...item, status: 'error' }
                  : item
              )
            );
          });
      });
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading
  });

  const removeFile = (fileToRemove) => {
    setUploadedFiles(prev => prev.filter(item => item.file !== fileToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <motion.div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-varia-purple bg-varia-purple/10'
            : uploading
            ? 'border-varia-gray-600 bg-varia-gray-800/30 cursor-not-allowed'
            : 'border-varia-gray-600 hover:border-varia-purple/50 hover:bg-varia-gray-800/30'
        }`}
        whileHover={!uploading ? { scale: 1.01 } : {}}
        whileTap={!uploading ? { scale: 0.99 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <input {...getInputProps()} />
        
        <motion.div
          className="flex flex-col items-center space-y-4"
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isDragActive 
              ? 'bg-varia-purple text-white' 
              : 'bg-varia-gray-700/50 text-varia-gray-400'
          }`}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 font-poppins">
              {isDragActive ? 'Drop files here' : 'Upload Knowledge Base Files'}
            </h3>
            <p className="text-varia-gray-400 text-sm font-inter">
              {isDragActive 
                ? 'Release to upload files'
                : 'Drag & drop files here, or click to browse'
              }
            </p>
            <p className="text-varia-gray-500 text-xs mt-2 font-inter">
              Supports PDF, TXT, MD files (max 10MB each)
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {uploadedFiles.map((item, index) => (
              <motion.div
                key={`${item.file.name}-${index}`}
                className="flex items-center space-x-3 p-3 bg-varia-gray-800/30 border border-varia-gray-700/30 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex-shrink-0">
                  {item.file.type === 'application/pdf' ? (
                    <File className="w-5 h-5 text-red-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate font-inter">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-varia-gray-400 font-inter">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <div className="flex-shrink-0">
                  {item.status === 'uploading' && (
                    <div className="w-5 h-5">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                  {item.status === 'success' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                  {item.status === 'error' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <AlertCircle className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </div>

                {item.status !== 'uploading' && (
                  <motion.button
                    onClick={() => removeFile(item.file)}
                    className="p-1 text-varia-gray-400 hover:text-white transition-colors rounded"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}