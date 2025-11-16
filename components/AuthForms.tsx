// AuthForms.tsx - Modern login and signup forms
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthFormsProps {
  onSuccess?: () => void;
}

export const AuthForms: React.FC<AuthFormsProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await signUp({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          companyName: formData.companyName,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormData({ email: '', password: '', name: '', companyName: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Branding */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="text-gray-400">
            {mode === 'login'
              ? 'Sign in to your account to continue'
              : 'Create your account to start inspecting vehicles'}
          </p>
        </div>

        {/* Demo Credentials */}
        {mode === 'login' && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm">
            <p className="text-blue-300 font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-blue-200">
              <p><strong>Admin:</strong> admin@autoinspect.com / admin123</p>
              <p><strong>Inspector:</strong> inspector@autoinspect.com / inspector123</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={mode === 'signup'}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name (Optional)
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Your Company"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4 text-blue-500 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <a href="#" className="text-blue-400 hover:text-blue-300 transition">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transition duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-gray-400">
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMode}
              className="mt-4 w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition duration-200"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Features */}
        {mode === 'signup' && (
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">Join thousands of professionals using our platform</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                14-day free trial
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
