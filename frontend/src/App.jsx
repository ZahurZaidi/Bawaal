import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.js';
import AuthPage from './pages/AuthPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
import AgentPage from './pages/AgentPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/agent/:agentId" element={<AgentPage />} />
          <Route path="/chat/:agentId" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App