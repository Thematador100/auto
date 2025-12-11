// services/aiProviderService.ts
// Multi-provider AI service with automatic fallback support
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

export type AIProvider = 'gemini' | 'deepseek' | 'openai';

interface AIProviderConfig {
  gemini?: {
    apiKey: string;
    models: {
      flash: string;
      pro: string;
    };
  };
  deepseek?: {
    apiKey: string;
    baseURL: string;
    model: string;
  };
  openai?: {
    apiKey: string;
    model: string;
  };
}

class AIProviderService {
  private config: AIProviderConfig;
  private geminiClient?: GoogleGenAI;
  private deepseekClient?: OpenAI;
  private openaiClient?: OpenAI;
  private providerOrder: AIProvider[] = ['gemini', 'deepseek', 'openai'];
  private failedProviders: Set<AIProvider> = new Set();

  constructor() {
    this.config = this.loadConfig();
    this.initializeClients();
  }

  private loadConfig(): AIProviderConfig {
    const config: AIProviderConfig = {};

    // Load Gemini config
    if (process.env.GEMINI_API_KEY || process.env.API_KEY) {
      config.gemini = {
        apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
        models: {
          flash: 'gemini-2.5-flash',
          pro: 'gemini-2.5-pro',
        },
      };
    }

    // Load DeepSeek config
    if (process.env.DEEPSEEK_API_KEY) {
      config.deepseek = {
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1',
        model: 'deepseek-chat',
      };
    }

    // Load OpenAI config (optional fallback)
    if (process.env.OPENAI_API_KEY) {
      config.openai = {
        apiKey: process.env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
      };
    }

    return config;
  }

  private initializeClients(): void {
    try {
      if (this.config.gemini) {
        this.geminiClient = new GoogleGenAI({ apiKey: this.config.gemini.apiKey });
        console.log('[AIProvider] ✅ Gemini client initialized');
      }
    } catch (error) {
      console.warn('[AIProvider] ⚠️ Failed to initialize Gemini client:', error);
    }

    try {
      if (this.config.deepseek) {
        this.deepseekClient = new OpenAI({
          apiKey: this.config.deepseek.apiKey,
          baseURL: this.config.deepseek.baseURL,
        });
        console.log('[AIProvider] ✅ DeepSeek client initialized');
      }
    } catch (error) {
      console.warn('[AIProvider] ⚠️ Failed to initialize DeepSeek client:', error);
    }

    try {
      if (this.config.openai) {
        this.openaiClient = new OpenAI({
          apiKey: this.config.openai.apiKey,
        });
        console.log('[AIProvider] ✅ OpenAI client initialized');
      }
    } catch (error) {
      console.warn('[AIProvider] ⚠️ Failed to initialize OpenAI client:', error);
    }
  }

  /**
   * Generate text completion with automatic fallback between providers
   */
  async generateText(prompt: string, preferredModel?: 'flash' | 'pro'): Promise<string> {
    const errors: Record<string, Error> = {};

    for (const provider of this.providerOrder) {
      // Skip if provider failed recently
      if (this.failedProviders.has(provider)) {
        continue;
      }

      try {
        console.log(`[AIProvider] Attempting to use ${provider}...`);

        switch (provider) {
          case 'gemini':
            if (this.geminiClient && this.config.gemini) {
              const model = preferredModel === 'pro'
                ? this.config.gemini.models.pro
                : this.config.gemini.models.flash;

              const response = await this.geminiClient.models.generateContent({
                model,
                contents: prompt,
              });
              console.log(`[AIProvider] ✅ Success with Gemini (${model})`);
              this.failedProviders.delete(provider); // Clear failure flag on success
              return response.text;
            }
            break;

          case 'deepseek':
            if (this.deepseekClient && this.config.deepseek) {
              const response = await this.deepseekClient.chat.completions.create({
                model: this.config.deepseek.model,
                messages: [{ role: 'user', content: prompt }],
              });
              console.log(`[AIProvider] ✅ Success with DeepSeek`);
              this.failedProviders.delete(provider);
              return response.choices[0]?.message?.content || '';
            }
            break;

          case 'openai':
            if (this.openaiClient && this.config.openai) {
              const response = await this.openaiClient.chat.completions.create({
                model: this.config.openai.model,
                messages: [{ role: 'user', content: prompt }],
              });
              console.log(`[AIProvider] ✅ Success with OpenAI`);
              this.failedProviders.delete(provider);
              return response.choices[0]?.message?.content || '';
            }
            break;
        }
      } catch (error) {
        console.error(`[AIProvider] ❌ ${provider} failed:`, error);
        errors[provider] = error as Error;
        this.failedProviders.add(provider);
        // Continue to next provider
      }
    }

    // All providers failed
    const errorMessages = Object.entries(errors)
      .map(([provider, error]) => `${provider}: ${error.message}`)
      .join('; ');

    throw new Error(
      `All AI providers failed. Please check your API keys in .env.local. Errors: ${errorMessages}`
    );
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProvider[] {
    const available: AIProvider[] = [];
    if (this.geminiClient) available.push('gemini');
    if (this.deepseekClient) available.push('deepseek');
    if (this.openaiClient) available.push('openai');
    return available;
  }

  /**
   * Check if any provider is configured
   */
  hasAnyProvider(): boolean {
    return this.getAvailableProviders().length > 0;
  }

  /**
   * Get Gemini client for special features (grounding, etc.)
   */
  getGeminiClient(): GoogleGenAI | null {
    return this.geminiClient || null;
  }

  /**
   * Reset failed providers (useful for retry logic)
   */
  resetFailedProviders(): void {
    this.failedProviders.clear();
  }
}

// Export singleton instance
export const aiProvider = new AIProviderService();
