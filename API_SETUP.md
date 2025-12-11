# API Setup and Troubleshooting Guide

## Quick Start

If you're seeing API errors, follow these steps:

### 1. Set Up Your Gemini API Key

The app requires a Google Gemini API key for AI features. Here's how to set it up:

1. **Get your API key**:
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

2. **Configure the app**:
   ```bash
   # Open .env.local file
   nano .env.local

   # Replace 'your_gemini_api_key_here' with your actual API key
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Restart the dev server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

### 2. Verify Setup

Once configured, test these features:

- ✅ **VIN Lookup**: Should work without API key (uses NHTSA public API)
- ✅ **DTC Analysis**: Requires Gemini API key
- ✅ **Report Generation**: Requires Gemini API key
- ✅ **AI Chatbot**: Requires Gemini API key
- ✅ **Feature Detection**: Requires Gemini API key

## Troubleshooting

### Problem: "API_KEY environment variable is not set"

**Cause**: The `.env.local` file is missing or the `GEMINI_API_KEY` is not set.

**Solution**:
1. Check if `.env.local` exists:
   ```bash
   ls -la .env.local
   ```
2. If it doesn't exist, create it from the template:
   ```bash
   cp .env.example .env.local
   ```
3. Edit `.env.local` and add your actual API key
4. Restart the dev server

### Problem: "Failed to analyze DTC codes"

**Cause**: Either the API key is invalid, not set, or you've exceeded your API quota.

**Solution**:
1. Verify your API key is correct in `.env.local`
2. Check your API usage at: https://aistudio.google.com/app/apikey
3. Make sure you're using a valid key (should start with `AIza`)
4. If you're over quota, wait for it to reset or upgrade your plan

### Problem: VIN lookup works but DTC analysis doesn't

**Cause**: VIN lookup uses the free NHTSA API (no key needed), but DTC analysis requires Gemini API.

**Solution**: Follow the Gemini API setup steps above.

### Problem: API was working before but now it's not

**Cause**: The `.env.local` file may have been deleted or not committed to git (it's in `.gitignore`).

**Solution**:
1. Check if `.env.local` exists
2. If not, recreate it with your API key
3. Note: `.env.local` is intentionally not tracked by git for security reasons

## API Cost and Limits

### Google Gemini API
- **Free Tier**: 15 requests per minute, 1 million requests per day
- **Cost**: Free tier is very generous for development and testing
- **Models Used**:
  - `gemini-2.5-flash`: DTC analysis, chatbot, feature detection
  - `gemini-2.5-pro`: Report generation (higher quality)

### NHTSA vPIC API
- **Cost**: Completely free
- **Limits**: None specified
- **Used For**: VIN decoding only

## Security Best Practices

1. **Never commit `.env.local`** to git (it's already in `.gitignore`)
2. **Never share your API keys** publicly
3. **Rotate your keys** if you suspect they've been compromised
4. **Use separate keys** for development and production

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | None | Google Gemini API key for AI features |

## Need Help?

If you're still having issues:
1. Check the browser console for specific error messages
2. Verify your API key is valid at https://aistudio.google.com/app/apikey
3. Make sure you restarted the dev server after changing `.env.local`
4. Check that `.env.local` is in the project root directory (same level as `package.json`)
