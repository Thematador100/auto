import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { MainApp } from './components/MainApp';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { AdminDashboard } from './components/AdminDashboard';
import './index.css';

type AppView = 'login' | 'signup' | 'app';

/**
 * Phase 2C: App with authentication and user routing
 */
const App: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('login');

  // Loading state while checking for existing session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg text-light-text flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl text-primary mb-4">🚗</div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // User is not logged in - show auth pages
  if (!user) {
    if (currentView === 'signup') {
      return (
        <SignupPage
          onSignup={login}
          onNavigateToLogin={() => setCurrentView('login')}
        />
      );
    }

    return (
      <LoginPage
        onLogin={login}
        onNavigateToSignup={() => setCurrentView('signup')}
      />
    );
  }

  // User is logged in - route based on user type

  if (user.userType === 'admin') {
    // Admin users get the enterprise admin panel
    return <AdminDashboard user={user} onLogout={logout} />;
  }

  if (user.userType === 'diy') {
    // TODO: Route to DIYDashboard (Phase 2C task 5)
    // For now, DIY users also get MainApp
    return <MainApp user={user} onLogout={logout} />;
  }

  // Pro users get the full MainApp (professional inspector interface)
  return <MainApp user={user} onLogout={logout} />;
};

export default App;
