import React from 'react';
import { useAuth } from './hooks/useAuth';
import { MainApp } from './components/MainApp';
import LoginScreen from './components/LoginScreen';
import './index.css';

const App: React.FC = () => {
  const { user, login, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  return <MainApp user={user} onLogout={logout} />;
};

export default App;
