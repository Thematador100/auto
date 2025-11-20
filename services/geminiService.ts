import { GoogleGenAI, GenerateContentResponse, Chat, GroundingChunk } from '@google/genai';
import { DTCCode, GroundingSource, InspectionState } from '../types';
import { analyzeDTCCodesWithDeepSeek, generateReportSummaryWithDeepSeek } from './deepseekService';

// Guard against missing API key
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = 'gemini-2.5-flash';

/**
 * Analyzes a list of Diagnostic Trouble Codes (DTCs) and provides a detailed explanation.
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

  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing DTC codes with Gemini, trying DeepSeek fallback:", error);

    // Try DeepSeek as fallback
    try {
      console.log("Attempting to use DeepSeek API as fallback...");
      return await analyzeDTCCodesWithDeepSeek(codes);
    } catch (fallbackError) {
      console.error("DeepSeek fallback also failed:", fallbackError);
      throw new Error("Failed to analyze DTC codes. Both primary and backup AI services are temporarily unavailable.");
    }
  }
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

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Use a more capable model for complex summarization
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating report summary with Gemini, trying DeepSeek fallback:", error);

        // Try DeepSeek as fallback
        try {
            console.log("Attempting to use DeepSeek API as fallback...");
            return await generateReportSummaryWithDeepSeek(inspectionState);
        } catch (fallbackError) {
            console.error("DeepSeek fallback also failed:", fallbackError);
            throw new Error("Failed to generate report summary. Both primary and backup AI services are temporarily unavailable.");
        }
    }
};
