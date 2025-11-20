import { DTCCode, InspectionState } from '../types';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

/**
 * Makes a request to DeepSeek API
 * @param messages Array of message objects for the chat
 * @returns The AI response text
 */
const callDeepSeek = async (messages: { role: string; content: string }[]): Promise<string> => {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY environment variable is not set.");
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

/**
 * Analyzes DTC codes using DeepSeek API
 * @param codes An array of DTC codes
 * @returns A formatted string with analysis and repair suggestions
 */
export const analyzeDTCCodesWithDeepSeek = async (codes: DTCCode[]): Promise<string> => {
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
    return await callDeepSeek([
      { role: 'system', content: 'You are an expert automotive diagnostic AI assistant.' },
      { role: 'user', content: prompt }
    ]);
  } catch (error) {
    console.error("Error analyzing DTC codes with DeepSeek:", error);
    throw new Error("Failed to analyze DTC codes with DeepSeek. The AI service may be temporarily unavailable.");
  }
};

/**
 * Generates a vehicle inspection report summary using DeepSeek API
 * @param inspectionState The collected data from the inspection form
 * @returns A string containing the formatted report summary
 */
export const generateReportSummaryWithDeepSeek = async (inspectionState: InspectionState): Promise<string> => {
  // Format checklist data into a concise string
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
    return await callDeepSeek([
      { role: 'system', content: 'You are an expert at generating professional vehicle inspection reports.' },
      { role: 'user', content: prompt }
    ]);
  } catch (error) {
    console.error("Error generating report summary with DeepSeek:", error);
    throw new Error("Failed to generate report summary with DeepSeek. The AI service may be temporarily unavailable.");
  }
};

/**
 * Simple chat completion using DeepSeek API
 * @param userMessage The user's message
 * @param systemInstruction Optional system instruction
 * @returns The AI response
 */
export const chatWithDeepSeek = async (
  userMessage: string,
  systemInstruction: string = 'You are a helpful automotive assistant. You can answer questions about car repair, maintenance, and help find local automotive services. Be concise and helpful.'
): Promise<string> => {
  try {
    return await callDeepSeek([
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage }
    ]);
  } catch (error) {
    console.error("Error in DeepSeek chat:", error);
    throw new Error("Failed to get chat response from DeepSeek. The AI service may be temporarily unavailable.");
  }
};
