import React, { useState, useEffect } from 'react';
import { WhiteLabelConfig } from '../types';
import { getWhiteLabelConfig, setWhiteLabelConfig, clearWhiteLabelConfig } from '../config';

const WhiteLabelSettings: React.FC = () => {
  const [config, setConfig] = useState<WhiteLabelConfig>({
    tenantId: '',
    companyName: '',
    stripePublishableKey: '',
    primaryColor: '',
    logoUrl: '',
    domain: '',
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existingConfig = getWhiteLabelConfig();
    if (existingConfig) {
      setConfig(existingConfig);
    }
  }, []);

  const handleChange = (field: keyof WhiteLabelConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setError(null);
  };

  const handleSave = () => {
    // Validation
    if (!config.tenantId.trim()) {
      setError('Tenant ID is required');
      return;
    }
    if (!config.companyName.trim()) {
      setError('Company Name is required');
      return;
    }
    if (!config.stripePublishableKey.trim()) {
      setError('Stripe Publishable Key is required');
      return;
    }

    // Validate Stripe key format
    if (!config.stripePublishableKey.startsWith('pk_')) {
      setError('Invalid Stripe Publishable Key format. It should start with "pk_"');
      return;
    }

    try {
      setWhiteLabelConfig(config);
      setSaved(true);
      setError(null);

      // Reload the page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration');
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all white label configuration?')) {
      clearWhiteLabelConfig();
      setConfig({
        tenantId: '',
        companyName: '',
        stripePublishableKey: '',
        primaryColor: '',
        logoUrl: '',
        domain: '',
      });
      setSaved(false);
      setError(null);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-3xl font-bold text-light-text mb-2">White Label Configuration</h2>
        <p className="text-medium-text mb-6">
          Configure your white label branding and Stripe payment integration. Each white label customer can use their
          own Stripe account to process payments.
        </p>

        <div className="space-y-4">
          {/* Tenant ID */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Tenant ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.tenantId}
              onChange={(e) => handleChange('tenantId', e.target.value)}
              placeholder="e.g., your-company-id"
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-medium-text mt-1">
              A unique identifier for your white label instance.
            </p>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="e.g., Your Auto Inspection Co."
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-medium-text mt-1">
              Your company name that will be displayed throughout the application.
            </p>
          </div>

          {/* Stripe Publishable Key */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Stripe Publishable Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={config.stripePublishableKey}
              onChange={(e) => handleChange('stripePublishableKey', e.target.value)}
              placeholder="pk_test_... or pk_live_..."
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
            <p className="text-xs text-medium-text mt-1">
              Your Stripe publishable key. Find this in your Stripe Dashboard under Developers → API keys.
            </p>
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">Primary Color (Optional)</label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={config.primaryColor || '#357ABD'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="h-10 w-20 bg-dark-bg border border-dark-border rounded-md cursor-pointer"
              />
              <input
                type="text"
                value={config.primaryColor || '#357ABD'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                placeholder="#357ABD"
                className="flex-1 px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
            </div>
            <p className="text-xs text-medium-text mt-1">
              The primary color for buttons and accents throughout the app.
            </p>
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">Logo URL (Optional)</label>
            <input
              type="url"
              value={config.logoUrl}
              onChange={(e) => handleChange('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-medium-text mt-1">URL to your company logo (PNG, JPG, or SVG).</p>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">Custom Domain (Optional)</label>
            <input
              type="text"
              value={config.domain}
              onChange={(e) => handleChange('domain', e.target.value)}
              placeholder="inspections.yourcompany.com"
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-md text-light-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-medium-text mt-1">
              Your custom domain for this white label instance.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-900/20 border border-red-500 rounded-md p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {saved && (
          <div className="mt-4 bg-green-900/20 border border-green-500 rounded-md p-4">
            <p className="text-green-400">Configuration saved successfully! Reloading...</p>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Save Configuration
          </button>
          <button
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-bold text-light-text mb-3">Getting Your Stripe Keys</h3>
          <ol className="text-medium-text space-y-2 text-sm list-decimal list-inside">
            <li>Log in to your Stripe Dashboard</li>
            <li>Navigate to Developers → API keys</li>
            <li>Copy your Publishable key (starts with pk_)</li>
            <li>Paste it in the field above</li>
          </ol>
          <a
            href="https://dashboard.stripe.com/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-primary hover:text-blue-400 text-sm"
          >
            Open Stripe Dashboard →
          </a>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-lg p-6">
          <h3 className="text-xl font-bold text-light-text mb-3">Backend Setup Required</h3>
          <p className="text-medium-text text-sm mb-3">
            To process payments, you'll need a backend server with:
          </p>
          <ul className="text-medium-text space-y-2 text-sm list-disc list-inside">
            <li>API endpoint to create payment intents</li>
            <li>Stripe secret key (keep this secure!)</li>
            <li>Webhook endpoint for payment events</li>
            <li>Database to track transactions</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-2">Important Security Note</h3>
        <p className="text-medium-text text-sm">
          <strong>Never expose your Stripe secret key in the frontend!</strong> The publishable key (pk_) is safe to
          use in the browser, but your secret key (sk_) must only be used on your secure backend server. All payment
          intents should be created server-side using your secret key.
        </p>
      </div>
    </div>
  );
};

export default WhiteLabelSettings;
