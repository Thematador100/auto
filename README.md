<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Sbnc1iHk6C-AHfLWRW4ers0aV7TRKwac

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure API Keys:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Get your Gemini API key from: https://aistudio.google.com/app/apikey
   - Edit `.env.local` and replace `your_gemini_api_key_here` with your actual API key

3. Run the app:
   ```bash
   npm run dev
   ```

## API Configuration

### Required APIs

1. **Google Gemini API** (Required for AI features)
   - **Used for**: DTC code analysis, report generation, chatbot, feature detection
   - **Get API key**: https://aistudio.google.com/app/apikey
   - **Cost**: Free tier available with generous limits
   - **Configuration**: Set `GEMINI_API_KEY` in `.env.local`

2. **NHTSA vPIC API** (No API key required)
   - **Used for**: VIN decoding and vehicle data lookup
   - **Cost**: Free public API
   - **Configuration**: No configuration needed

### Features by API

| Feature | NHTSA API | Gemini API |
|---------|-----------|------------|
| VIN Lookup | ✅ | ❌ |
| Vehicle Data | ✅ | ❌ |
| DTC Analysis | ❌ | ✅ |
| Report Generation | ❌ | ✅ |
| AI Chatbot | ❌ | ✅ |
| Feature Detection | ❌ | ✅ |

## Troubleshooting

If you're experiencing API issues (especially with DTC analysis or other AI features not working), see the **[API Setup and Troubleshooting Guide](API_SETUP.md)** for detailed instructions.

**Common issues:**
- ❌ DTC analysis not working → Need to set `GEMINI_API_KEY` in `.env.local`
- ✅ VIN lookup working → Uses free NHTSA API (no key required)
- ❌ "API_KEY environment variable is not set" error → See [API_SETUP.md](API_SETUP.md)
