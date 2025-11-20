/**
 * DeepSeek Provider
 * Supports DeepSeek Chat and Code models
 */

import { BaseProvider } from './BaseProvider';
import {
  AIProvider,
  AIRequest,
  AIResponse,
  AIModel,
  ProviderConfig,
} from '../../types/apiProvider';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekCompletionRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  response_format?: { type: 'json_object' };
}

export class DeepSeekProvider extends BaseProvider {
  provider: AIProvider = 'deepseek';
  private baseUrl: string;

  private models: AIModel[] = [
    {
      id: 'deepseek-chat',
      provider: 'deepseek',
      name: 'DeepSeek Chat',
      capabilities: ['text-generation', 'json-mode', 'streaming'],
      contextWindow: 64000,
      costPer1kTokens: { input: 0.00014, output: 0.00028 },
      maxOutputTokens: 4096,
      supportsVision: false,
      supportsStreaming: true,
    },
    {
      id: 'deepseek-coder',
      provider: 'deepseek',
      name: 'DeepSeek Coder',
      capabilities: ['text-generation', 'streaming'],
      contextWindow: 128000,
      costPer1kTokens: { input: 0.00014, output: 0.00028 },
      maxOutputTokens: 4096,
      supportsVision: false,
      supportsStreaming: true,
    },
  ];

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://api.deepseek.com/v1';
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);

    const model = this.getModel(request.model || 'deepseek-chat');
    const messages = this.buildMessages(request);

    const requestBody: DeepSeekCompletionRequest = {
      model: model.id,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
    };

    if (request.jsonMode) {
      requestBody.response_format = { type: 'json_object' };
    }

    const { result, latency } = await this.measureLatency(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.json();
          throw {
            response: {
              status: response.status,
              data: error,
            },
          };
        }

        return await response.json();
      } catch (error) {
        this.handleError(error);
      }
    });

    const choice = result.choices[0];
    const usage = result.usage;

    this.trackRequest(usage.total_tokens);
    this.updateHealth(true, latency);

    const aiResponse: AIResponse = {
      provider: this.provider,
      model: model.id,
      content: choice.message.content || '',
      finishReason: this.mapFinishReason(choice.finish_reason),
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      cost: this.calculateCost(usage.prompt_tokens, usage.completion_tokens, model),
      latency,
    };

    return aiResponse;
  }

  async *generateStream(request: AIRequest): AsyncGenerator<string, AIResponse> {
    this.validateRequest(request);

    const model = this.getModel(request.model || 'deepseek-chat');
    const messages = this.buildMessages(request);

    const requestBody: DeepSeekCompletionRequest = {
      model: model.id,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
      stream: true,
    };

    const startTime = Date.now();
    let fullContent = '';
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        this.handleError({ response: { status: response.status, data: error } });
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;

              if (content) {
                fullContent += content;
                yield content;
              }

              // Track usage if available
              if (parsed.usage) {
                promptTokens = parsed.usage.prompt_tokens;
                completionTokens = parsed.usage.completion_tokens;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      this.handleError(error);
    }

    const latency = Date.now() - startTime;
    const totalTokens = promptTokens + completionTokens;

    this.trackRequest(totalTokens);
    this.updateHealth(true, latency);

    return {
      provider: this.provider,
      model: model.id,
      content: fullContent,
      finishReason: 'stop',
      usage: {
        promptTokens,
        completionTokens,
        totalTokens,
      },
      cost: this.calculateCost(promptTokens, completionTokens, model),
      latency,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      // DeepSeek doesn't have a models endpoint, so we'll do a simple completion
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 5,
        }),
      });
      const isHealthy = response.ok;
      this.updateHealth(isHealthy, 0);
      return isHealthy;
    } catch {
      this.updateHealth(false, 0);
      return false;
    }
  }

  async getAvailableModels(): Promise<AIModel[]> {
    return this.models;
  }

  protected supportsVision(): boolean {
    return false;
  }

  private getModel(modelId: string): AIModel {
    const model = this.models.find((m) => m.id === modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found for ${this.provider}`);
    }
    return model;
  }

  private buildMessages(request: AIRequest): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [];

    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: request.prompt,
    });

    return messages;
  }

  private mapFinishReason(reason: string): AIResponse['finishReason'] {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      default:
        return 'stop';
    }
  }
}
