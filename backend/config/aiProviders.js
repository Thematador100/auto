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

// Get preferred provider from environment
const PREFERRED_PROVIDER = (process.env.PREFERRED_AI_PROVIDER || 'deepseek').toLowerCase();
console.log(`🎯 Preferred AI Provider: ${PREFERRED_PROVIDER}`);

/**
 * Generate text using AI with automatic fallback
 * Respects PREFERRED_AI_PROVIDER environment variable
 * Falls back to other providers if preferred one fails
 */
export const generateText = async (prompt, options = {}) => {
  const { temperature = 0.7, maxTokens = 2000 } = options;
  const errors = [];

  // Define provider functions
  const tryGemini = async () => {
    if (!geminiClient) throw new Error('Gemini not configured');
    console.log('[AI] Attempting with Gemini...');
    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    });
    return result.response.text();
  };

  const tryDeepSeek = async () => {
    if (!deepseekClient) throw new Error('DeepSeek not configured');
    console.log('[AI] Attempting with DeepSeek...');
    const completion = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens
    });
    return completion.choices[0].message.content;
  };

  const tryOpenAI = async () => {
    if (!openaiClient) throw new Error('OpenAI not configured');
    console.log('[AI] Attempting with OpenAI...');
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens
    });
    return completion.choices[0].message.content;
  };

  // Map provider names to functions
  const providers = {
    gemini: tryGemini,
    google: tryGemini,
    deepseek: tryDeepSeek,
    openai: tryOpenAI
  };

  // Try preferred provider first
  if (providers[PREFERRED_PROVIDER]) {
    try {
      return await providers[PREFERRED_PROVIDER]();
    } catch (error) {
      errors.push(`${PREFERRED_PROVIDER}: ${error.message}`);
      console.error(`[AI] ${PREFERRED_PROVIDER} failed:`, error.message);
    }
  }

  // Fallback to other providers in cost-effective order
  const fallbackOrder = ['deepseek', 'gemini', 'openai'].filter(p => p !== PREFERRED_PROVIDER);
  
  for (const providerName of fallbackOrder) {
    if (providers[providerName]) {
      try {
        return await providers[providerName]();
      } catch (error) {
        errors.push(`${providerName}: ${error.message}`);
        console.error(`[AI] ${providerName} failed:`, error.message);
      }
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
