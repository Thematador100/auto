import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { aiRequestLogs } from '../db/schema.js';
import { z } from 'zod';

export const aiRouter = Router();

// All routes require authentication
aiRouter.use(authenticateToken);

const analyzeDTCSchema = z.object({
  codes: z.array(z.object({
    code: z.string(),
    description: z.string().optional(),
  })),
  provider: z.enum(['gemini', 'deepseek']).optional(),
});

const generateReportSchema = z.object({
  inspectionState: z.any(),
  provider: z.enum(['gemini', 'deepseek']).optional(),
});

// Analyze DTC codes
aiRouter.post('/analyze-dtc', async (req: AuthRequest, res, next) => {
  try {
    const { codes, provider = 'deepseek' } = analyzeDTCSchema.parse(req.body);
    const userId = req.userId!;

    // Import AI service dynamically (this assumes frontend AI services are reusable)
    // For now, we'll proxy the request securely

    const apiKey = provider === 'gemini'
      ? process.env.GEMINI_API_KEY
      : process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: `${provider} API key not configured` });
    }

    // Call the appropriate AI service
    let result;
    if (provider === 'deepseek') {
      const codeList = codes.map(c => c.code).join(', ');
      const prompt = `
You are an expert automotive diagnostic AI.
Analyze the following Diagnostic Trouble Codes (DTCs): ${codeList}.

For each code, provide:
1. A clear, concise definition of what the code means.
2. Common symptoms associated with the code.
3. A list of the most likely causes, ordered from most probable to least probable.
4. A step-by-step diagnostic and repair plan for a qualified mechanic.

If multiple codes are present that are likely related, explain the relationship and suggest a prioritized diagnostic approach.

Format the response in clear, easy-to-read Markdown. Use headings for each code and bold text for emphasis.
      `;

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      result = data.choices[0]?.message?.content || '';

      // Log the request
      await db.insert(aiRequestLogs).values({
        userId,
        provider,
        requestType: 'dtc_analysis',
        tokensUsed: data.usage?.total_tokens,
      });
    } else {
      // Gemini implementation
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const codeList = codes.map(c => c.code).join(', ');
      const prompt = `
You are an expert automotive diagnostic AI.
Analyze the following Diagnostic Trouble Codes (DTCs): ${codeList}.

For each code, provide:
1. A clear, concise definition of what the code means.
2. Common symptoms associated with the code.
3. A list of the most likely causes, ordered from most probable to least probable.
4. A step-by-step diagnostic and repair plan for a qualified mechanic.

Format the response in clear, easy-to-read Markdown. Use headings for each code and bold text for emphasis.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      result = response.text;

      // Log the request
      await db.insert(aiRequestLogs).values({
        userId,
        provider,
        requestType: 'dtc_analysis',
      });
    }

    res.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    next(error);
  }
});

// Generate report summary
aiRouter.post('/generate-report', async (req: AuthRequest, res, next) => {
  try {
    const { inspectionState, provider = 'deepseek' } = generateReportSchema.parse(req.body);
    const userId = req.userId!;

    const apiKey = provider === 'gemini'
      ? process.env.GEMINI_API_KEY
      : process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: `${provider} API key not configured` });
    }

    // Format checklist findings
    const formatChecklist = () => {
      let findings = '';
      for (const category in inspectionState.checklist) {
        const items = inspectionState.checklist[category];
        const noteworthyItems = items.filter((item: any) =>
          !item.checked || item.notes || item.photos.length > 0 || item.audio
        );
        if (noteworthyItems.length > 0) {
          findings += `\n### ${category}\n`;
          noteworthyItems.forEach((item: any) => {
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

**Checklist Findings:**
${formatChecklist()}

**Instructions:**
Generate a report with the following structure in Markdown format:

## Vehicle Inspection Summary

### 1. Overall Condition Assessment
Provide a one-paragraph summary of the vehicle's overall condition.

### 2. Key Findings
Create a bulleted list of the most important issues or noteworthy observations.

### 3. Recommendations
Create a prioritized, bulleted list of recommended actions.
Categorize them as "Immediate Attention Required," "Recommended Maintenance," and "Future Considerations."
    `;

    let result;
    if (provider === 'deepseek') {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      result = data.choices[0]?.message?.content || '';

      await db.insert(aiRequestLogs).values({
        userId,
        provider,
        requestType: 'report_summary',
        tokensUsed: data.usage?.total_tokens,
      });
    } else {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      result = response.text;

      await db.insert(aiRequestLogs).values({
        userId,
        provider,
        requestType: 'report_summary',
      });
    }

    res.json({ result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    next(error);
  }
});
