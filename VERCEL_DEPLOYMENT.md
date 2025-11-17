# Vercel Deployment Guide

This guide will help you deploy your AI Auto Pro app to Vercel and fix the 404 error.

## Quick Fix for 404 Error

The 404 error happens because:
1. Environment variables aren't set in Vercel
2. The app build might have failed
3. Vercel configuration was missing (now fixed!)

## Step-by-Step Deployment

### 1. Push Latest Changes

```bash
git add .
git commit -m "Add Vercel configuration"
git push
```

### 2. Go to Vercel Dashboard

1. Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your project: **auto-seven-sigma**
3. Click on it

### 3. Add Environment Variables

This is the **MOST IMPORTANT** step! Without these, the app won't work.

#### In Vercel Dashboard:
1. Click on your project **auto-seven-sigma**
2. Go to **Settings** tab (top navigation)
3. Click **Environment Variables** (left sidebar)
4. Add each variable below:

#### Required Variables:

**AI Provider Configuration:**
```
Name: AI_PROVIDER
Value: gemini
```
(or `openai` or `deepseek` - choose one)

**For Gemini (recommended):**
```
Name: GEMINI_API_KEY
Value: your_actual_gemini_api_key
```

```
Name: API_KEY
Value: your_actual_gemini_api_key
```

**For OpenAI (optional):**
```
Name: OPENAI_API_KEY
Value: your_actual_openai_api_key
```

**For DeepSeek (optional):**
```
Name: DEEPSEEK_API_KEY
Value: your_actual_deepseek_api_key
```

**Supabase Database:**
```
Name: SUPABASE_URL
Value: https://your-project-id.supabase.co
```

```
Name: SUPABASE_ANON_KEY
Value: your_supabase_anon_key
```

#### How to Add Each Variable:
1. Click **Add New** button
2. Enter the **Name** (e.g., `GEMINI_API_KEY`)
3. Enter the **Value** (your actual API key)
4. Select **All** environments (Production, Preview, Development)
5. Click **Save**
6. Repeat for each variable

### 4. Redeploy the App

After adding all environment variables:

**Option A: Trigger Redeploy from Dashboard**
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. Click **Redeploy** again to confirm

**Option B: Push a New Commit**
```bash
# Make a small change and push
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

### 5. Wait for Build to Complete

1. Go to **Deployments** tab in Vercel
2. Watch the build progress (usually takes 1-2 minutes)
3. Look for **"Building"** → **"Ready"**
4. If it says **"Error"**, click on it to see build logs

### 6. Test Your App

Once deployment shows **"Ready"**:
1. Visit: https://auto-seven-sigma.vercel.app
2. The app should now load!

## Troubleshooting

### Still Getting 404?

**Check Build Logs:**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Build Logs**
4. Look for errors

**Common Issues:**

#### "Environment variable is not set"
- You forgot to add environment variables in Vercel
- Go back to Settings → Environment Variables
- Make sure all required variables are added

#### "Build failed"
- Check build logs for the exact error
- Most likely missing environment variables
- Or TypeScript/build errors

#### "Cannot find module"
- Run locally first to ensure no errors:
  ```bash
  npm install
  npm run build
  ```
- If it works locally, redeploy to Vercel

### Verify Environment Variables

In Vercel Dashboard:
1. Settings → Environment Variables
2. You should see:
   - `AI_PROVIDER`
   - `GEMINI_API_KEY` (or your chosen provider)
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `API_KEY` (for backward compatibility)

### Check Build Settings

In Vercel Dashboard → Settings → General:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

These should be set automatically by `vercel.json`, but verify!

## Getting Your API Keys

If you don't have API keys yet:

### Gemini (Free - Recommended)
1. Go to: https://ai.google.dev/
2. Click "Get API Key"
3. Create project and copy key
4. Add to Vercel as `GEMINI_API_KEY`

### Supabase (Free Tier)
1. Go to: https://supabase.com
2. Create new project
3. Go to Settings → API
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_ANON_KEY`
5. Run the SQL from `supabase-schema.sql` in SQL Editor

### OpenAI (Paid)
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy immediately (you can't see it again!)
4. Add to Vercel as `OPENAI_API_KEY`

### DeepSeek (Paid)
1. Go to: https://platform.deepseek.com/
2. Create API key
3. Add to Vercel as `DEEPSEEK_API_KEY`

## Quick Checklist

Before the app works, you need:

- [ ] Environment variables added to Vercel
- [ ] At least one AI provider API key configured
- [ ] Supabase project created and configured
- [ ] Supabase URL and key added to Vercel
- [ ] App redeployed after adding env variables
- [ ] Build completed successfully (check Deployments tab)

## Test Locally First

Before deploying, always test locally:

```bash
# Install dependencies
npm install

# Add your keys to .env.local
# (Copy from .env.example)

# Test build
npm run build

# Test the built app
npm run preview
```

If it works locally, it will work on Vercel (with correct env variables).

## Need Help?

1. **Check Vercel build logs** - Most errors show here
2. **Check browser console** - For runtime errors
3. **Verify all env variables are set** - Common mistake
4. **Make sure you redeployed** - After adding env variables

## Expected Result

After following these steps, visiting https://auto-seven-sigma.vercel.app should show:
- ✅ The landing page loads
- ✅ No console errors
- ✅ AI features work (after adding API key)
- ✅ Database saves reports (after Supabase setup)

---

**Still stuck?** Drop the Vercel build logs or browser console errors and I can help debug!
