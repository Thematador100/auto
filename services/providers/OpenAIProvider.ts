/**
 * OpenAI Provider
 * Supports GPT-4, GPT-4 Vision, GPT-3.5, and other OpenAI models
 */

import { BaseProvider } from './BaseProvider';
import {
  AIProvider,
  AIRequest,
  AIResponse,
  AIModel,
  ProviderConfig,
} from '../../types/apiProvider';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  response_format?: { type: 'json_object' };
  tools?: any[];
}

export class OpenAIProvider extends BaseProvider {
  provider: AIProvider = 'openai';
  private baseUrl: string;

  private models: AIModel[] = [
    {
      id: 'gpt-4-turbo',
      provider: 'openai',
      name: 'GPT-4 Turbo',
      capabilities: ['text-generation', 'vision', 'function-calling', 'json-mode', 'streaming'],
      contextWindow: 128000,
      costPer1kTokens: { input: 0.01, output: 0.03 },
      maxOutputTokens: 4096,
      supportsVision: true,
      supportsStreaming: true,
    },
    {
      id: 'gpt-4',
      provider: 'openai',
      name: 'GPT-4',
      capabilities: ['text-generation', 'function-calling', 'streaming'],
      contextWindow: 8192,
      costPer1kTokens: { input: 0.03, output: 0.06 },
      maxOutputTokens: 4096,
      supportsVision: false,
      supportsStreaming: true,
    },
    {
      id: 'gpt-4-vision-preview',
      provider: 'openai',
      name: 'GPT-4 Vision',
      capabilities: ['text-generation', 'vision', 'streaming'],
      contextWindow: 128000,
      costPer1kTokens: { input: 0.01, output: 0.03 },
      maxOutputTokens: 4096,
      supportsVision: true,
      supportsStreaming: true,
    },
    {
      id: 'gpt-3.5-turbo',
      provider: 'openai',
      name: 'GPT-3.5 Turbo',
      capabilities: ['text-generation', 'function-calling', 'streaming'],
      contextWindow: 16385,
      costPer1kTokens: { input: 0.0005, output: 0.0015 },
      maxOutputTokens: 4096,
      supportsVision: false,
      supportsStreaming: true,
    },
  ];

  constructor(config: ProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);

    const model = this.getModel(request.model || 'gpt-4-turbo');
    const messages = this.buildMessages(request);

    const requestBody: OpenAICompletionRequest = {
      model: model.id,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
    };

    if (request.jsonMode) {
      requestBody.response_format = { type: 'json_object' };
    }

    if (request.tools?.length) {
      requestBody.tools = this.convertTools(request.tools);
    }

    const { result, latency } = await this.measureLatency(async () => {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
            ...(this.config.organization && {
              'OpenAI-Organization': this.config.organization,
            }),
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

    // Handle tool calls if present
    if (choice.message.tool_calls) {
      aiResponse.toolCalls = choice.message.tool_calls.map((tc: any) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments),
      }));
    }

    return aiResponse;
  }

  async *generateStream(request: AIRequest): AsyncGenerator<string, AIResponse> {
    this.validateRequest(request);

    const model = this.getModel(request.model || 'gpt-4-turbo');
    const messages = this.buildMessages(request);

    const requestBody: OpenAICompletionRequest = {
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
          ...(this.config.organization && {
            'OpenAI-Organization': this.config.organization,
          }),
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
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
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

  private buildMessages(request: AIRequest): OpenAIMessage[] {
    const messages: OpenAIMessage[] = [];

    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      });
    }

    if (request.images && request.images.length > 0) {
      // Vision request
      const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

      if (request.prompt) {
        content.push({ type: 'text', text: request.prompt });
      }

      for (const image of request.images) {
        const imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
        content.push({
          type: 'image_url',
          image_url: { url: imageUrl },
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
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  private mapFinishReason(reason: string): AIResponse['finishReason'] {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'tool_calls':
      case 'function_call':
        return 'tool_calls';
      default:
        return 'stop';
    }
  }
}
