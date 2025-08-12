import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.js';
import AuthPage from './pages/AuthPage.jsx';
import WelcomePage from './components/WelcomePage.jsx';
import AgentPage from './components/AgentPage.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';

function App() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/agent/:agentId/*" element={<AgentPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App 