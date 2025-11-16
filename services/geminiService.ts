import { GoogleGenAI, GenerateContentResponse, Chat, GroundingChunk } from '@google/genai';
import { DTCCode, GroundingSource, InspectionState } from '../types';
import { executeWithRetry, executeWithFallback } from './errorRecoveryService';
import { circuitBreakerRegistry } from './circuitBreaker';

// Guard against missing API key
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = 'gemini-2.5-flash';

// Initialize circuit breakers for API calls
const dtcAnalysisBreaker = circuitBreakerRegistry.getOrCreate('dtc-analysis', {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 30000,
  monitoringPeriod: 60000
});

const reportGenerationBreaker = circuitBreakerRegistry.getOrCreate('report-generation', {
  failureThreshold: 3,
  successThreshold: 2,
  timeout: 30000,
  monitoringPeriod: 60000
});

/**
 * Analyzes a list of Diagnostic Trouble Codes (DTCs) and provides a detailed explanation.
 * Enhanced with self-repair capabilities: retry logic, circuit breaker, and fallback.
 * @param codes An array of DTC codes.
 * @returns A formatted string with analysis and repair suggestions.
 */
export const analyzeDTCCodes = async (codes: DTCCode[]): Promise<string> => {
  const codeList = codes.map(c => c.code).join(', ');
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

  // Primary analysis function
  const performAnalysis = async (): Promise<string> => {
    return await dtcAnalysisBreaker.execute(async () => {
      const response = await ai.models.generateContent({
        model: textModel,
        contents: prompt,
      });
      return response.text;
    });
  };

  // Fallback: provide basic DTC information
  const fallbackAnalysis = async (): Promise<string> => {
    console.log('[Self-Repair] Using fallback DTC analysis');
    let result = '# DTC Code Analysis\n\n';
    result += '⚠️ *Using offline fallback - AI service temporarily unavailable*\n\n';

    for (const code of codes) {
      result += `## ${code.code}\n`;
      result += `**Description:** ${code.description || 'No description available'}\n\n`;
      result += `**General Recommendations:**\n`;
      result += `- Check the vehicle service manual for specific diagnostic procedures\n`;
      result += `- Verify all related sensors and wiring connections\n`;
      result += `- Clear the code and test drive to see if it returns\n`;
      result += `- Consult a qualified mechanic if the issue persists\n\n`;
    }

    return result;
  };

  // Execute with retry and fallback
  const result = await executeWithRetry(
    () => executeWithFallback(performAnalysis, fallbackAnalysis, 'DTC Analysis'),
    {
      maxRetries: 3,
      initialDelayMs: 2000,
      maxDelayMs: 8000,
      backoffMultiplier: 2,
      retryableErrors: ['503', '429', '500', 'ETIMEDOUT', 'ECONNRESET']
    },
    'DTC Code Analysis'
  );

  if (!result.success || !result.data) {
    throw new Error(
      result.error?.message ||
      "Failed to analyze DTC codes after multiple attempts. Please try again later."
    );
  }

  return result.data.data || result.data as any;
};

/**
 * Creates a new chat session with Google Search and Google Maps grounding enabled.
 * @param location Optional user location for Maps grounding.
 * @returns A Chat instance.
 */
export const createChatSession = (location: { latitude: number; longitude: number } | null): Chat => {
  return ai.chats.create({
    model: textModel,
    config: {
      systemInstruction: 'You are a helpful automotive assistant. You can answer questions about car repair, maintenance, and help find local automotive services. Be concise and helpful.',
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
      toolConfig: location ? {
        retrievalConfig: {
          latLng: location,
        }
      } : undefined,
    }
  });
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
 * Generates a comprehensive vehicle inspection report summary from inspection state.
 * Enhanced with self-repair capabilities: retry logic, circuit breaker, and fallback.
 * @param inspectionState The collected data from the inspection form.
 * @returns A string containing the formatted report summary.
 */
export const generateReportSummary = async (inspectionState: InspectionState): Promise<string> => {
    // A function to format checklist data into a concise string
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
      ${inspectionState.overallNotes || "No overall notes provided."}

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

    // Primary report generation function
    const generateWithAI = async (): Promise<string> => {
        return await reportGenerationBreaker.execute(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro', // Use a more capable model for complex summarization
                contents: prompt,
            });
            return response.text;
        });
    };

    // Fallback: generate basic report from data
    const generateFallbackReport = async (): Promise<string> => {
        console.log('[Self-Repair] Using fallback report generation');
        let report = '# Vehicle Inspection Summary\n\n';
        report += '⚠️ *Using basic template - AI service temporarily unavailable*\n\n';

        report += '## Vehicle Information\n\n';
        report += `- **Year:** ${inspectionState.vehicle.year}\n`;
        report += `- **Make:** ${inspectionState.vehicle.make}\n`;
        report += `- **Model:** ${inspectionState.vehicle.model}\n`;
        report += `- **VIN:** ${inspectionState.vehicle.vin}\n`;
        report += `- **Odometer:** ${inspectionState.odometer} miles\n\n`;

        report += '## Inspector Notes\n\n';
        report += inspectionState.overallNotes || 'No notes provided.\n\n';

        report += '## Checklist Findings\n\n';
        report += formatChecklist();

        report += '\n\n## Recommendations\n\n';
        report += '- Review all flagged items with a qualified mechanic\n';
        report += '- Address any safety-critical issues immediately\n';
        report += '- Schedule regular maintenance as per manufacturer recommendations\n';

        return report;
    };

    // Execute with retry and fallback
    const result = await executeWithRetry(
        () => executeWithFallback(generateWithAI, generateFallbackReport, 'Report Generation'),
        {
            maxRetries: 3,
            initialDelayMs: 2000,
            maxDelayMs: 8000,
            backoffMultiplier: 2,
            retryableErrors: ['503', '429', '500', 'ETIMEDOUT', 'ECONNRESET']
        },
        'Report Summary Generation'
    );

    if (!result.success || !result.data) {
        throw new Error(
            result.error?.message ||
            "Failed to generate report summary after multiple attempts. Please try again later."
        );
    }

    return result.data.data || result.data as any;
};
