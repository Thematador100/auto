import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (token: string, user: any) => void;
  onNavigateToSignup: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        if (rememberMe) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }

        onLogin(data.token, data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">AI Auto Pro</h1>
          <p className="text-medium-text">Professional Vehicle Inspections Powered by AI</p>
        </div>

        {/* Login Card */}
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border shadow-xl">
          <h2 className="text-2xl font-bold text-light-text mb-6">Log In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-light-text font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-light-text font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary bg-dark-bg border-dark-border rounded focus:ring-primary"
              />
              <label htmlFor="remember" className="ml-2 text-medium-text cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => alert('Password reset not yet implemented')}
              className="text-primary hover:text-primary-light text-sm font-semibold"
            >
              Forgot password?
            </button>

            <div className="text-medium-text text-sm">
              Don't have an account?{' '}
              <button
                onClick={onNavigateToSignup}
                className="text-primary hover:text-primary-light font-semibold"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="text-medium-text text-sm">
            <div className="text-primary text-2xl mb-1">🕵️</div>
            <div>AI Fraud Detection</div>
          </div>
          <div className="text-medium-text text-sm">
            <div className="text-primary text-2xl mb-1">⚠️</div>
            <div>Known Issues Alerts</div>
          </div>
          <div className="text-medium-text text-sm">
            <div className="text-primary text-2xl mb-1">📄</div>
            <div>PDF Reports</div>
          </div>
        </div>
      </div>
    </div>
  );
};
