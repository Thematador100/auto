import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (token: string, user: any) => void;
  onNavigateToSignup: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://auto-production-8579.up.railway.app';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password flow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email' | 'code'>('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.token, data.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setSuccess('Reset code sent! Check your email or contact your admin.');
      setResetStep('code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, resetCode, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Reset failed');
      }

      setSuccess('Password reset successful! You can now sign in.');
      setShowForgotPassword(false);
      setResetStep('email');
      setResetCode('');
      setNewPassword('');
      setEmail(resetEmail);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border w-full max-w-md">
          <h1 className="text-3xl font-bold text-light-text mb-2">Reset Password</h1>
          <p className="text-medium-text mb-6">
            {resetStep === 'email'
              ? 'Enter your email to receive a reset code.'
              : 'Enter the reset code and your new password.'}
          </p>

          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-3 mb-4">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {resetStep === 'email' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-primary"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">Reset Code</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-primary text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-primary"
                  placeholder="Min 8 characters"
                  minLength={8}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => { setShowForgotPassword(false); setError(''); setSuccess(''); }}
              className="text-primary hover:underline text-sm"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-dark-card p-8 rounded-lg border border-dark-border w-full max-w-md">
        <h1 className="text-3xl font-bold text-light-text mb-2">Welcome Back</h1>
        <p className="text-medium-text mb-6">Sign in to AI Auto Pro</p>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-3 mb-4">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-primary"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-light-text">Password</label>
              <button
                type="button"
                onClick={() => { setShowForgotPassword(true); setError(''); setSuccess(''); }}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-primary"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-medium-text">
            Don't have an account?{' '}
            <button
              onClick={onNavigateToSignup}
              className="text-primary hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
