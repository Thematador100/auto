// services/featureDetector.ts
// Note: This service requires Gemini API for vision/image analysis capabilities
// Vision features are not available in DeepSeek fallback yet
import { GoogleGenAI } from '@google/genai';
import { aiProvider } from './aiProviderService';

const geminiClient = aiProvider.getGeminiClient();

if (!geminiClient) {
  console.warn('[FeatureDetector] Gemini API not configured. Vision features will not work.');
}

/**
 * A placeholder function to simulate detecting vehicle features from an image.
 * In a real application, this would use a vision model to identify things like
 * sunroof, roof racks, spoilers, etc.
 * @param imageBase64 The base64 encoded image data.
 * @returns A promise that resolves to an array of detected feature strings.
 */
export const detectVehicleFeaturesFromImage = async (imageBase64: string): Promise<string[]> => {
  console.log('[FeatureDetector] Analyzing image for features...');
  // A real implementation would call a vision model.
  // For example, using Gemini:
  
  // FIX: Use a current model like gemini-2.5-flash for vision tasks.
  const model = 'gemini-2.5-flash';
  // FIX: Updated prompt to be more specific for better parsing.
  const prompt = "List the key exterior features visible on this vehicle (e.g., 'sunroof', 'spoiler', 'roof rack', 'alloy wheels'). Return only a comma-separated list.";
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: imageBase64,
    },
  };
  
  try {
    if (!geminiClient) {
      console.error('[FeatureDetector] Gemini API required for vision analysis');
      return ['Vision analysis requires Gemini API'];
    }

    // FIX: Updated to use `geminiClient.models.generateContent` with the correct payload structure.
    const response = await geminiClient.models.generateContent({
        model,
        contents: { parts: [ {text: prompt}, imagePart ]}
    });
    // FIX: Access the response text directly.
    const text = response.text;
    if (!text) return [];
    return text.split(',').map(feature => feature.trim()).filter(Boolean);
  } catch (error) {
    console.error('Error detecting vehicle features:', error);
    return ['AI analysis failed'];
  }
};
