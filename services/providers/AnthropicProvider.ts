/**
 * Anthropic Claude Provider
 * Supports Claude 3.5 Sonnet, Claude 3 Opus, and other Claude models
 */

import { BaseProvider } from './BaseProvider';
import {
  AIProvider,
  AIRequest,
  AIResponse,
  AIModel,
  ProviderConfig,
} from '../../types/apiProvider';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; source?: any }>;
}

interface ClaudeCompletionRequest {
  model: string;
  messages: ClaudeMessage[];
  system?: string;
  temperature?: number;
  max_tokens: number;
  stream?: boolean;
  tools?: any[];
}

export class AnthropicProvider extends BaseProvider {
  provider: AIProvider = 'anthropic';
  private baseUrl: string;
  private apiVersion: string = '2023-06-01';

  private models: AIModel[] = [
    {
      id: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic',
      name: 'Claude 3.5 Sonnet',
      capabilities: ['text-generation', 'vision', 'function-calling', 'streaming'],
      contextWindow: 200000,
      costPer1kTokens: { input: 0.003, output: 0.015 },
      maxOutputTokens: 8192,
      supportsVision: true,
      supportsStreaming: true,
    },
    {
      id: 'claude-3-opus-20240229',
      provider: 'anthropic',
      name: 'Claude 3 Opus',
      capabilities: ['text-generation', 'vision', 'function-calling', 'streaming'],
      contextWindow: 200000,
      costPer1kTokens: { input: 0.015, output: 0.075 },
      maxOutputTokens: 4096,
      supportsVision: true,
      supportsStreaming: true,
    },
    {
      id: 'claude-3-sonnet-20240229',
      provider: 'anthropic',
      name: 'Claude 3 Sonnet',
      capabilities: ['text-generation', 'vision', 'function-calling', 'streaming'],
      contextWindow: 200000,
      costPer1kTokens: { input: 0.003, output: 0.015 },
      maxOutputTokens: 4096,
      supportsVision: true,
      supportsStreaming: true,
    },
    {
      id: 'claude-3-haiku-20240307',
      provider: 'anthropic',
      name: 'Claude 3 Haiku',
      capabilities: ['text-generation', 'vision', 'streaming'],
      contextWindow: 200000,
      costPer1kTokens: { input: 0.00025, output: 0.00125 },
      maxOutputTokens: 4096,
      supportsVision: true,
      supportsStreaming: true,
    },
  ];

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);

    const model = this.getModel(request.model || 'claude-3-5-sonnet-20241022');
    const messages = this.buildMessages(request);

    const requestBody: ClaudeCompletionRequest = {
      model: model.id,
      messages,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature ?? 0.7,
    };

    if (request.systemPrompt) {
      requestBody.system = request.systemPrompt;
    }

    if (request.tools?.length) {
      requestBody.tools = this.convertTools(request.tools);
    }

    const { result, latency } = await this.measureLatency(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version': this.apiVersion,
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

    const usage = result.usage;

    this.trackRequest(usage.input_tokens + usage.output_tokens);
    this.updateHealth(true, latency);

    const content = Array.isArray(result.content)
      ? result.content.find((c: any) => c.type === 'text')?.text || ''
      : result.content;

    const aiResponse: AIResponse = {
      provider: this.provider,
      model: model.id,
      content,
      finishReason: this.mapFinishReason(result.stop_reason),
      usage: {
        promptTokens: usage.input_tokens,
        completionTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens,
      },
      cost: this.calculateCost(usage.input_tokens, usage.output_tokens, model),
      latency,
    };

    // Handle tool calls if present
    const toolUseContent = Array.isArray(result.content)
      ? result.content.filter((c: any) => c.type === 'tool_use')
      : [];

    if (toolUseContent.length > 0) {
      aiResponse.toolCalls = toolUseContent.map((tc: any) => ({
        id: tc.id,
        name: tc.name,
        arguments: tc.input,
      }));
    }

    return aiResponse;
  }

  async *generateStream(request: AIRequest): AsyncGenerator<string, AIResponse> {
    this.validateRequest(request);

    const model = this.getModel(request.model || 'claude-3-5-sonnet-20241022');
    const messages = this.buildMessages(request);

    const requestBody: ClaudeCompletionRequest = {
      model: model.id,
      messages,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature ?? 0.7,
      stream: true,
    };

    if (request.systemPrompt) {
      requestBody.system = request.systemPrompt;
    }

    const startTime = Date.now();
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': this.apiVersion,
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

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text;
                if (content) {
                  fullContent += content;
                  yield content;
                }
              }

              if (parsed.type === 'message_start') {
                inputTokens = parsed.message?.usage?.input_tokens || 0;
              }

              if (parsed.type === 'message_delta') {
                outputTokens = parsed.usage?.output_tokens || 0;
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
    const totalTokens = inputTokens + outputTokens;

    this.trackRequest(totalTokens);
    this.updateHealth(true, latency);

    return {
      provider: this.provider,
      model: model.id,
      content: fullContent,
      finishReason: 'stop',
      usage: {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens,
      },
      cost: this.calculateCost(inputTokens, outputTokens, model),
      latency,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': this.apiVersion,
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
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
    return true;
  }

  private getModel(modelId: string): AIModel {
    const model = this.models.find((m) => m.id === modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found for ${this.provider}`);
    }
    return model;
  }

  private buildMessages(request: AIRequest): ClaudeMessage[] {
    const messages: ClaudeMessage[] = [];

    if (request.images && request.images.length > 0) {
      // Vision request
      const content: Array<{ type: string; text?: string; source?: any }> = [];

      if (request.prompt) {
        content.push({ type: 'text', text: request.prompt });
      }

      for (const image of request.images) {
        // Extract base64 data and media type
        let base64Data = image;
        let mediaType = 'image/jpeg';

        if (image.startsWith('data:')) {
          const matches = image.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            mediaType = matches[1];
            base64Data = matches[2];
          }
        }

        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data,
          },
        });
      }

      messages.push({ role: 'user', content });
    } else {
      messages.push({
        role: 'user',
        content: request.prompt,
      });
    }

    return messages;
  }

  private convertTools(tools: any[]): any[] {
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
    }));
  }

  private mapFinishReason(reason: string): AIResponse['finishReason'] {
    switch (reason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      default:
        return 'stop';
    }
  }
}
