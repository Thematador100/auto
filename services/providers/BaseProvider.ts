/**
 * Base Provider Class
 * Shared functionality for all AI providers
 */

import {
  AIProvider,
  AIProviderInterface,
  AIRequest,
  AIResponse,
  ProviderConfig,
  AIModel,
  ProviderHealth,
} from '../../types/apiProvider';

export abstract class BaseProvider implements AIProviderInterface {
  abstract provider: AIProvider;
  config: ProviderConfig;

  protected requestCount: number = 0;
  protected tokenCount: number = 0;
  protected windowStart: number = Date.now();
  protected healthStatus: ProviderHealth;

  constructor(config: ProviderConfig) {
    this.config = config;
    this.healthStatus = {
      provider: this.provider,
      isHealthy: true,
      lastChecked: new Date(),
      responseTime: 0,
      errorRate: 0,
      requestsInWindow: 0,
      tokensInWindow: 0,
    };
  }

  // Abstract methods that each provider must implement
  abstract generateText(request: AIRequest): Promise<AIResponse>;
  abstract generateStream(request: AIRequest): AsyncGenerator<string, AIResponse>;
  abstract getAvailableModels(): Promise<AIModel[]>;
  abstract healthCheck(): Promise<boolean>;

  /**
   * Rate limiting check
   */
  canMakeRequest(): boolean {
    if (!this.config.rateLimit) return true;

    const now = Date.now();
    const windowDuration = 60000; // 1 minute

    // Reset window if needed
    if (now - this.windowStart > windowDuration) {
      this.requestCount = 0;
      this.tokenCount = 0;
      this.windowStart = now;
    }

    const { requestsPerMinute, tokensPerMinute } = this.config.rateLimit;

    return (
      this.requestCount < requestsPerMinute &&
      this.tokenCount < tokensPerMinute
    );
  }

  /**
   * Track request for rate limiting
   */
  trackRequest(tokens: number): void {
    this.requestCount++;
    this.tokenCount += tokens;
    this.healthStatus.requestsInWindow = this.requestCount;
    this.healthStatus.tokensInWindow = this.tokenCount;
  }

  /**
   * Calculate cost based on tokens and model pricing
   */
  protected calculateCost(
    inputTokens: number,
    outputTokens: number,
    model: AIModel
  ): number {
    const inputCost = (inputTokens / 1000) * model.costPer1kTokens.input;
    const outputCost = (outputTokens / 1000) * model.costPer1kTokens.output;
    return inputCost + outputCost;
  }

  /**
   * Generate cache key for request
   */
  protected generateCacheKey(request: AIRequest): string {
    const keyData = {
      prompt: request.prompt,
      systemPrompt: request.systemPrompt,
      model: request.model,
      temperature: request.temperature,
      images: request.images?.map((img) => img.substring(0, 50)), // First 50 chars
    };
    return btoa(JSON.stringify(keyData));
  }

  /**
   * Measure latency wrapper
   */
  protected async measureLatency<T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; latency: number }> {
    const start = Date.now();
    const result = await operation();
    const latency = Date.now() - start;
    this.healthStatus.responseTime = latency;
    return { result, latency };
  }

  /**
   * Update health status after request
   */
  protected updateHealth(success: boolean, latency: number): void {
    this.healthStatus.lastChecked = new Date();
    this.healthStatus.responseTime = latency;
    this.healthStatus.isHealthy = success;
  }

  /**
   * Handle provider-specific errors
   */
  protected handleError(error: any): never {
    console.error(`[${this.provider}] Error:`, error);

    let errorMessage = 'Unknown error occurred';
    let errorType = 'unknown';

    if (error.response) {
      // HTTP error
      const status = error.response.status;
      if (status === 401 || status === 403) {
        errorType = 'authentication';
        errorMessage = `Authentication failed for ${this.provider}. Check your API key.`;
      } else if (status === 429) {
        errorType = 'rate_limit';
        errorMessage = `Rate limit exceeded for ${this.provider}. Please try again later.`;
      } else if (status >= 500) {
        errorType = 'server_error';
        errorMessage = `${this.provider} server error. Please try again later.`;
      } else {
        errorMessage = `${this.provider} API error: ${error.response.data?.error?.message || error.message}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(`[${this.provider}:${errorType}] ${errorMessage}`);
  }

  /**
   * Validate request
   */
  protected validateRequest(request: AIRequest): void {
    if (!request.prompt && !request.images?.length) {
      throw new Error('Request must include either prompt or images');
    }

    if (request.images?.length && !this.supportsVision()) {
      throw new Error(`${this.provider} does not support vision capabilities`);
    }

    if (!this.config.enabled) {
      throw new Error(`${this.provider} is currently disabled`);
    }
  }

  /**
   * Check if provider supports vision
   */
  protected supportsVision(): boolean {
    // Override in child classes
    return false;
  }

  /**
   * Get health status
   */
  getHealth(): ProviderHealth {
    return { ...this.healthStatus };
  }

  /**
   * Reset rate limits (for testing)
   */
  resetRateLimits(): void {
    this.requestCount = 0;
    this.tokenCount = 0;
    this.windowStart = Date.now();
  }
}
