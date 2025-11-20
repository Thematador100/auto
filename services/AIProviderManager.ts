/**
 * AI Provider Manager
 * Advanced multi-provider system with fallback, load balancing, cost optimization, and analytics
 */

import {
  AIProvider,
  AIRequest,
  AIResponse,
  AIProviderInterface,
  AIProviderManagerConfig,
  ProviderConfig,
  ProviderStrategy,
  ProviderAnalytics,
  CachedResponse,
  AIModel,
} from '../types/apiProvider';

import { GeminiProvider } from './providers/GeminiProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { DeepSeekProvider } from './providers/DeepSeekProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';

export class AIProviderManager {
  private providers: Map<AIProvider, AIProviderInterface> = new Map();
  private config: AIProviderManagerConfig;
  private analytics: Map<AIProvider, ProviderAnalytics> = new Map();
  private cache: Map<string, CachedResponse> = new Map();

  constructor(config: AIProviderManagerConfig) {
    this.config = config;
    this.initializeProviders();
    this.initializeAnalytics();
    this.startCacheCleanup();
  }

  /**
   * Initialize all configured providers
   */
  private initializeProviders(): void {
    for (const providerConfig of this.config.providers) {
      if (!providerConfig.enabled) continue;

      let provider: AIProviderInterface;

      switch (providerConfig.provider) {
        case 'gemini':
          provider = new GeminiProvider(providerConfig);
          break;
        case 'openai':
          provider = new OpenAIProvider(providerConfig);
          break;
        case 'deepseek':
          provider = new DeepSeekProvider(providerConfig);
          break;
        case 'anthropic':
          provider = new AnthropicProvider(providerConfig);
          break;
        default:
          console.warn(`Provider ${providerConfig.provider} not implemented`);
          continue;
      }

      this.providers.set(providerConfig.provider, provider);
    }
  }

  /**
   * Initialize analytics for all providers
   */
  private initializeAnalytics(): void {
    for (const [providerName] of this.providers) {
      this.analytics.set(providerName, {
        provider: providerName,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        totalCost: 0,
        averageLatency: 0,
        averageTokensUsed: 0,
        uptime: 100,
        lastUsed: new Date(),
      });
    }
  }

  /**
   * Generate text using the configured strategy
   */
  async generateText(request: AIRequest): Promise<AIResponse> {
    // Check cache first
    if (this.config.caching.enabled && !request.stream) {
      const cachedResponse = this.checkCache(request);
      if (cachedResponse) {
        console.log(`[AIProviderManager] Cache hit for request`);
        return cachedResponse;
      }
    }

    const providers = this.selectProviders(request);

    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        console.log(`[AIProviderManager] Attempting request with ${provider.provider}`);

        if (!provider.canMakeRequest()) {
          console.warn(`[AIProviderManager] Rate limit reached for ${provider.provider}, trying next provider`);
          continue;
        }

        const response = await provider.generateText(request);

        // Update analytics
        this.updateAnalytics(provider.provider, response, true);

        // Cache response
        if (this.config.caching.enabled) {
          this.cacheResponse(request, response);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        console.error(`[AIProviderManager] ${provider.provider} failed:`, error);
        this.updateAnalytics(provider.provider, null, false);

        if (!this.config.fallbackEnabled) {
          throw error;
        }
      }
    }

    throw new Error(
      `All providers failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Generate streaming text
   */
  async *generateStream(request: AIRequest): AsyncGenerator<string, AIResponse> {
    const providers = this.selectProviders(request);

    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        console.log(`[AIProviderManager] Attempting stream with ${provider.provider}`);

        if (!provider.canMakeRequest()) {
          console.warn(`[AIProviderManager] Rate limit reached for ${provider.provider}, trying next provider`);
          continue;
        }

        const stream = provider.generateStream(request);
        let finalResponse: AIResponse | null = null;

        for await (const chunk of stream) {
          if (typeof chunk === 'string') {
            yield chunk;
          } else {
            finalResponse = chunk;
          }
        }

        if (finalResponse) {
          this.updateAnalytics(provider.provider, finalResponse, true);
          return finalResponse;
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`[AIProviderManager] ${provider.provider} stream failed:`, error);
        this.updateAnalytics(provider.provider, null, false);

        if (!this.config.fallbackEnabled) {
          throw error;
        }
      }
    }

    throw new Error(
      `All providers failed for streaming. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Select providers based on strategy
   */
  private selectProviders(request: AIRequest): AIProviderInterface[] {
    const availableProviders = Array.from(this.providers.values()).filter(
      (p) => p.config.enabled
    );

    if (availableProviders.length === 0) {
      throw new Error('No providers are enabled');
    }

    switch (this.config.strategy.type) {
      case 'priority':
        return this.priorityStrategy(availableProviders);

      case 'cost-optimized':
        return this.costOptimizedStrategy(availableProviders, request);

      case 'load-balanced':
        return this.loadBalancedStrategy(availableProviders);

      case 'fastest':
        return this.fastestStrategy(availableProviders);

      case 'best-quality':
        return this.bestQualityStrategy(availableProviders);

      default:
        return this.priorityStrategy(availableProviders);
    }
  }

  /**
   * Priority-based strategy (use highest priority first)
   */
  private priorityStrategy(providers: AIProviderInterface[]): AIProviderInterface[] {
    return [...providers].sort((a, b) => a.config.priority - b.config.priority);
  }

  /**
   * Cost-optimized strategy (use cheapest provider first)
   */
  private async costOptimizedStrategy(
    providers: AIProviderInterface[],
    request: AIRequest
  ): Promise<AIProviderInterface[]> {
    const providerCosts: Array<{ provider: AIProviderInterface; cost: number }> = [];

    for (const provider of providers) {
      const models = await provider.getAvailableModels();
      const model = models.find((m) => m.id === request.model) || models[0];

      // Estimate cost (assuming average 1000 tokens)
      const estimatedCost = model.costPer1kTokens.input + model.costPer1kTokens.output;
      providerCosts.push({ provider, cost: estimatedCost });
    }

    return providerCosts
      .sort((a, b) => a.cost - b.cost)
      .map((pc) => pc.provider);
  }

  /**
   * Load-balanced strategy (distribute across providers)
   */
  private loadBalancedStrategy(providers: AIProviderInterface[]): AIProviderInterface[] {
    // Simple round-robin based on request count
    return [...providers].sort((a, b) => {
      const aAnalytics = this.analytics.get(a.provider);
      const bAnalytics = this.analytics.get(b.provider);
      return (aAnalytics?.totalRequests || 0) - (bAnalytics?.totalRequests || 0);
    });
  }

  /**
   * Fastest strategy (use provider with lowest average latency)
   */
  private fastestStrategy(providers: AIProviderInterface[]): AIProviderInterface[] {
    return [...providers].sort((a, b) => {
      const aAnalytics = this.analytics.get(a.provider);
      const bAnalytics = this.analytics.get(b.provider);
      return (aAnalytics?.averageLatency || Infinity) - (bAnalytics?.averageLatency || Infinity);
    });
  }

  /**
   * Best quality strategy (use most capable models)
   */
  private bestQualityStrategy(providers: AIProviderInterface[]): AIProviderInterface[] {
    const qualityOrder: AIProvider[] = ['anthropic', 'openai', 'gemini', 'deepseek'];
    return [...providers].sort((a, b) => {
      const aIndex = qualityOrder.indexOf(a.provider);
      const bIndex = qualityOrder.indexOf(b.provider);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
  }

  /**
   * Check cache for existing response
   */
  private checkCache(request: AIRequest): AIResponse | null {
    const cacheKey = this.generateCacheKey(request);
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > new Date()) {
      return cached.response;
    }

    if (cached) {
      this.cache.delete(cacheKey);
    }

    return null;
  }

  /**
   * Cache a response
   */
  private cacheResponse(request: AIRequest, response: AIResponse): void {
    const cacheKey = this.generateCacheKey(request);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.caching.ttl * 1000);

    this.cache.set(cacheKey, {
      key: cacheKey,
      response,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(request: AIRequest): string {
    const keyData = {
      prompt: request.prompt,
      systemPrompt: request.systemPrompt,
      model: request.model,
      temperature: request.temperature,
      images: request.images?.map((img) => img.substring(0, 50)),
    };
    return btoa(JSON.stringify(keyData));
  }

  /**
   * Clean up expired cache entries
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = new Date();
      for (const [key, cached] of this.cache.entries()) {
        if (cached.expiresAt <= now) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }

  /**
   * Update analytics
   */
  private updateAnalytics(
    providerName: AIProvider,
    response: AIResponse | null,
    success: boolean
  ): void {
    const analytics = this.analytics.get(providerName);
    if (!analytics) return;

    analytics.totalRequests++;
    analytics.lastUsed = new Date();

    if (success && response) {
      analytics.successfulRequests++;

      // Update average latency
      const totalLatency = analytics.averageLatency * (analytics.successfulRequests - 1);
      analytics.averageLatency = (totalLatency + response.latency) / analytics.successfulRequests;

      // Update average tokens
      const totalTokens = analytics.averageTokensUsed * (analytics.successfulRequests - 1);
      analytics.averageTokensUsed = (totalTokens + response.usage.totalTokens) / analytics.successfulRequests;

      // Update total cost
      analytics.totalCost += response.cost;
    } else {
      analytics.failedRequests++;
    }

    // Update uptime
    analytics.uptime = (analytics.successfulRequests / analytics.totalRequests) * 100;
  }

  /**
   * Get analytics for a specific provider
   */
  getProviderAnalytics(provider: AIProvider): ProviderAnalytics | undefined {
    return this.analytics.get(provider);
  }

  /**
   * Get analytics for all providers
   */
  getAllAnalytics(): ProviderAnalytics[] {
    return Array.from(this.analytics.values());
  }

  /**
   * Get health status for all providers
   */
  async getProvidersHealth(): Promise<Map<AIProvider, boolean>> {
    const health = new Map<AIProvider, boolean>();

    for (const [providerName, provider] of this.providers) {
      const isHealthy = await provider.healthCheck();
      health.set(providerName, isHealthy);
    }

    return health;
  }

  /**
   * Get all available models from all providers
   */
  async getAllModels(): Promise<Map<AIProvider, AIModel[]>> {
    const models = new Map<AIProvider, AIModel[]>();

    for (const [providerName, provider] of this.providers) {
      const providerModels = await provider.getAvailableModels();
      models.set(providerName, providerModels);
    }

    return models;
  }

  /**
   * Add a new provider configuration
   */
  addProvider(config: ProviderConfig): void {
    let provider: AIProviderInterface;

    switch (config.provider) {
      case 'gemini':
        provider = new GeminiProvider(config);
        break;
      case 'openai':
        provider = new OpenAIProvider(config);
        break;
      case 'deepseek':
        provider = new DeepSeekProvider(config);
        break;
      case 'anthropic':
        provider = new AnthropicProvider(config);
        break;
      default:
        throw new Error(`Provider ${config.provider} not implemented`);
    }

    this.providers.set(config.provider, provider);
    this.analytics.set(config.provider, {
      provider: config.provider,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalCost: 0,
      averageLatency: 0,
      averageTokensUsed: 0,
      uptime: 100,
      lastUsed: new Date(),
    });
  }

  /**
   * Remove a provider
   */
  removeProvider(provider: AIProvider): void {
    this.providers.delete(provider);
    this.analytics.delete(provider);
  }

  /**
   * Enable/disable a provider
   */
  setProviderEnabled(provider: AIProvider, enabled: boolean): void {
    const providerInstance = this.providers.get(provider);
    if (providerInstance) {
      providerInstance.config.enabled = enabled;
    }
  }

  /**
   * Update provider configuration
   */
  updateProviderConfig(provider: AIProvider, config: Partial<ProviderConfig>): void {
    const providerInstance = this.providers.get(provider);
    if (providerInstance) {
      Object.assign(providerInstance.config, config);
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // TODO: Track cache hits/misses
    };
  }
}
