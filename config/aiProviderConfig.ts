/**
 * AI Provider Configuration
 * Default configuration for the multi-provider system
 */

import { AIProviderManagerConfig, ProviderConfig } from '../types/apiProvider';

/**
 * Load provider configurations from environment variables
 */
export const loadProviderConfigs = (): ProviderConfig[] => {
  const configs: ProviderConfig[] = [];

  // Google Gemini
  if (process.env.GEMINI_API_KEY) {
    configs.push({
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      enabled: true,
      priority: 1,
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 1000000,
      },
      timeout: 30000,
    });
  }

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    configs.push({
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      enabled: true,
      priority: 2,
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 150000,
      },
      timeout: 30000,
    });
  }

  // DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    configs.push({
      provider: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      enabled: true,
      priority: 3,
      rateLimit: {
        requestsPerMinute: 100,
        tokensPerMinute: 1000000,
      },
      timeout: 30000,
    });
  }

  // Anthropic Claude
  if (process.env.ANTHROPIC_API_KEY) {
    configs.push({
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      enabled: true,
      priority: 4,
      rateLimit: {
        requestsPerMinute: 50,
        tokensPerMinute: 200000,
      },
      timeout: 30000,
    });
  }

  return configs;
};

/**
 * Default AI Provider Manager Configuration
 */
export const defaultAIProviderConfig: AIProviderManagerConfig = {
  providers: loadProviderConfigs(),
  defaultProvider: 'gemini',
  fallbackEnabled: true,
  strategy: {
    type: 'priority',
  },
  caching: {
    enabled: true,
    ttl: 3600, // 1 hour
  },
  analytics: {
    enabled: true,
    trackCosts: true,
    trackPerformance: true,
  },
};

/**
 * Get configuration from localStorage (user preferences)
 */
export const getUserProviderConfig = (): AIProviderManagerConfig | null => {
  try {
    const saved = localStorage.getItem('aiProviderConfig');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load user provider config:', error);
  }
  return null;
};

/**
 * Save configuration to localStorage
 */
export const saveUserProviderConfig = (config: AIProviderManagerConfig): void => {
  try {
    localStorage.setItem('aiProviderConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save user provider config:', error);
  }
};

/**
 * Get the active configuration (user config or default)
 */
export const getActiveProviderConfig = (): AIProviderManagerConfig => {
  const userConfig = getUserProviderConfig();
  if (userConfig && userConfig.providers.length > 0) {
    // Merge environment API keys with user config
    const envConfigs = loadProviderConfigs();
    const mergedProviders = userConfig.providers.map((userProvider) => {
      const envProvider = envConfigs.find((e) => e.provider === userProvider.provider);
      if (envProvider && !userProvider.apiKey) {
        return { ...userProvider, apiKey: envProvider.apiKey };
      }
      return userProvider;
    });

    return {
      ...userConfig,
      providers: mergedProviders,
    };
  }

  return defaultAIProviderConfig;
};

/**
 * Validate provider configuration
 */
export const validateProviderConfig = (config: AIProviderManagerConfig): {
  valid: boolean;
  errors: string[]
} => {
  const errors: string[] = [];

  if (!config.providers || config.providers.length === 0) {
    errors.push('At least one provider must be configured');
  }

  const enabledProviders = config.providers.filter((p) => p.enabled);
  if (enabledProviders.length === 0) {
    errors.push('At least one provider must be enabled');
  }

  for (const provider of config.providers) {
    if (provider.enabled && !provider.apiKey) {
      errors.push(`API key required for enabled provider: ${provider.provider}`);
    }

    if (provider.priority < 1) {
      errors.push(`Priority must be at least 1 for provider: ${provider.provider}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Export sample configuration for documentation
 */
export const sampleConfiguration: AIProviderManagerConfig = {
  providers: [
    {
      provider: 'gemini',
      apiKey: 'your-gemini-api-key',
      enabled: true,
      priority: 1,
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 1000000,
      },
      timeout: 30000,
    },
    {
      provider: 'openai',
      apiKey: 'your-openai-api-key',
      enabled: true,
      priority: 2,
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 150000,
      },
      timeout: 30000,
    },
    {
      provider: 'deepseek',
      apiKey: 'your-deepseek-api-key',
      enabled: true,
      priority: 3,
      rateLimit: {
        requestsPerMinute: 100,
        tokensPerMinute: 1000000,
      },
      timeout: 30000,
    },
  ],
  defaultProvider: 'gemini',
  fallbackEnabled: true,
  strategy: {
    type: 'cost-optimized', // or 'priority', 'load-balanced', 'fastest', 'best-quality'
  },
  caching: {
    enabled: true,
    ttl: 3600,
  },
  analytics: {
    enabled: true,
    trackCosts: true,
    trackPerformance: true,
  },
};
