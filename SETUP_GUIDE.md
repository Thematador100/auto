# AutoPro Inspector - Production Setup Guide

Welcome to AutoPro Inspector! This guide will help you set up the application for production deployment.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Stripe Setup](#stripe-setup)
4. [Google Gemini AI Setup](#google-gemini-ai-setup)
5. [Environment Configuration](#environment-configuration)
6. [Local Development](#local-development)
7. [Production Deployment](#production-deployment)
8. [Features Overview](#features-overview)

---

## 🔧 Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier available)
- A Stripe account (test mode is free)
- A Google AI Studio account for Gemini API
- Basic knowledge of React and TypeScript

---

## 🗄️ Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: AutoPro Inspector (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free tier is sufficient to start

### Step 2: Run Database Migration

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the entire contents of `supabase-migrations.sql` from this project
5. Paste it into the SQL editor
6. Click "Run" to execute the migration

This will create:
- `users` table for user profiles and subscriptions
- `reports` table for inspection reports
- `transactions` table for payment records
- Row Level Security (RLS) policies
- Automatic triggers for user creation

### Step 3: Configure Authentication

1. In Supabase dashboard, go to "Authentication" → "Providers"
2. Enable **Email** provider (enabled by default)
3. **(Optional)** Enable OAuth providers:
   - **Google**:
     - Go to [Google Cloud Console](https://console.cloud.google.com/)
     - Create OAuth 2.0 credentials
     - Add redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`
     - Copy Client ID and Client Secret to Supabase
   - **GitHub**:
     - Go to GitHub Settings → Developer settings → OAuth Apps
     - Create new OAuth App
     - Add callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
     - Copy Client ID and Client Secret to Supabase

### Step 4: Get Supabase Credentials

1. Go to "Project Settings" → "API"
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## 💳 Stripe Setup

### Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up and complete account verification
3. Start in **Test Mode** for development

### Step 2: Create Products and Prices

#### Subscription Products:

1. Go to **Products** in Stripe Dashboard
2. Click **"Add Product"**
3. Create **Pro Plan (Monthly)**:
   - Name: "AutoPro Pro Plan (Monthly)"
   - Description: "Unlimited vehicle inspections with AI-powered reports"
   - Price: $49.99 USD
   - Billing period: Monthly
   - Copy the **Price ID** (starts with `price_...`)

4. Create **Pro Plan (Yearly)**:
   - Name: "AutoPro Pro Plan (Yearly)"
   - Description: "Unlimited vehicle inspections - Save $100/year"
   - Price: $499.99 USD
   - Billing period: Yearly
   - Copy the **Price ID**

#### Per-Report Products:

Create one-time payment products for each report type:

1. **Standard Car/SUV Report** - $19.99
2. **Electric Vehicle Report** - $24.99
3. **Commercial Truck Report** - $39.99
4. **RV Report** - $34.99
5. **Classic/Collector Report** - $29.99
6. **Motorcycle Report** - $14.99

For each, copy the **Price ID**.

### Step 3: Set Up Webhooks (Important for Production)

1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your backend URL: `https://your-backend.com/api/stripe-webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook signing secret**

### Step 4: Get API Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_test_...` in test mode)
   - **Secret key** (starts with `sk_test_...` in test mode)

---

## 🤖 Google Gemini AI Setup

### Step 1: Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key (starts with `AIza...`)

### Step 2: Configure API Quotas (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the "Generative Language API"
3. Set quotas based on expected usage
4. Free tier includes:
   - 60 requests per minute
   - 1,500 requests per day

---

## ⚙️ Environment Configuration

### Step 1: Create .env.local File

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials:
   ```env
   # Google Gemini AI
   VITE_GEMINI_API_KEY=AIza_your_actual_key_here

   # Supabase
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ_your_actual_key_here

   # Stripe
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
   VITE_STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
   VITE_STRIPE_REPORT_STANDARD_PRICE_ID=price_xxxxx
   VITE_STRIPE_REPORT_EV_PRICE_ID=price_xxxxx
   VITE_STRIPE_REPORT_COMMERCIAL_PRICE_ID=price_xxxxx
   VITE_STRIPE_REPORT_RV_PRICE_ID=price_xxxxx
   VITE_STRIPE_REPORT_CLASSIC_PRICE_ID=price_xxxxx
   VITE_STRIPE_REPORT_MOTORCYCLE_PRICE_ID=price_xxxxx

   # Feature Flags
   VITE_ENABLE_OFFLINE_MODE=true
   VITE_ENABLE_MOCK_PAYMENTS=false  # IMPORTANT: Set to false in production!
   ```

### Security Notes:
- ⚠️ **NEVER** commit `.env.local` to version control
- ⚠️ `.env.local` is already in `.gitignore`
- ⚠️ Only use test mode keys during development
- ⚠️ Rotate keys if accidentally exposed

---

## 💻 Local Development

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 3: Test Authentication

1. Create a test account using the sign-up form
2. Check Supabase dashboard to verify user was created
3. Test OAuth providers if configured

### Step 4: Test Payments (Development Mode)

During development, you can use mock payments:
- Set `VITE_ENABLE_MOCK_PAYMENTS=true` in `.env.local`
- Payments will be simulated without hitting Stripe

For real Stripe testing:
- Set `VITE_ENABLE_MOCK_PAYMENTS=false`
- Use Stripe test cards: `4242 4242 4242 4242` (Visa)

---

## 🚀 Production Deployment

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Switch Stripe keys to **production mode** (`pk_live_...` and `sk_live_...`)

### Option 2: Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build the app:
   ```bash
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

4. Add environment variables in Netlify dashboard

### Option 3: Self-Hosted (Docker)

1. Create `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build
   EXPOSE 5173
   CMD ["npm", "run", "preview"]
   ```

2. Build and run:
   ```bash
   docker build -t autopro-inspector .
   docker run -p 5173:5173 --env-file .env.local autopro-inspector
   ```

### Production Checklist:

- [ ] Switch all API keys to production mode
- [ ] Set `VITE_ENABLE_MOCK_PAYMENTS=false`
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure domain name
- [ ] Set up Stripe webhooks with production URL
- [ ] Test OAuth callback URLs
- [ ] Enable Supabase production mode
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure CDN for static assets
- [ ] Test all payment flows end-to-end
- [ ] Review Supabase RLS policies
- [ ] Set up backup strategy for database

---

## ✨ Features Overview

### For Soccer Moms (Simple & Intuitive):
- ✅ **Easy VIN scanning** - Just enter the VIN number
- ✅ **Guided checklists** - Step-by-step inspection process
- ✅ **Photo capture** - Take photos of issues with your phone
- ✅ **Voice notes** - Record observations hands-free
- ✅ **Plain English reports** - AI explains technical issues simply
- ✅ **7-day free trial** - Try before you buy

### For Consumer Reports (Professional & Powerful):
- 🔧 **6 vehicle types** - Standard, EV, Commercial, RV, Classic, Motorcycle
- 🔧 **OBD-II diagnostics** - Professional code analysis
- 🔧 **AI chat assistant** - Technical deep-dives
- 🔧 **Comprehensive data** - History, recalls, theft/salvage checks
- 🔧 **Export capabilities** - PDF reports with all data
- 🔧 **Cloud storage** - Access reports from anywhere
- 🔧 **Batch operations** - Process multiple vehicles
- 🔧 **API access** (coming soon) - Integration capabilities

---

## 🆘 Support & Resources

### Documentation:
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Google Gemini AI Docs](https://ai.google.dev/docs)
- [React + Vite Docs](https://vitejs.dev/guide/)

### Troubleshooting:

**"Supabase credentials not configured"**
- Check that `.env.local` exists and has correct values
- Restart dev server after changing environment variables

**"Stripe publishable key not configured"**
- Verify Stripe keys are in `.env.local`
- Make sure keys start with `pk_test_` or `pk_live_`

**"Authentication failed"**
- Check Supabase auth providers are enabled
- Verify OAuth redirect URLs match exactly
- Check browser console for detailed errors

**"Report save failed"**
- Verify database migration completed successfully
- Check Supabase RLS policies allow user to insert
- Look for errors in Supabase logs (Logs & Analytics)

---

## 📞 Contact & Support

For issues or questions:
- **GitHub Issues**: [Create an issue](https://github.com/yourrepo/autopro-inspector/issues)
- **Email**: support@autopro.com (update this)
- **Discord**: Join our community (add link)

---

## 📄 License

MIT License - see LICENSE file for details

---

**Happy Inspecting! 🚗✨**
