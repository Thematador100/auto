import React, { useState } from 'react';

interface SignupPageProps {
  onSignup: (token: string, user: any) => void;
  onNavigateToLogin: () => void;
}

type AccountType = 'pro' | 'diy' | null;
type PlanType = 'pro-basic' | 'pro-team' | 'diy-single' | 'diy-5pack' | 'diy-premium';

export const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onNavigateToLogin }) => {
  // Account type selection
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName: accountType === 'diy' ? fullName : undefined,
          companyName: accountType === 'pro' ? companyName : undefined,
          phone: accountType === 'pro' ? phone : undefined,
          userType: accountType === 'pro' ? 'pro' : 'diy',
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onSignup(data.token, data.user);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Choose account type
  if (!accountType) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">AI Auto Pro</h1>
            <p className="text-medium-text text-lg">Choose Your Account Type</p>
          </div>

          {/* Account Type Selection */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Professional Inspector */}
            <button
              onClick={() => setAccountType('pro')}
              className="bg-dark-card p-8 rounded-lg border-2 border-dark-border hover:border-primary transition-all text-left group"
            >
              <div className="text-5xl mb-4">👨‍🔧</div>
              <h2 className="text-2xl font-bold text-light-text mb-3 group-hover:text-primary">
                Professional Inspector
              </h2>
              <p className="text-medium-text mb-4">
                For dealerships, independent mechanics, and professional inspection services
              </p>
              <ul className="space-y-2 text-medium-text">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Unlimited inspections</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Multi-inspector teams</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>White-label reports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>AI fraud detection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Enterprise analytics</span>
                </li>
              </ul>
              <div className="mt-6 text-primary font-bold">Starting at $99/month</div>
            </button>

            {/* Individual Car Buyer */}
            <button
              onClick={() => setAccountType('diy')}
              className="bg-dark-card p-8 rounded-lg border-2 border-dark-border hover:border-primary transition-all text-left group"
            >
              <div className="text-5xl mb-4">🚗</div>
              <h2 className="text-2xl font-bold text-light-text mb-3 group-hover:text-primary">
                Individual Car Buyer
              </h2>
              <p className="text-medium-text mb-4">
                For people buying a used car who want a professional AI inspection
              </p>
              <ul className="space-y-2 text-medium-text">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>DIY photo inspection</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>AI analysis & recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Known issues database</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Fraud detection alerts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>PDF report download</span>
                </li>
              </ul>
              <div className="mt-6 text-primary font-bold">Starting at $49.99 per inspection</div>
            </button>
          </div>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <button
              onClick={onNavigateToLogin}
              className="text-medium-text hover:text-primary text-sm"
            >
              Already have an account? <span className="font-semibold">Log in</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Choose plan (for selected account type)
  if (!selectedPlan) {
    if (accountType === 'pro') {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-8">
          <div className="max-w-5xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-light-text mb-2">Choose Your Pro Plan</h1>
              <p className="text-medium-text">For professional inspection businesses</p>
            </div>

            {/* Pro Plans */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Pro Basic */}
              <div className="bg-dark-card p-6 rounded-lg border-2 border-dark-border">
                <h3 className="text-xl font-bold text-light-text mb-2">Pro Basic</h3>
                <div className="text-3xl font-bold text-primary mb-4">
                  $99<span className="text-lg text-medium-text">/month</span>
                </div>
                <ul className="space-y-3 mb-6 text-medium-text">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>1 Inspector account</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Unlimited inspections</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>AI fraud detection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Known issues alerts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>PDF & email reports</span>
                  </li>
                </ul>
                <button
                  onClick={() => setSelectedPlan('pro-basic')}
                  className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Select Plan
                </button>
              </div>

              {/* Pro Team */}
              <div className="bg-dark-card p-6 rounded-lg border-2 border-primary relative">
                <div className="absolute -top-3 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                  POPULAR
                </div>
                <h3 className="text-xl font-bold text-light-text mb-2">Pro Team</h3>
                <div className="text-3xl font-bold text-primary mb-4">
                  $299<span className="text-lg text-medium-text">/month</span>
                </div>
                <ul className="space-y-3 mb-6 text-medium-text">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>5 Inspector accounts</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Unlimited inspections</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Team management dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>White-label branding</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Priority support</span>
                  </li>
                </ul>
                <button
                  onClick={() => setSelectedPlan('pro-team')}
                  className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Select Plan
                </button>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setAccountType(null)}
                className="text-medium-text hover:text-primary text-sm"
              >
                ← Back to account type
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      // DIY Plans
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-8">
          <div className="max-w-5xl w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-light-text mb-2">Choose Your Inspection Package</h1>
              <p className="text-medium-text">Pay per inspection, no subscription required</p>
            </div>

            {/* DIY Plans */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Single Inspection */}
              <div className="bg-dark-card p-6 rounded-lg border-2 border-dark-border">
                <h3 className="text-xl font-bold text-light-text mb-2">Single Inspection</h3>
                <div className="text-3xl font-bold text-primary mb-4">$49.99</div>
                <ul className="space-y-3 mb-6 text-medium-text">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>1 inspection credit</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>AI analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Fraud detection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>PDF report</span>
                  </li>
                </ul>
                <button
                  onClick={() => setSelectedPlan('diy-single')}
                  className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Select Package
                </button>
              </div>

              {/* 5-Pack */}
              <div className="bg-dark-card p-6 rounded-lg border-2 border-primary relative">
                <div className="absolute -top-3 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                  BEST VALUE
                </div>
                <h3 className="text-xl font-bold text-light-text mb-2">5-Pack</h3>
                <div className="text-3xl font-bold text-primary mb-1">$199.99</div>
                <div className="text-sm text-medium-text mb-4">$40 per inspection</div>
                <ul className="space-y-3 mb-6 text-medium-text">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>5 inspection credits</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Save $50 vs single</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>All standard features</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Credits never expire</span>
                  </li>
                </ul>
                <button
                  onClick={() => setSelectedPlan('diy-5pack')}
                  className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Select Package
                </button>
              </div>

              {/* Premium */}
              <div className="bg-dark-card p-6 rounded-lg border-2 border-dark-border">
                <h3 className="text-xl font-bold text-light-text mb-2">Premium</h3>
                <div className="text-3xl font-bold text-primary mb-4">$149.99</div>
                <ul className="space-y-3 mb-6 text-medium-text">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>1 inspection credit</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>Carfax report included</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span><strong>30-min phone consultation</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>Priority processing</span>
                  </li>
                </ul>
                <button
                  onClick={() => setSelectedPlan('diy-premium')}
                  className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-colors"
                >
                  Select Package
                </button>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setAccountType(null)}
                className="text-medium-text hover:text-primary text-sm"
              >
                ← Back to account type
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Step 3: Registration form
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
          <p className="text-medium-text">
            {accountType === 'pro' ? 'Professional Inspector' : 'Individual Car Buyer'}
          </p>
        </div>

        {/* Registration Card */}
        <div className="bg-dark-card p-8 rounded-lg border border-dark-border shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pro-specific fields */}
            {accountType === 'pro' && (
              <>
                <div>
                  <label className="block text-light-text font-semibold mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Your Company LLC"
                  />
                </div>

                <div>
                  <label className="block text-light-text font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </>
            )}

            {/* DIY-specific fields */}
            {accountType === 'diy' && (
              <div>
                <label className="block text-light-text font-semibold mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  placeholder="John Smith"
                />
              </div>
            )}

            {/* Common fields */}
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
                autoComplete="new-password"
              />
              <p className="text-xs text-medium-text mt-1">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block text-light-text font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-dark-bg border border-dark-border text-light-text rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {/* Selected Plan Summary */}
            <div className="bg-dark-bg border border-dark-border rounded-lg p-4">
              <div className="text-xs text-medium-text mb-1">Selected Plan</div>
              <div className="text-light-text font-semibold">
                {selectedPlan === 'pro-basic' && 'Pro Basic - $99/month'}
                {selectedPlan === 'pro-team' && 'Pro Team - $299/month'}
                {selectedPlan === 'diy-single' && 'Single Inspection - $49.99'}
                {selectedPlan === 'diy-5pack' && '5-Pack - $199.99'}
                {selectedPlan === 'diy-premium' && 'Premium - $149.99'}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="text-xs text-primary hover:text-primary-light mt-1"
              >
                Change plan
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : accountType === 'pro' ? 'Create Account' : 'Continue to Payment'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <button
              onClick={onNavigateToLogin}
              className="text-medium-text hover:text-primary text-sm"
            >
              Already have an account? <span className="font-semibold">Log in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
