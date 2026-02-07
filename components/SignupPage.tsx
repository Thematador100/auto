import React, { useState } from 'react';

interface SignupPageProps {
  onSignup: (token: string, user: any) => void;
  onNavigateToLogin: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://auto-production-3041.up.railway.app';

export const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userType, setUserType] = useState<'diy' | 'pro' | 'admin'>('diy');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call Railway backend API for signup
      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          userType,
          companyName: companyName || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call parent signup handler
      onSignup(data.token, data.user);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="bg-dark-card p-8 rounded-lg border border-dark-border w-full max-w-md">
        <h1 className="text-3xl font-bold text-light-text mb-2">Create Account</h1>
        <p className="text-medium-text mb-6">Join AI Auto Pro</p>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Email
            </label>
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
            <label className="block text-sm font-medium text-light-text mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-primary"
              placeholder="••••••••"
              required
              minLength={8}
            />
            <p className="text-xs text-medium-text mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-primary"
              placeholder="Your Company LLC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Account Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as 'diy' | 'pro' | 'admin')}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-primary"
            >
              <option value="diy">DIY User</option>
              <option value="pro">Professional Inspector</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-medium-text">
            Already have an account?{' '}
            <button
              onClick={onNavigateToLogin}
              className="text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
