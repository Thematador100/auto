import React, { useState, useEffect } from 'react';
import featureFlags, { FeatureFlags } from '../services/featureFlags';

export const FeatureFlagPanel: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlags>(featureFlags.getAll());
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Refresh flags when panel opens
    if (showPanel) {
      setFlags(featureFlags.getAll());
    }
  }, [showPanel]);

  const handleToggle = (feature: keyof FeatureFlags) => {
    featureFlags.toggle(feature);
    setFlags(featureFlags.getAll());
  };

  const handleEnableAll = () => {
    featureFlags.enableAll();
    setFlags(featureFlags.getAll());
  };

  const handleReset = () => {
    if (confirm('Reset all feature flags to defaults?')) {
      featureFlags.reset();
      setFlags(featureFlags.getAll());
    }
  };

  const featureCategories = {
    'Landing Pages': ['publicLandingPage', 'leadGenerationPage', 'affiliateProgramPage'],
    'Core Features': ['aiAssistant', 'obdDiagnostics', 'vinScanner', 'audioRecording', 'pdfExport'],
    'Advanced Features': ['vehicleHistory', 'offlineMode', 'paymentProcessing'],
    'Admin Features': ['adminPanel', 'analytics'],
    'Experimental': ['aiSeoOptimization', 'multiLanguage', 'darkMode']
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2"
        title="Feature Flags"
      >
        <span>⚙️</span>
        <span className="text-sm font-medium">Features</span>
      </button>

      {/* Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Feature Flags</h2>
                  <p className="text-purple-100 text-sm">Enable or disable application features</p>
                </div>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleEnableAll}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-medium"
                >
                  Enable All
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all text-sm font-medium"
                >
                  Reset to Defaults
                </button>
              </div>

              {/* Feature Categories */}
              <div className="space-y-6">
                {Object.entries(featureCategories).map(([category, features]) => (
                  <div key={category} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white">{category}</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {features.map((feature) => {
                        const isEnabled = flags[feature as keyof FeatureFlags];
                        const featureName = feature
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())
                          .trim();

                        return (
                          <div
                            key={feature}
                            className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-900/70 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  isEnabled ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                              />
                              <span className="text-gray-300 font-medium">{featureName}</span>
                            </div>
                            <button
                              onClick={() => handleToggle(feature as keyof FeatureFlags)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                isEnabled ? 'bg-green-600' : 'bg-gray-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  isEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Info Box */}
              <div className="mt-6 bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 text-xl">ℹ️</span>
                  <div className="text-sm text-blue-200">
                    <p className="font-semibold mb-1">About Feature Flags</p>
                    <p className="text-blue-300">
                      Feature flags allow you to enable or disable features without code changes. Changes take effect immediately and are saved in localStorage.
                      Perfect for A/B testing, gradual rollouts, and emergency feature disabling.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-700 p-4 bg-gray-800/50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">
                  {Object.values(flags).filter(Boolean).length} of {Object.keys(flags).length} features enabled
                </span>
                <button
                  onClick={() => setShowPanel(false)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeatureFlagPanel;
