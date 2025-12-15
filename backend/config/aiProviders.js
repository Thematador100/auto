import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize AI providers
let geminiClient = null;
let deepseekClient = null;
let openaiClient = null;

// Gemini setup
if (process.env.GEMINI_API_KEY) {
  geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini API initialized');
} else {
  console.warn('⚠️  GEMINI_API_KEY not configured');
}

// DeepSeek setup (uses OpenAI-compatible API)
if (process.env.DEEPSEEK_API_KEY) {
  deepseekClient = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1'
  });
  console.log('✅ DeepSeek API initialized');
} else {
  console.warn('⚠️  DEEPSEEK_API_KEY not configured');
}

// OpenAI setup
if (process.env.OPENAI_API_KEY) {
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('✅ OpenAI API initialized');
} else {
  console.warn('⚠️  OPENAI_API_KEY not configured');
}

/**
 * Generate text using AI with automatic fallback
 * Tries: Gemini → DeepSeek → OpenAI
 */
export const generateText = async (prompt, options = {}) => {
  const { temperature = 0.7, maxTokens = 2000 } = options;
  const errors = [];

  // Try Gemini first (free tier available)
  if (geminiClient) {
    try {
      console.log('[AI] Attempting with Gemini...');
      const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      });
      const response = result.response;
      return response.text();
    } catch (error) {
      errors.push(`Gemini: ${error.message}`);
      console.error('[AI] Gemini failed:', error.message);
    }
  }

  // Try DeepSeek (cost-effective alternative)
  if (deepseekClient) {
    try {
      console.log('[AI] Attempting with DeepSeek...');
      const completion = await deepseekClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens
      });
      return completion.choices[0].message.content;
    } catch (error) {
      errors.push(`DeepSeek: ${error.message}`);
      console.error('[AI] DeepSeek failed:', error.message);
    }
  }

  // Try OpenAI as last resort
  if (openaiClient) {
    try {
      console.log('[AI] Attempting with OpenAI...');
      const completion = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens
      });
      return completion.choices[0].message.content;
    } catch (error) {
      errors.push(`OpenAI: ${error.message}`);
      console.error('[AI] OpenAI failed:', error.message);
    }
  }

  // All providers failed
  throw new Error(`All AI providers failed: ${errors.join('; ')}`);
};

/**
 * Analyze an image using AI vision models
 * Currently uses Gemini (has vision support in free tier)
 */
export const analyzeImage = async (imageBase64, prompt) => {
  if (!geminiClient) {
    throw new Error('Gemini API not configured - image analysis requires Gemini');
  }

  try {
    console.log('[AI] Analyzing image with Gemini Vision...');
    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Remove data URI prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          }
        ]
      }]
    });

    return result.response.text();
  } catch (error) {
    console.error('[AI] Image analysis failed:', error);
    throw new Error(`Image analysis failed: ${error.message}`);
  }
};

export default { generateText, analyzeImage };
