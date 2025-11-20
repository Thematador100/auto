/**
 * Unified AI Service
 * Provides a simple interface to the multi-provider system
 * Maintains backward compatibility with existing code
 */

import { AIProviderManager } from './AIProviderManager';
import { getActiveProviderConfig } from '../config/aiProviderConfig';
import { DTCCode, InspectionState } from '../types';
import { AIRequest } from '../types/apiProvider';

// Initialize the provider manager with active configuration
let providerManager: AIProviderManager | null = null;

const getProviderManager = (): AIProviderManager => {
  if (!providerManager) {
    const config = getActiveProviderConfig();
    providerManager = new AIProviderManager(config);
  }
  return providerManager;
};

/**
 * Reinitialize the provider manager with new configuration
 */
export const reinitializeProviders = (): void => {
  const config = getActiveProviderConfig();
  providerManager = new AIProviderManager(config);
};

/**
 * Get the provider manager instance (for advanced usage)
 */
export const getAIProviderManager = (): AIProviderManager => {
  return getProviderManager();
};

/**
 * Analyzes a list of Diagnostic Trouble Codes (DTCs) and provides a detailed explanation.
 * @param codes An array of DTC codes.
 * @returns A formatted string with analysis and repair suggestions.
 */
export const analyzeDTCCodes = async (codes: DTCCode[]): Promise<string> => {
  const codeList = codes.map((c) => c.code).join(', ');
  const prompt = `
    You are an expert automotive diagnostic AI.
    Analyze the following Diagnostic Trouble Codes (DTCs): ${codeList}.

    For each code, provide:
    1.  A clear, concise definition of what the code means.
    2.  Common symptoms associated with the code.
    3.  A list of the most likely causes, ordered from most probable to least probable.
    4.  A step-by-step diagnostic and repair plan for a qualified mechanic.

    If multiple codes are present that are likely related (e.g., a system lean code with multiple cylinder misfires),
    explain the relationship and suggest a prioritized diagnostic approach.

    Format the response in clear, easy-to-read Markdown. Use headings for each code and bold text for emphasis.
  `;

  try {
    const manager = getProviderManager();
    const request: AIRequest = {
      prompt,
      temperature: 0.7,
    };

    const response = await manager.generateText(request);
    return response.content;
  } catch (error) {
    console.error('Error analyzing DTC codes:', error);
    throw new Error(
      'Failed to analyze DTC codes. The AI service may be temporarily unavailable.'
    );
  }
};

/**
 * Generates a comprehensive vehicle inspection report summary from inspection state.
 * @param inspectionState The collected data from the inspection form.
 * @returns A string containing the formatted report summary.
 */
export const generateReportSummary = async (
  inspectionState: InspectionState
): Promise<string> => {
  // A function to format checklist data into a concise string
  const formatChecklist = () => {
    let findings = '';
    for (const category in inspectionState.checklist) {
      const items = inspectionState.checklist[category];
      const noteworthyItems = items.filter(
        (item) => !item.checked || item.notes || item.photos.length > 0 || item.audio
      );
      if (noteworthyItems.length > 0) {
        findings += `\n### ${category}\n`;
        noteworthyItems.forEach((item) => {
          findings += `- **${item.item}:** ${item.checked ? 'Checked' : 'Issue Found'}. ${
            item.notes ? `Notes: ${item.notes}.` : ''
          } ${item.photos.length > 0 ? `${item.photos.length} photo(s).` : ''} ${
            item.audio ? 'Audio note recorded.' : ''
          }\n`;
        });
      }
    }
    return findings || 'All checked items passed without specific notes.';
  };

  const prompt = `
      You are an AI that generates professional vehicle inspection reports.
      Based on the following data, create a comprehensive report summary.

      **Vehicle Information:**
      - Year: ${inspectionState.vehicle.year}
      - Make: ${inspectionState.vehicle.make}
      - Model: ${inspectionState.vehicle.model}
      - VIN: ${inspectionState.vehicle.vin}
      - Odometer: ${inspectionState.odometer} miles

      **Inspector's Overall Notes:**
      ${inspectionState.overallNotes || 'No overall notes provided.'}

      **Checklist Findings (only items with issues or notes are listed):**
      ${formatChecklist()}

      **Instructions:**
      Generate a report with the following structure in Markdown format:

      ## Vehicle Inspection Summary

      ### 1. Overall Condition Assessment
      Provide a one-paragraph summary of the vehicle's overall condition based on all the provided data.
      Start with a general statement (e.g., "This vehicle is in excellent/good/fair/poor condition...") and then elaborate.

      ### 2. Key Findings
      Create a bulleted list of the most important issues or noteworthy observations.
      This should be a concise summary of the problems found. If no major issues were found, state that.
      - Example: Front brake pads are worn and need replacement.
      - Example: Minor oil leak observed from the valve cover gasket.

      ### 3. Recommendations
      Create a prioritized, bulleted list of recommended actions.
      Categorize them as "Immediate Attention Required," "Recommended Maintenance," and "Future Considerations."
      Be specific. For example, instead of "Fix brakes," say "Replace front brake pads and rotors."
    `;

  try {
    const manager = getProviderManager();
    const request: AIRequest = {
      prompt,
      temperature: 0.7,
      model: 'gemini-2.5-pro', // Prefer a more capable model for complex summarization
    };

    const response = await manager.generateText(request);
    return response.content;
  } catch (error) {
    console.error('Error generating report summary:', error);
    throw new Error(
      'Failed to generate report summary. The AI service may be temporarily unavailable.'
    );
  }
};

/**
 * Send a chat message and get a response
 * @param message The user's message
 * @param history Optional conversation history
 * @returns The AI's response
 */
export const sendChatMessage = async (
  message: string,
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ content: string; groundingSources?: any[] }> => {
  try {
    const manager = getProviderManager();

    // Build a prompt that includes history
    let fullPrompt = '';
    if (history && history.length > 0) {
      fullPrompt = history.map((msg) => `${msg.role}: ${msg.content}`).join('\n\n');
      fullPrompt += `\n\nuser: ${message}`;
    } else {
      fullPrompt = message;
    }

    const request: AIRequest = {
      prompt: fullPrompt,
      systemPrompt:
        'You are a helpful automotive assistant. You can answer questions about car repair, maintenance, and help find local automotive services. Be concise and helpful.',
      temperature: 0.7,
    };

    const response = await manager.generateText(request);
    return {
      content: response.content,
      groundingSources: response.groundingSources,
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw new Error('Failed to send chat message. The AI service may be temporarily unavailable.');
  }
};

/**
 * Analyze an image with AI vision
 * @param image Base64 encoded image
 * @param prompt Question or instruction about the image
 * @returns AI analysis of the image
 */
export const analyzeImage = async (image: string, prompt: string): Promise<string> => {
  try {
    const manager = getProviderManager();
    const request: AIRequest = {
      prompt,
      images: [image],
      temperature: 0.7,
    };

    const response = await manager.generateText(request);
    return response.content;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image. The AI service may be temporarily unavailable.');
  }
};

/**
 * Detect vehicle features from an image
 * @param imageBase64 Base64 encoded image
 * @returns Detected features as a string
 */
export const detectVehicleFeatures = async (imageBase64: string): Promise<string> => {
  const prompt = `
    Analyze this vehicle image and identify all visible features, damage, or notable characteristics.
    Include:
    - Vehicle condition
    - Visible damage or wear
    - Body style and color
    - Any distinctive features
    - Overall quality assessment

    Format the response as a concise bulleted list.
  `;

  return analyzeImage(imageBase64, prompt);
};

/**
 * Get provider statistics and analytics
 */
export const getProviderAnalytics = () => {
  const manager = getProviderManager();
  return manager.getAllAnalytics();
};

/**
 * Get provider health status
 */
export const getProvidersHealth = async () => {
  const manager = getProviderManager();
  return manager.getProvidersHealth();
};

/**
 * Get all available models from all providers
 */
export const getAllAvailableModels = async () => {
  const manager = getProviderManager();
  return manager.getAllModels();
};

// Export the provider manager for backward compatibility and advanced usage
export { AIProviderManager };
