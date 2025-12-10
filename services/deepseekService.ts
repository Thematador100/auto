import { DTCCode } from '../types';

// Guard against missing API key
if (!process.env.DEEPSEEK_API_KEY) {
  console.warn("DEEPSEEK_API_KEY environment variable is not set. DeepSeek features will be unavailable.");
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

/**
 * Makes a request to the DeepSeek API
 * @param messages Array of chat messages
 * @returns The API response text
 */
const callDeepSeekAPI = async (messages: { role: string; content: string }[]): Promise<string> => {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DeepSeek API key is not configured.");
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

/**
 * Analyzes DTC codes using DeepSeek (cost-effective alternative)
 * @param codes An array of DTC codes
 * @returns A formatted string with analysis and repair suggestions
 */
export const analyzeDTCCodesWithDeepSeek = async (codes: DTCCode[]): Promise<string> => {
  const codeList = codes.map(c => c.code).join(', ');
  const prompt = `
You are an expert automotive diagnostic AI.
Analyze the following Diagnostic Trouble Codes (DTCs): ${codeList}.

For each code, provide:
1. A clear, concise definition of what the code means.
2. Common symptoms associated with the code.
3. A list of the most likely causes, ordered from most probable to least probable.
4. A step-by-step diagnostic and repair plan for a qualified mechanic.

If multiple codes are present that are likely related (e.g., a system lean code with multiple cylinder misfires),
explain the relationship and suggest a prioritized diagnostic approach.

Format the response in clear, easy-to-read Markdown. Use headings for each code and bold text for emphasis.
  `;

  try {
    const messages = [{ role: 'user', content: prompt }];
    return await callDeepSeekAPI(messages);
  } catch (error) {
    console.error("Error analyzing DTC codes with DeepSeek:", error);
    throw new Error("Failed to analyze DTC codes. The AI service may be temporarily unavailable.");
  }
};

/**
 * Generates a simple report summary using DeepSeek (more cost-effective)
 * @param vehicleInfo Vehicle information
 * @param checklistFindings Formatted checklist findings
 * @param overallNotes Inspector's notes
 * @returns A string containing the formatted report summary
 */
export const generateSimpleReportSummary = async (
  vehicleInfo: { year: string; make: string; model: string; vin: string; odometer: string },
  checklistFindings: string,
  overallNotes: string
): Promise<string> => {
  const prompt = `
You are an AI that generates professional vehicle inspection reports.
Based on the following data, create a comprehensive report summary.

**Vehicle Information:**
- Year: ${vehicleInfo.year}
- Make: ${vehicleInfo.make}
- Model: ${vehicleInfo.model}
- VIN: ${vehicleInfo.vin}
- Odometer: ${vehicleInfo.odometer} miles

**Inspector's Overall Notes:**
${overallNotes || "No overall notes provided."}

**Checklist Findings (only items with issues or notes are listed):**
${checklistFindings}

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
    const messages = [{ role: 'user', content: prompt }];
    return await callDeepSeekAPI(messages);
  } catch (error) {
    console.error("Error generating report summary with DeepSeek:", error);
    throw new Error("Failed to generate report summary. The AI service may be temporarily unavailable.");
  }
};
