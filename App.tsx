import React from 'react';
import { useAuth } from './hooks/useAuth';
import { MainApp } from './components/MainApp';
import './index.css';

const App: React.FC = () => {
  const { user, login, logout } = useAuth();

  // For this project, we'll auto-login the mock user.
  // In a real app, you would have a login screen here.
  
  if (!user) {
    // This is a fallback in case the mock user fails to load,
    // though the current useAuth implementation always provides a user.
    return (
        <div className="min-h-screen bg-dark-bg text-light-text flex items-center justify-center">
            <p>Loading user...</p>
        </div>
    );
  }

  return <MainApp user={user} onLogout={logout} />;
};

export default App;
