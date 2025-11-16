/**
 * Google Gemini Provider
 * Supports Gemini 2.5 Pro, Flash, and other Google models
 */

import { GoogleGenAI } from '@google/genai';
import { BaseProvider } from './BaseProvider';
import {
  AIProvider,
  AIRequest,
  AIResponse,
  AIModel,
  ProviderConfig,
} from '../../types/apiProvider';

export class GeminiProvider extends BaseProvider {
  provider: AIProvider = 'gemini';
  private ai: GoogleGenAI;

  private models: AIModel[] = [
    {
      id: 'gemini-2.5-pro',
      provider: 'gemini',
      name: 'Gemini 2.5 Pro',
      capabilities: ['text-generation', 'vision', 'grounding', 'function-calling', 'streaming'],
      contextWindow: 1000000,
      costPer1kTokens: { input: 0.00125, output: 0.005 },
      maxOutputTokens: 8192,
      supportsVision: true,
      supportsStreaming: true,
    },
    {
      id: 'gemini-2.5-flash',
      provider: 'gemini',
      name: 'Gemini 2.5 Flash',
      capabilities: ['text-generation', 'vision', 'grounding', 'function-calling', 'streaming'],
      contextWindow: 1000000,
      costPer1kTokens: { input: 0.00025, output: 0.001 },
      maxOutputTokens: 8192,
      supportsVision: true,
      supportsStreaming: true,
    },
    {
      id: 'gemini-1.5-pro',
      provider: 'gemini',
      name: 'Gemini 1.5 Pro',
      capabilities: ['text-generation', 'vision', 'grounding', 'function-calling', 'streaming'],
      contextWindow: 2000000,
      costPer1kTokens: { input: 0.00125, output: 0.005 },
      maxOutputTokens: 8192,
      supportsVision: true,
      supportsStreaming: true,
    },
    {
      id: 'gemini-1.5-flash',
      provider: 'gemini',
      name: 'Gemini 1.5 Flash',
      capabilities: ['text-generation', 'vision', 'function-calling', 'streaming'],
      contextWindow: 1000000,
      costPer1kTokens: { input: 0.000075, output: 0.0003 },
      maxOutputTokens: 8192,
      supportsVision: true,
      supportsStreaming: true,
    },
  ];

  constructor(config: ProviderConfig) {
    super(config);
    this.ai = new GoogleGenAI({ apiKey: config.apiKey });
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    this.validateRequest(request);

    const model = this.getModel(request.model || 'gemini-2.5-flash');
    const contents = this.buildContents(request);

    const generationConfig: any = {
      temperature: request.temperature ?? 0.7,
    };

    if (request.maxTokens) {
      generationConfig.maxOutputTokens = request.maxTokens;
    }

    if (request.jsonMode) {
      generationConfig.responseMimeType = 'application/json';
    }

    const { result, latency } = await this.measureLatency(async () => {
      try {
        const response = await this.ai.models.generateContent({
          model: model.id,
          contents,
          systemInstruction: request.systemPrompt,
          generationConfig,
        });
        return response;
      } catch (error) {
        this.handleError(error);
      }
    });

    const text = result.text;
    const usage = result.usageMetadata || { inputTokens: 0, outputTokens: 0 };

    const totalTokens = (usage.promptTokenCount || usage.inputTokens || 0) +
                        (usage.candidatesTokenCount || usage.outputTokens || 0);

    this.trackRequest(totalTokens);
    this.updateHealth(true, latency);

    const aiResponse: AIResponse = {
      provider: this.provider,
      model: model.id,
      content: text,
      finishReason: this.mapFinishReason(result.candidates?.[0]?.finishReason),
      usage: {
        promptTokens: usage.promptTokenCount || usage.inputTokens || 0,
        completionTokens: usage.candidatesTokenCount || usage.outputTokens || 0,
        totalTokens,
      },
      cost: this.calculateCost(
        usage.promptTokenCount || usage.inputTokens || 0,
        usage.candidatesTokenCount || usage.outputTokens || 0,
        model
      ),
      latency,
    };

    // Extract grounding sources if available
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      aiResponse.groundingSources = groundingMetadata.groundingChunks
        .map((chunk: any) => {
          if (chunk.web) {
            return {
              type: 'web' as const,
              title: chunk.web.title || '',
              url: chunk.web.uri || '',
              snippet: '',
            };
          }
          if (chunk.maps) {
            return {
              type: 'maps' as const,
              title: chunk.maps.title || '',
              url: chunk.maps.uri || '',
              snippet: '',
            };
          }
          return null;
        })
        .filter((source: any) => source !== null);
    }

    return aiResponse;
  }

  async *generateStream(request: AIRequest): AsyncGenerator<string, AIResponse> {
    this.validateRequest(request);

    const model = this.getModel(request.model || 'gemini-2.5-flash');
    const contents = this.buildContents(request);

    const generationConfig: any = {
      temperature: request.temperature ?? 0.7,
    };

    if (request.maxTokens) {
      generationConfig.maxOutputTokens = request.maxTokens;
    }

    const startTime = Date.now();
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const stream = await this.ai.models.generateContentStream({
        model: model.id,
        contents,
        systemInstruction: request.systemPrompt,
        generationConfig,
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullContent += text;
          yield text;
        }

        // Track usage
        if (chunk.usageMetadata) {
          inputTokens = chunk.usageMetadata.promptTokenCount || chunk.usageMetadata.inputTokens || 0;
          outputTokens = chunk.usageMetadata.candidatesTokenCount || chunk.usageMetadata.outputTokens || 0;
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
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'hi',
      });
      const isHealthy = !!response.text;
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

  private buildContents(request: AIRequest): any {
    if (request.images && request.images.length > 0) {
      // Vision request
      const parts: any[] = [];

      if (request.prompt) {
        parts.push({ text: request.prompt });
      }

      for (const image of request.images) {
        // Extract base64 data and media type
        let base64Data = image;
        let mimeType = 'image/jpeg';

        if (image.startsWith('data:')) {
          const matches = image.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            mimeType = matches[1];
            base64Data = matches[2];
          }
        }

        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }

      return [{ role: 'user', parts }];
    } else {
      return request.prompt;
    }
  }

  private mapFinishReason(reason: string | undefined): AIResponse['finishReason'] {
    switch (reason) {
      case 'STOP':
        return 'stop';
      case 'MAX_TOKENS':
        return 'length';
      default:
        return 'stop';
    }
  }
}
