// deepseekService.ts
import { DTCCode, InspectionState } from '../types';

// DeepSeek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekRequest {
  model: string;
  messages: DeepSeekMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Makes a request to DeepSeek API
 */
const makeDeepSeekRequest = async (
  messages: DeepSeekMessage[],
  model: string = 'deepseek-chat',
  temperature: number = 0.7
): Promise<string> => {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY environment variable is not set.');
  }

  const request: DeepSeekRequest = {
    model,
    messages,
    temperature,
    max_tokens: 4096,
  };

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData}`);
    }

    const data: DeepSeekResponse = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw new Error('Failed to get response from DeepSeek API');
  }
};

/**
 * Analyzes a list of Diagnostic Trouble Codes (DTCs) using DeepSeek R1 (reasoning model).
 * @param codes An array of DTC codes.
 * @returns A formatted string with analysis and repair suggestions.
 */
export const analyzeDTCCodes = async (codes: DTCCode[]): Promise<string> => {
  const codeList = codes.map(c => `${c.code}: ${c.description}`).join('\n');

  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: 'You are an expert automotive diagnostic AI with deep knowledge of OBD-II diagnostic trouble codes, automotive systems, and repair procedures.',
    },
    {
      role: 'user',
      content: `
Analyze the following Diagnostic Trouble Codes (DTCs):

${codeList}

For each code, provide:
1. A clear, concise definition of what the code means.
2. Common symptoms associated with the code.
3. A list of the most likely causes, ordered from most probable to least probable.
4. A step-by-step diagnostic and repair plan for a qualified mechanic.

If multiple codes are present that are likely related (e.g., a system lean code with multiple cylinder misfires),
explain the relationship and suggest a prioritized diagnostic approach.

Format the response in clear, easy-to-read Markdown. Use headings for each code and bold text for emphasis.
      `,
    },
  ];

  try {
    return await makeDeepSeekRequest(messages, 'deepseek-reasoner', 0.7);
  } catch (error) {
    console.error('Error analyzing DTC codes with DeepSeek:', error);
    throw new Error('Failed to analyze DTC codes. The AI service may be temporarily unavailable.');
  }
};

/**
 * Generates a comprehensive vehicle inspection report summary from inspection state using DeepSeek.
 * @param inspectionState The collected data from the inspection form.
 * @returns A string containing the formatted report summary.
 */
export const generateReportSummary = async (inspectionState: InspectionState): Promise<string> => {
  // Format checklist data into a concise string
  const formatChecklist = () => {
    let findings = '';
    for (const category in inspectionState.checklist) {
      const items = inspectionState.checklist[category];
      const noteworthyItems = items.filter(
        item => !item.checked || item.notes || item.photos.length > 0 || item.audio
      );
      if (noteworthyItems.length > 0) {
        findings += `\n### ${category}\n`;
        noteworthyItems.forEach(item => {
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

  const messages: DeepSeekMessage[] = [
    {
      role: 'system',
      content: 'You are an AI that generates professional vehicle inspection reports with a focus on accuracy, clarity, and actionable recommendations.',
    },
    {
      role: 'user',
      content: `
Generate a professional vehicle inspection report based on the following data:

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
      `,
    },
  ];

  try {
    return await makeDeepSeekRequest(messages, 'deepseek-reasoner', 0.7);
  } catch (error) {
    console.error('Error generating report summary with DeepSeek:', error);
    throw new Error('Failed to generate report summary. The AI service may be temporarily unavailable.');
  }
};

/**
 * Simple chat completion using DeepSeek (for text-only chat, no grounding)
 * @param userMessage The user's message
 * @param systemInstruction Optional system instruction
 * @returns AI response
 */
export const chatCompletion = async (
  userMessage: string,
  systemInstruction?: string
): Promise<string> => {
  const messages: DeepSeekMessage[] = [];

  if (systemInstruction) {
    messages.push({
      role: 'system',
      content: systemInstruction,
    });
  }

  messages.push({
    role: 'user',
    content: userMessage,
  });

  return await makeDeepSeekRequest(messages, 'deepseek-chat', 0.7);
};

/**
 * Note: DeepSeek does not have native vision capabilities or grounding tools like Google Search/Maps.
 * For vision tasks and grounding, the system should fall back to Gemini.
 * This service focuses on text-based reasoning and analysis where DeepSeek excels.
 */
