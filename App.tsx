import React from 'react';
import { useAuth } from './hooks/useAuth';
import { MainApp } from './components/MainApp';
import { AuthScreen } from './components/AuthScreen';
import './index.css';

const App: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
        <div className="min-h-screen bg-dark-bg text-light-text flex items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  // Show login screen if no user
  if (!user) {
    return <AuthScreen onLogin={login} />;
  }

  return <MainApp user={user} onLogout={logout} />;
};

export default App;
