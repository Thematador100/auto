import { DTCCode, InspectionState, GroundingSource } from '../types';
import { Chat, GenerateContentResponse } from '@google/genai';
import * as geminiService from './geminiService';
import * as deepseekService from './deepseekService';

// AI Provider selection
export type AIProvider = 'gemini' | 'deepseek';

// Default provider for different operations
const DEFAULT_PROVIDER: AIProvider = 'deepseek'; // Use cost-effective DeepSeek by default
const CHAT_PROVIDER: AIProvider = 'gemini'; // Chat requires Gemini for grounding features

/**
 * Get the preferred AI provider from environment or use default
 */
const getPreferredProvider = (): AIProvider => {
  const envProvider = process.env.PREFERRED_AI_PROVIDER?.toLowerCase();
  return (envProvider === 'gemini' || envProvider === 'deepseek') ? envProvider : DEFAULT_PROVIDER;
};

/**
 * Analyzes DTC codes using the specified or default AI provider
 * @param codes Array of DTC codes
 * @param provider Optional provider override ('gemini' or 'deepseek')
 * @returns Formatted analysis string
 */
export const analyzeDTCCodes = async (
  codes: DTCCode[],
  provider: AIProvider = getPreferredProvider()
): Promise<string> => {
  if (provider === 'gemini') {
    return geminiService.analyzeDTCCodes(codes);
  }
  return deepseekService.analyzeDTCCodesWithDeepSeek(codes);
};

/**
 * Generates a vehicle inspection report summary
 * @param inspectionState The collected inspection data
 * @param provider Optional provider override ('gemini' or 'deepseek')
 * @returns Formatted report summary
 */
export const generateReportSummary = async (
  inspectionState: InspectionState,
  provider: AIProvider = getPreferredProvider()
): Promise<string> => {
  if (provider === 'gemini') {
    return geminiService.generateReportSummary(inspectionState);
  }

  // For DeepSeek, we need to format the data differently
  const formatChecklist = () => {
    let findings = '';
    for (const category in inspectionState.checklist) {
      const items = inspectionState.checklist[category];
      const noteworthyItems = items.filter(item => !item.checked || item.notes || item.photos.length > 0 || item.audio);
      if (noteworthyItems.length > 0) {
        findings += `\n### ${category}\n`;
        noteworthyItems.forEach(item => {
          findings += `- **${item.item}:** ${item.checked ? 'Checked' : 'Issue Found'}. ${item.notes ? `Notes: ${item.notes}.` : ''} ${item.photos.length > 0 ? `${item.photos.length} photo(s).` : ''} ${item.audio ? 'Audio note recorded.' : ''}\n`;
        });
      }
    }
    return findings || 'All checked items passed without specific notes.';
  };

  return deepseekService.generateSimpleReportSummary(
    {
      year: inspectionState.vehicle.year,
      make: inspectionState.vehicle.make,
      model: inspectionState.vehicle.model,
      vin: inspectionState.vehicle.vin,
      odometer: inspectionState.odometer
    },
    formatChecklist(),
    inspectionState.overallNotes
  );
};

/**
 * Creates a chat session - always uses Gemini due to grounding features
 * @param location Optional user location for Maps grounding
 * @returns Chat instance
 */
export const createChatSession = (location: { latitude: number; longitude: number } | null): Chat => {
  // Chat always uses Gemini because it needs Google Search and Maps grounding
  return geminiService.createChatSession(location);
};

/**
 * Extracts grounding sources from a Gemini response
 * @param response The GenerateContentResponse
 * @returns Array of grounding sources
 */
export const extractGroundingSources = (response: GenerateContentResponse): GroundingSource[] => {
  return geminiService.extractGroundingSources(response);
};

/**
 * Get the current AI provider configuration
 */
export const getCurrentProvider = (): AIProvider => {
  return getPreferredProvider();
};
