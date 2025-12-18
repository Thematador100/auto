import React, { useState } from 'react';
import { supabaseConfig } from '../config/supabase';

interface SignupPageProps {
  onSignup: (token: string, user: any) => void;
  onSwitchToLogin: () => void;
}

const SUPABASE_URL = supabaseConfig.url;
const SUPABASE_ANON_KEY = supabaseConfig.anonKey;

export const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [userType, setUserType] = useState<'diy' | 'inspector'>('diy');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/auth`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          email,
          password,
          userData: {
            userType,
            plan: userType === 'inspector' ? 'pro_trial' : 'diy',
            companyName: companyName || undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      if (data.success && data.token && data.user) {
        // Store token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call parent signup handler
        onSignup(data.token, data.user);
      } else {
        throw new Error('Invalid response from server');
      }
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
              Account Type
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as 'diy' | 'inspector')}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-primary"
            >
              <option value="diy">DIY User</option>
              <option value="inspector">Professional Inspector</option>
            </select>
          </div>

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
              minLength={6}
            />
          </div>

          {userType === 'inspector' && (
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
          )}

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
              onClick={onSwitchToLogin}
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
