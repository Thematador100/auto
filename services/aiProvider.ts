import { GoogleGenAI, GenerateContentResponse, Chat, GroundingChunk } from '@google/genai';
import OpenAI from 'openai';
import { DTCCode, GroundingSource, InspectionState } from '../types';

// AI Provider Types
export type AIProviderType = 'openai' | 'deepseek' | 'gemini';

// Chat session interface for different providers
export interface ChatSession {
  sendMessage: (message: string) => Promise<{ text: string; sources?: GroundingSource[] }>;
}

// Base AI Provider Interface
export interface AIProvider {
  analyzeDTCCodes(codes: DTCCode[]): Promise<string>;
  createChatSession(location: { latitude: number; longitude: number } | null): ChatSession;
  generateReportSummary(inspectionState: InspectionState): Promise<string>;
}

// ============================================
// GEMINI PROVIDER IMPLEMENTATION
// ============================================
class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI;
  private textModel = 'gemini-2.5-flash';

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeDTCCodes(codes: DTCCode[]): Promise<string> {
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
      const response = await this.ai.models.generateContent({
        model: this.textModel,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error analyzing DTC codes:", error);
      throw new Error("Failed to analyze DTC codes. The AI service may be temporarily unavailable.");
    }
  }

  createChatSession(location: { latitude: number; longitude: number } | null): ChatSession {
    const chat = this.ai.chats.create({
      model: this.textModel,
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

    return {
      sendMessage: async (message: string) => {
        const response = await chat.sendMessage(message);
        const sources = this.extractGroundingSources(response);
        return { text: response.text, sources };
      }
    };
  }

  async generateReportSummary(inspectionState: InspectionState): Promise<string> {
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
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating report summary:", error);
      throw new Error("Failed to generate report summary. The AI service may be temporarily unavailable.");
    }
  }

  private extractGroundingSources(response: GenerateContentResponse): GroundingSource[] {
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
  }
}

// ============================================
// OPENAI PROVIDER IMPLEMENTATION
// ============================================
class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model = 'gpt-4o'; // Using GPT-4 Optimized

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async analyzeDTCCodes(codes: DTCCode[]): Promise<string> {
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
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
      });
      return completion.choices[0].message.content || 'No response generated.';
    } catch (error) {
      console.error("Error analyzing DTC codes:", error);
      throw new Error("Failed to analyze DTC codes. The AI service may be temporarily unavailable.");
    }
  }

  createChatSession(location: { latitude: number; longitude: number } | null): ChatSession {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are a helpful automotive assistant. You can answer questions about car repair, maintenance, and help find local automotive services. Be concise and helpful.'
      }
    ];

    return {
      sendMessage: async (message: string) => {
        messages.push({ role: 'user', content: message });

        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages,
        });

        const responseText = completion.choices[0].message.content || '';
        messages.push({ role: 'assistant', content: responseText });

        return { text: responseText };
      }
    };
  }

  async generateReportSummary(inspectionState: InspectionState): Promise<string> {
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
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
      });
      return completion.choices[0].message.content || 'No response generated.';
    } catch (error) {
      console.error("Error generating report summary:", error);
      throw new Error("Failed to generate report summary. The AI service may be temporarily unavailable.");
    }
  }
}

// ============================================
// DEEPSEEK PROVIDER IMPLEMENTATION
// ============================================
class DeepSeekProvider implements AIProvider {
  private client: OpenAI;
  private model = 'deepseek-chat'; // DeepSeek's chat model

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com/v1',
      dangerouslyAllowBrowser: true
    });
  }

  async analyzeDTCCodes(codes: DTCCode[]): Promise<string> {
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
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
      });
      return completion.choices[0].message.content || 'No response generated.';
    } catch (error) {
      console.error("Error analyzing DTC codes:", error);
      throw new Error("Failed to analyze DTC codes. The AI service may be temporarily unavailable.");
    }
  }

  createChatSession(location: { latitude: number; longitude: number } | null): ChatSession {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are a helpful automotive assistant. You can answer questions about car repair, maintenance, and help find local automotive services. Be concise and helpful.'
      }
    ];

    return {
      sendMessage: async (message: string) => {
        messages.push({ role: 'user', content: message });

        const completion = await this.client.chat.completions.create({
          model: this.model,
          messages,
        });

        const responseText = completion.choices[0].message.content || '';
        messages.push({ role: 'assistant', content: responseText });

        return { text: responseText };
      }
    };
  }

  async generateReportSummary(inspectionState: InspectionState): Promise<string> {
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
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
      });
      return completion.choices[0].message.content || 'No response generated.';
    } catch (error) {
      console.error("Error generating report summary:", error);
      throw new Error("Failed to generate report summary. The AI service may be temporarily unavailable.");
    }
  }
}

// ============================================
// AI PROVIDER FACTORY
// ============================================
function createAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase() as AIProviderType;

  switch (provider) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable is not set.");
      }
      return new OpenAIProvider(process.env.OPENAI_API_KEY);

    case 'deepseek':
      if (!process.env.DEEPSEEK_API_KEY) {
        throw new Error("DEEPSEEK_API_KEY environment variable is not set.");
      }
      return new DeepSeekProvider(process.env.DEEPSEEK_API_KEY);

    case 'gemini':
    default:
      if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
        throw new Error("GEMINI_API_KEY or API_KEY environment variable is not set.");
      }
      return new GeminiProvider(process.env.GEMINI_API_KEY || process.env.API_KEY!);
  }
}

// Export singleton instance
export const aiProvider = createAIProvider();

// Export for backward compatibility with existing code
export const analyzeDTCCodes = (codes: DTCCode[]) => aiProvider.analyzeDTCCodes(codes);
export const createChatSession = (location: { latitude: number; longitude: number } | null) =>
  aiProvider.createChatSession(location);
export const generateReportSummary = (inspectionState: InspectionState) =>
  aiProvider.generateReportSummary(inspectionState);
