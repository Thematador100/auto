/**
 * AI Provider Settings Component
 * Advanced configuration UI for managing multiple AI providers
 */

import React, { useState, useEffect } from 'react';
import { AIProvider, ProviderConfig, ProviderAnalytics, ProviderStrategy } from '../types/apiProvider';

interface AIProviderSettingsProps {
  onClose: () => void;
  onSave: (config: any) => void;
  currentConfig: any;
}

const AIProviderSettings: React.FC<AIProviderSettingsProps> = ({ onClose, onSave, currentConfig }) => {
  const [providers, setProviders] = useState<ProviderConfig[]>(currentConfig.providers || []);
  const [strategy, setStrategy] = useState<ProviderStrategy>(
    currentConfig.strategy || { type: 'priority' }
  );
  const [cacheEnabled, setCacheEnabled] = useState(currentConfig.caching?.enabled || true);
  const [cacheTTL, setCacheTTL] = useState(currentConfig.caching?.ttl || 3600);
  const [fallbackEnabled, setFallbackEnabled] = useState(currentConfig.fallbackEnabled !== false);
  const [analytics, setAnalytics] = useState<ProviderAnalytics[]>([]);

  const providerInfo: Record<AIProvider, { name: string; description: string; color: string }> = {
    'gemini': {
      name: 'Google Gemini',
      description: 'Advanced AI with grounding and vision capabilities',
      color: 'bg-blue-500'
    },
    'openai': {
      name: 'OpenAI GPT',
      description: 'Industry-leading language models',
      color: 'bg-green-500'
    },
    'deepseek': {
      name: 'DeepSeek',
      description: 'Cost-effective AI with excellent code capabilities',
      color: 'bg-purple-500'
    },
    'anthropic': {
      name: 'Anthropic Claude',
      description: 'Reliable and context-aware AI assistant',
      color: 'bg-orange-500'
    },
    'azure-openai': {
      name: 'Azure OpenAI',
      description: 'Enterprise OpenAI with Azure integration',
      color: 'bg-cyan-500'
    },
    'cohere': {
      name: 'Cohere',
      description: 'Enterprise AI platform',
      color: 'bg-pink-500'
    },
    'mistral': {
      name: 'Mistral AI',
      description: 'European open AI models',
      color: 'bg-indigo-500'
    },
    'perplexity': {
      name: 'Perplexity',
      description: 'AI with real-time web search',
      color: 'bg-yellow-500'
    },
    'huggingface': {
      name: 'Hugging Face',
      description: 'Open-source AI models',
      color: 'bg-red-500'
    }
  };

  const addProvider = (providerType: AIProvider) => {
    const newProvider: ProviderConfig = {
      provider: providerType,
      apiKey: '',
      enabled: false,
      priority: providers.length + 1,
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 100000
      },
      timeout: 30000
    };
    setProviders([...providers, newProvider]);
  };

  const updateProvider = (index: number, updates: Partial<ProviderConfig>) => {
    const updated = [...providers];
    updated[index] = { ...updated[index], ...updates };
    setProviders(updated);
  };

  const removeProvider = (index: number) => {
    setProviders(providers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const config = {
      providers,
      defaultProvider: providers.find(p => p.enabled)?.provider,
      fallbackEnabled,
      strategy,
      caching: {
        enabled: cacheEnabled,
        ttl: cacheTTL
      },
      analytics: {
        enabled: true,
        trackCosts: true,
        trackPerformance: true
      }
    };
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Provider Settings</h2>
            <p className="text-gray-600 text-sm">Configure multiple AI providers with advanced features</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Global Settings */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Global Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strategy Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Selection Strategy
                </label>
                <select
                  value={strategy.type}
                  onChange={(e) => setStrategy({ type: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="priority">Priority (Ordered List)</option>
                  <option value="cost-optimized">Cost Optimized (Cheapest First)</option>
                  <option value="load-balanced">Load Balanced (Round Robin)</option>
                  <option value="fastest">Fastest (Lowest Latency)</option>
                  <option value="best-quality">Best Quality (Best Models)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {strategy.type === 'priority' && 'Uses providers in order of priority'}
                  {strategy.type === 'cost-optimized' && 'Automatically selects the cheapest provider'}
                  {strategy.type === 'load-balanced' && 'Distributes requests evenly across providers'}
                  {strategy.type === 'fastest' && 'Selects provider with lowest average latency'}
                  {strategy.type === 'best-quality' && 'Uses the most capable models available'}
                </p>
              </div>

              {/* Fallback */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fallbackEnabled}
                    onChange={(e) => setFallbackEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Automatic Fallback</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  If a provider fails, automatically try the next available provider
                </p>
              </div>

              {/* Caching */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cacheEnabled}
                    onChange={(e) => setCacheEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Response Caching</span>
                </label>
                {cacheEnabled && (
                  <div className="mt-2 ml-6">
                    <label className="block text-xs text-gray-600 mb-1">Cache TTL (seconds)</label>
                    <input
                      type="number"
                      value={cacheTTL}
                      onChange={(e) => setCacheTTL(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      min="60"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Provider List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Configured Providers</h3>
              <div className="relative group">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  + Add Provider
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  {Object.entries(providerInfo).map(([key, info]) => (
                    <button
                      key={key}
                      onClick={() => addProvider(key as AIProvider)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="font-medium text-gray-900">{info.name}</div>
                      <div className="text-xs text-gray-500">{info.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {providers.map((provider, index) => {
                const info = providerInfo[provider.provider];
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center text-white font-bold`}>
                          {info.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{info.name}</h4>
                          <p className="text-xs text-gray-500">{info.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={provider.enabled}
                            onChange={(e) => updateProvider(index, { enabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <button
                          onClick={() => removeProvider(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                        <input
                          type="password"
                          value={provider.apiKey}
                          onChange={(e) => updateProvider(index, { apiKey: e.target.value })}
                          placeholder="Enter API key..."
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <input
                          type="number"
                          value={provider.priority}
                          onChange={(e) => updateProvider(index, { priority: parseInt(e.target.value) })}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requests/Min Limit</label>
                        <input
                          type="number"
                          value={provider.rateLimit?.requestsPerMinute || 60}
                          onChange={(e) => updateProvider(index, {
                            rateLimit: { ...provider.rateLimit!, requestsPerMinute: parseInt(e.target.value) }
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tokens/Min Limit</label>
                        <input
                          type="number"
                          value={provider.rateLimit?.tokensPerMinute || 100000}
                          onChange={(e) => updateProvider(index, {
                            rateLimit: { ...provider.rateLimit!, tokensPerMinute: parseInt(e.target.value) }
                          })}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {providers.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No providers configured. Click "Add Provider" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Preview */}
          {analytics.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Provider Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analytics.map((stat) => (
                  <div key={stat.provider} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{providerInfo[stat.provider].name}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${stat.uptime > 95 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {stat.uptime.toFixed(1)}% uptime
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Requests:</span>
                        <span className="font-medium">{stat.totalRequests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Latency:</span>
                        <span className="font-medium">{stat.averageLatency.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Cost:</span>
                        <span className="font-medium">${stat.totalCost.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIProviderSettings;
