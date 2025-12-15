import { GoogleGenAI, GenerateContentResponse, Chat, GroundingChunk } from '@google/genai';
import { DTCCode, GroundingSource, InspectionState } from '../types';
import { backendService } from './backendService';

/**
 * IMPORTANT: This service now proxies all AI requests through the Railway backend.
 * API keys are stored securely on the backend - NEVER in the frontend!
 *
 * Legacy direct API calls have been replaced with backend service calls.
 */

/**
 * Analyzes a list of Diagnostic Trouble Codes (DTCs) via backend AI service
 * Backend handles API keys securely (Gemini/DeepSeek/OpenAI with automatic fallback)
 * @param codes An array of DTC codes.
 * @returns A formatted string with analysis and repair suggestions.
 */
export const analyzeDTCCodes = async (codes: DTCCode[]): Promise<string> => {
  console.log('[GeminiService] Proxying DTC analysis through Railway backend');
  return await backendService.analyzeDTCCodes(codes);
};

/**
 * Creates a new chat session with Google Search and Google Maps grounding enabled.
 * Note: This feature requires Gemini API on the backend
 * @param location Optional user location for Maps grounding.
 * @returns A Chat instance.
 *
 * WARNING: Chat sessions with grounding cannot be proxied through REST API easily.
 * This functionality needs to be implemented on the backend with WebSocket support.
 * For now, this is a placeholder that will be implemented in a future update.
 */
export const createChatSession = (location: { latitude: number; longitude: number } | null): Chat => {
  console.warn('[GeminiService] Chat sessions require WebSocket support - not yet implemented via backend');
  throw new Error('Chat sessions are temporarily unavailable. Backend WebSocket support coming soon.');
};

/**
 * Extracts grounding sources from a Gemini API response.
 * @param response The GenerateContentResponse from the API.
 * @returns An array of formatted GroundingSource objects.
 */
export const extractGroundingSources = (response: GenerateContentResponse): GroundingSource[] => {
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (!groundingMetadata?.groundingChunks) {
        return [];
    }

    return groundingMetadata.groundingChunks.map((chunk: GroundingChunk) => {
        if (chunk.web) {
            return { uri: chunk.web.uri, title: chunk.web.title };
        }
        if (chunk.maps) {
            return { uri: chunk.maps.uri, title: chunk.maps.title };
        }
        return null;
    }).filter((source): source is GroundingSource => source !== null);
};


/**
 * Generates a comprehensive vehicle inspection report summary via backend AI service
 * Backend handles API keys securely (Gemini/DeepSeek/OpenAI with automatic fallback)
 * @param inspectionState The collected data from the inspection form.
 * @returns A string containing the formatted report summary.
 */
export const generateReportSummary = async (inspectionState: InspectionState): Promise<string> => {
  console.log('[GeminiService] Proxying report generation through Railway backend');
  return await backendService.generateReportSummary(inspectionState);
};
