import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { MainApp } from './components/MainApp';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { AdminDashboard } from './components/AdminDashboard';
import { DIYDashboard } from './components/DIYDashboard';
import { LicenseGate } from './components/LicenseGate';
import { InstallAppButton } from './components/InstallAppButton';
import LandingPage from './components/LandingPage';
import './index.css';

type AppView = 'landing' | 'login' | 'signup' | 'app';

/**
 * App with landing page, authentication, and user routing
 */
const App: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [showDIYInspection, setShowDIYInspection] = useState(false);

  // Loading state while checking for existing session
  if (isLoading) {
    return (
      <>
        <InstallAppButton />
        <div className="min-h-screen bg-dark-bg text-light-text flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl text-primary mb-4">🚗</div>
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // User is not logged in - show landing, login, or signup
  if (!user) {
    if (currentView === 'signup') {
      return (
        <>
          <InstallAppButton />
          <SignupPage
            onSignup={login}
            onNavigateToLogin={() => setCurrentView('login')}
          />
        </>
      );
    }

    if (currentView === 'login') {
      return (
        <>
          <InstallAppButton />
          <LoginPage
            onLogin={login}
            onNavigateToSignup={() => setCurrentView('signup')}
          />
        </>
      );
    }

    // Default: Landing page
    return (
      <>
        <InstallAppButton />
        <LandingPage
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToSignup={() => setCurrentView('signup')}
        />
      </>
    );
  }

  // User is logged in - route based on user type

  if (user.userType === 'admin') {
    // Admin users get the enterprise admin panel (no license gate - admins always have access)
    return (
      <>
        <InstallAppButton />
        <AdminDashboard user={user} onLogout={logout} />
      </>
    );
  }

  // All non-admin users go through the license gate
  return (
    <LicenseGate user={user} onLogout={logout}>
      <InstallAppButton />
      {user.userType === 'diy' ? (
        showDIYInspection ? (
          <MainApp user={user} onLogout={logout} />
        ) : (
          <DIYDashboard
            user={user}
            onLogout={logout}
            onStartInspection={() => setShowDIYInspection(true)}
          />
        )
      ) : (
        <MainApp user={user} onLogout={logout} />
      )}
    </LicenseGate>
  );
};

export default App;
