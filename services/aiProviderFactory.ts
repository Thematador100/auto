// aiProviderFactory.ts
import { DTCCode, InspectionState, AIProvider } from '../types';
import { Chat } from '@google/genai';
import * as geminiService from './geminiService';
import * as deepseekService from './deepseekService';
import { CONFIG } from '../config';

/**
 * Interface for AI provider services
 */
export interface AIService {
  analyzeDTCCodes: (codes: DTCCode[]) => Promise<string>;
  generateReportSummary: (inspectionState: InspectionState) => Promise<string>;
  createChatSession?: (location: { latitude: number; longitude: number } | null) => Chat;
  chatCompletion?: (userMessage: string, systemInstruction?: string) => Promise<string>;
}

/**
 * Get the AI provider to use based on configuration and feature flags
 * @param preferredProvider Optional preferred provider (overrides config)
 * @param taskType Type of task (vision tasks always use Gemini, text tasks can use DeepSeek)
 * @returns The AI provider to use
 */
export const getAIProvider = (
  preferredProvider?: AIProvider,
  taskType: 'vision' | 'text' | 'chat' = 'text'
): AIProvider => {
  // Vision tasks always use Gemini (DeepSeek doesn't support vision yet)
  if (taskType === 'vision') {
    return 'gemini';
  }

  // Use preferred provider if specified
  if (preferredProvider) {
    return preferredProvider;
  }

  // Check feature flags for DeepSeek
  const deepseekEnabled = CONFIG.FEATURES.flags.deepseekAI?.enabled;
  if (deepseekEnabled && CONFIG.AI.defaultProvider === 'deepseek') {
    return 'deepseek';
  }

  // Default to Gemini
  return CONFIG.AI.defaultProvider;
};

/**
 * Get AI service implementation based on provider
 * @param provider The AI provider to use
 * @returns AI service implementation
 */
export const getAIService = (provider: AIProvider): AIService => {
  switch (provider) {
    case 'deepseek':
      return {
        analyzeDTCCodes: deepseekService.analyzeDTCCodes,
        generateReportSummary: deepseekService.generateReportSummary,
        chatCompletion: deepseekService.chatCompletion,
      };

    case 'gemini':
    default:
      return {
        analyzeDTCCodes: geminiService.analyzeDTCCodes,
        generateReportSummary: geminiService.generateReportSummary,
        createChatSession: geminiService.createChatSession,
      };
  }
};

/**
 * Analyze DTC codes using the appropriate AI provider
 * @param codes Array of DTC codes
 * @param preferredProvider Optional preferred provider
 * @returns Analysis result
 */
export const analyzeDTCCodes = async (
  codes: DTCCode[],
  preferredProvider?: AIProvider
): Promise<string> => {
  const provider = getAIProvider(preferredProvider, 'text');
  const service = getAIService(provider);
  return service.analyzeDTCCodes(codes);
};

/**
 * Generate report summary using the appropriate AI provider
 * @param inspectionState Inspection data
 * @param preferredProvider Optional preferred provider
 * @returns Report summary
 */
export const generateReportSummary = async (
  inspectionState: InspectionState,
  preferredProvider?: AIProvider
): Promise<string> => {
  const provider = getAIProvider(preferredProvider, 'text');
  const service = getAIService(provider);
  return service.generateReportSummary(inspectionState);
};

/**
 * Create chat session (uses Gemini for grounding support)
 * @param location User location for Maps grounding
 * @returns Chat session
 */
export const createChatSession = (
  location: { latitude: number; longitude: number } | null
): Chat => {
  // Always use Gemini for chat with grounding (Google Search/Maps)
  return geminiService.createChatSession(location);
};

/**
 * Simple chat completion (can use DeepSeek for cost optimization)
 * @param userMessage User's message
 * @param systemInstruction Optional system instruction
 * @param preferredProvider Optional preferred provider
 * @returns AI response
 */
export const chatCompletion = async (
  userMessage: string,
  systemInstruction?: string,
  preferredProvider?: AIProvider
): Promise<string> => {
  const provider = getAIProvider(preferredProvider, 'chat');
  const service = getAIService(provider);

  if (service.chatCompletion) {
    return service.chatCompletion(userMessage, systemInstruction);
  } else {
    // Fallback to Gemini if provider doesn't support simple chat
    return deepseekService.chatCompletion(userMessage, systemInstruction);
  }
};

/**
 * Get AI model cost per million tokens
 * @param provider AI provider
 * @param modelName Model name
 * @returns Cost per million tokens
 */
export const getModelCost = (provider: AIProvider, modelName: string): number => {
  const model = CONFIG.AI.models.find(
    m => m.provider === provider && m.modelName === modelName
  );
  return model?.costPerMillionTokens || 0;
};

/**
 * Get available AI models for a subscription tier
 * @param tier Subscription tier
 * @returns Available AI models
 */
export const getAvailableModels = (tier: string) => {
  return CONFIG.AI.models.filter(model =>
    model.availableForTiers.includes(tier as any)
  );
};

/**
 * Choose optimal AI provider based on task and tier
 * Strategy:
 * - Free tier: Use DeepSeek (cheapest)
 * - Individual: Use DeepSeek for text, Gemini for vision
 * - Professional: Use Gemini for most tasks
 * - Enterprise: Use GPT-4o for critical tasks
 */
export const getOptimalProvider = (
  tier: string,
  taskType: 'vision' | 'text' | 'chat' = 'text'
): AIProvider => {
  if (taskType === 'vision') {
    return 'gemini'; // Only Gemini and GPT-4 support vision, Gemini is cheaper
  }

  switch (tier) {
    case 'free':
      return 'deepseek'; // Lowest cost
    case 'individual':
      return 'deepseek'; // Good balance of cost and quality
    case 'professional':
      return 'gemini'; // Better quality, still reasonable cost
    case 'enterprise':
      return 'gemini'; // Can upgrade to GPT-4 for critical tasks
    default:
      return 'gemini';
  }
};
