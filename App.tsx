import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { MainApp } from './components/MainApp';
import PublicLandingPage from './components/PublicLandingPage';
import LeadGenerationPage from './components/LeadGenerationPage';
import AffiliatePage from './components/AffiliatePage';
import { useFeatureFlag } from './services/featureFlags';
import './index.css';

const App: React.FC = () => {
  const { user, login, logout } = useAuth();

  // Feature flags for new pages
  const publicLandingEnabled = useFeatureFlag('publicLandingPage');
  const leadGenEnabled = useFeatureFlag('leadGenerationPage');
  const affiliateEnabled = useFeatureFlag('affiliateProgramPage');

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg text-light-text flex items-center justify-center">
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Landing Page */}
        <Route
          path="/"
          element={publicLandingEnabled ? <PublicLandingPage /> : <Navigate to="/app" replace />}
        />

        {/* Lead Generation Page for Entrepreneurs */}
        <Route
          path="/leads"
          element={leadGenEnabled ? <LeadGenerationPage /> : <Navigate to="/app" replace />}
        />

        {/* Affiliate Program Page */}
        <Route
          path="/affiliate"
          element={affiliateEnabled ? <AffiliatePage /> : <Navigate to="/app" replace />}
        />

        {/* Main Application (for authenticated users) */}
        <Route
          path="/app/*"
          element={<MainApp user={user} onLogout={logout} />}
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
