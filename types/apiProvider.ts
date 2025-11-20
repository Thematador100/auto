/**
 * Advanced Multi-API Provider System
 * Supports Google Gemini, OpenAI, DeepSeek, Anthropic, and more
 */

export type AIProvider =
  | 'gemini'
  | 'openai'
  | 'deepseek'
  | 'anthropic'
  | 'azure-openai'
  | 'cohere'
  | 'mistral'
  | 'perplexity'
  | 'huggingface';

export type ModelCapability =
  | 'text-generation'
  | 'vision'
  | 'function-calling'
  | 'grounding'
  | 'streaming'
  | 'json-mode'
  | 'embeddings';

export interface AIModel {
  id: string;
  provider: AIProvider;
  name: string;
  capabilities: ModelCapability[];
  contextWindow: number;
  costPer1kTokens: {
    input: number;
    output: number;
  };
  maxOutputTokens: number;
  supportsVision: boolean;
  supportsStreaming: boolean;
}

export interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  organization?: string;
  enabled: boolean;
  priority: number; // Lower = higher priority for fallback
  rateLimit?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  timeout?: number; // milliseconds
}

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  images?: string[]; // base64 or URLs
  tools?: AITool[];
  jsonMode?: boolean;
  stream?: boolean;
}

export interface AITool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface AIResponse {
  provider: AIProvider;
  model: string;
  content: string;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'error';
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  latency: number; // milliseconds
  toolCalls?: AIToolCall[];
  groundingSources?: GroundingSource[];
  metadata?: Record<string, any>;
}

export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface GroundingSource {
  type: 'web' | 'maps' | 'custom';
  title: string;
  url: string;
  snippet?: string;
}

export interface ProviderHealth {
  provider: AIProvider;
  isHealthy: boolean;
  lastChecked: Date;
  responseTime: number;
  errorRate: number;
  requestsInWindow: number;
  tokensInWindow: number;
}

export interface AIProviderInterface {
  provider: AIProvider;
  config: ProviderConfig;

  // Core methods
  generateText(request: AIRequest): Promise<AIResponse>;
  generateStream(request: AIRequest): AsyncGenerator<string, AIResponse>;

  // Health and monitoring
  healthCheck(): Promise<boolean>;
  getAvailableModels(): Promise<AIModel[]>;

  // Rate limiting
  canMakeRequest(): boolean;
  trackRequest(tokens: number): void;
}

export interface ProviderStrategy {
  type: 'priority' | 'cost-optimized' | 'load-balanced' | 'fastest' | 'best-quality';
  customProviderOrder?: AIProvider[];
}

export interface AIProviderManagerConfig {
  providers: ProviderConfig[];
  defaultProvider?: AIProvider;
  fallbackEnabled: boolean;
  strategy: ProviderStrategy;
  caching: {
    enabled: boolean;
    ttl: number; // seconds
  };
  analytics: {
    enabled: boolean;
    trackCosts: boolean;
    trackPerformance: boolean;
  };
}

export interface ProviderAnalytics {
  provider: AIProvider;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  averageLatency: number;
  averageTokensUsed: number;
  uptime: number; // percentage
  lastUsed: Date;
}

export interface CachedResponse {
  key: string;
  response: AIResponse;
  timestamp: Date;
  expiresAt: Date;
}
