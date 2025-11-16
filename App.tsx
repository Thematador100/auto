import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainApp } from './components/MainApp';
import { AuthForms } from './components/AuthForms';
import { Toaster } from 'react-hot-toast';
import './index.css';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForms />;
  }

  return <MainApp user={user} onLogout={logout} />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #475569',
          },
        }}
      />
      <AppContent />
    </AuthProvider>
  );
};

export default App;
