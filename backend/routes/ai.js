import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { generateText, analyzeImage } from '../config/aiProviders.js';

const router = express.Router();

/**
 * POST /api/analyze-dtc
 * Analyze Diagnostic Trouble Codes using AI
 * Requires authentication
 */
router.post('/analyze-dtc', authenticateToken, async (req, res) => {
  try {
    const { codes } = req.body;

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({ error: 'Codes array is required' });
    }

    console.log(`[AI] Analyzing ${codes.length} DTC codes for user ${req.user.email}`);

    // Format codes for AI
    const codesList = codes.map(c => `${c.code}: ${c.description || 'No description'}`).join('\n');

    const prompt = `You are an expert automotive diagnostic technician. Analyze these OBD-II trouble codes and provide:

1. A summary of what these codes indicate
2. The likely root causes
3. Recommended repair actions (prioritized)
4. Estimated severity (critical/moderate/minor)
5. Whether these issues are related

Diagnostic Trouble Codes:
${codesList}

Provide a professional analysis that a vehicle inspector can share with their client.`;

    const analysis = await generateText(prompt, { temperature: 0.5, maxTokens: 2000 });

    res.json({
      analysis,
      codesAnalyzed: codes.length,
      provider: 'AI (Gemini/DeepSeek/OpenAI)'
    });
  } catch (error) {
    console.error('[AI] DTC analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze DTC codes', details: error.message });
  }
});

/**
 * POST /api/generate-report
 * Generate comprehensive vehicle inspection report using AI
 * Requires authentication
 */
router.post('/generate-report', authenticateToken, async (req, res) => {
  try {
    const { inspectionState } = req.body;

    if (!inspectionState) {
      return res.status(400).json({ error: 'Inspection state data is required' });
    }

    console.log(`[AI] Generating inspection report for user ${req.user.email}`);

    const { vehicleInfo, checklist, odometer, overallNotes } = inspectionState;

    // Build structured prompt
    let prompt = `You are a professional automotive inspector. Generate a comprehensive vehicle inspection report based on the following data:

**Vehicle Information:**
- Year: ${vehicleInfo?.year || 'Unknown'}
- Make: ${vehicleInfo?.make || 'Unknown'}
- Model: ${vehicleInfo?.model || 'Unknown'}
- VIN: ${vehicleInfo?.vin || 'Not provided'}
- Type: ${vehicleInfo?.vehicleType || 'Standard'}
- Odometer: ${odometer || 'Not recorded'} miles

**Inspection Findings:**
`;

    // Process checklist data
    if (checklist && typeof checklist === 'object') {
      for (const [category, items] of Object.entries(checklist)) {
        if (Array.isArray(items)) {
          const failedItems = items.filter(item => item.status === 'fail' || item.notes);
          if (failedItems.length > 0) {
            prompt += `\n**${category}:**\n`;
            failedItems.forEach(item => {
              prompt += `- ${item.name}: ${item.status === 'fail' ? 'FAILED' : 'PASS'}`;
              if (item.notes) prompt += ` - ${item.notes}`;
              prompt += '\n';
            });
          }
        }
      }
    }

    if (overallNotes) {
      prompt += `\n**Inspector's Overall Notes:**\n${overallNotes}\n`;
    }

    prompt += `\n**Report Requirements:**
1. Executive Summary (2-3 sentences)
2. Critical Issues (immediate attention required)
3. Recommended Repairs (near-term, within 6 months)
4. Future Maintenance (cosmetic or long-term)
5. Overall Vehicle Condition Assessment (Excellent/Good/Fair/Poor)
6. Estimated repair priorities and general cost categories

Format the report professionally for the inspector to share with their client.`;

    const report = await generateText(prompt, { temperature: 0.6, maxTokens: 3000 });

    res.json({
      summary: report,
      vehicleInfo,
      odometer,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[AI] Report generation error:', error);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
});

/**
 * POST /api/detect-features
 * Detect vehicle features from an image using AI vision
 * Requires authentication
 */
router.post('/detect-features', authenticateToken, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    console.log(`[AI] Detecting vehicle features for user ${req.user.email}`);

    const prompt = `Analyze this vehicle image and identify all visible features, components, and potential issues. List:
1. Vehicle type and body style
2. Visible exterior features (wheels, lights, trim, etc.)
3. Any visible damage or wear
4. Notable features or modifications
5. Approximate vehicle condition

Provide a concise, bulleted list of observations.`;

    const analysis = await analyzeImage(image, prompt);

    // Parse response into array of features
    const features = analysis
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-*•]\s*/, '').trim());

    res.json({
      features,
      rawAnalysis: analysis
    });
  } catch (error) {
    console.error('[AI] Feature detection error:', error);
    res.status(500).json({ error: 'Failed to detect features', details: error.message });
  }
});

export default router;
