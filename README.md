# AI Auto Pro - Vehicle Inspection Platform

A professional vehicle inspection platform powered by multiple AI providers (OpenAI, DeepSeek, Gemini) with real-time database storage via Supabase.

## Features

- **Multiple AI Provider Support**: Choose between OpenAI, DeepSeek, or Google Gemini
- **Real Database Integration**: Supabase for persistent data storage
- **Vehicle Inspection**: Comprehensive checklist-based inspection system
- **AI-Powered Analysis**: DTC code analysis, report generation, and chatbot
- **Vehicle History**: Integration with NHTSA APIs for VIN decoding and recall information
- **Image Analysis**: AI-powered vehicle feature detection from photos

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- API keys for at least one AI provider (OpenAI, DeepSeek, or Gemini)
- A Supabase account and project

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd auto
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase Database

#### A. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and create

#### B. Run the Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase-schema.sql` from this repository
4. Paste and click **Run**

#### C. Get Your Supabase Credentials
1. Go to **Settings** → **API**
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **anon/public** key

### 4. Get AI Provider API Keys

#### Option A: Google Gemini (Recommended - Free Tier Available)
1. Go to [https://ai.google.dev/](https://ai.google.dev/)
2. Click "Get API Key"
3. Create or select a project
4. Copy your API key

#### Option B: OpenAI
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it and copy the key (you won't see it again!)

#### Option C: DeepSeek
1. Go to [https://platform.deepseek.com/](https://platform.deepseek.com/)
2. Sign up and navigate to API Keys
3. Create a new API key
4. Copy the key

### 5. Configure Environment Variables

Edit `.env.local` and fill in your credentials:

```bash
# Choose your AI provider: 'openai', 'deepseek', or 'gemini'
AI_PROVIDER=gemini

# Add your chosen AI provider's API key
GEMINI_API_KEY=your_actual_gemini_key_here
OPENAI_API_KEY=your_actual_openai_key_here
DEEPSEEK_API_KEY=your_actual_deepseek_key_here

# Add your Supabase credentials
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here

# Legacy support (optional, uses GEMINI_API_KEY if set)
API_KEY=your_actual_gemini_key_here
```

**Important Notes:**
- Only the API key for your chosen `AI_PROVIDER` is required
- Supabase credentials are required for database functionality
- If Supabase is not configured, the app will fall back to localStorage

### 6. Run the Application

```bash
npm run dev
```

The application will start at: **http://localhost:3000**

## AI Provider Comparison

| Provider | Pros | Cons | Cost |
|----------|------|------|------|
| **Gemini** | Free tier, Google Search/Maps integration, Vision support | Newer, less documentation | Free tier available |
| **OpenAI** | Most popular, excellent quality, good docs | More expensive | Pay per token |
| **DeepSeek** | Cost-effective, good performance | Less known, limited grounding | Lower cost |

## Switching AI Providers

To switch between AI providers, simply change the `AI_PROVIDER` variable in `.env.local`:

```bash
# Use OpenAI
AI_PROVIDER=openai

# Use DeepSeek
AI_PROVIDER=deepseek

# Use Gemini (default)
AI_PROVIDER=gemini
```

Then restart your development server.

## Database Schema

The application uses two main tables:

### `users`
- `id` (TEXT, PRIMARY KEY)
- `email` (TEXT, UNIQUE)
- `plan` (TEXT: 'pro' or 'basic')
- `created_at` (TIMESTAMPTZ)

### `reports`
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY → users.id)
- `date` (TEXT)
- `vehicle` (JSONB)
- `summary` (JSONB)
- `sections` (JSONB)
- `vehicle_history` (JSONB)
- `safety_recalls` (JSONB)
- `theft_and_salvage` (JSONB)
- `created_at` (TIMESTAMPTZ)

## Project Structure

```
auto/
├── components/          # React components
│   ├── ChatBot.tsx     # AI chatbot interface
│   ├── OBDScanner.tsx  # DTC code analyzer
│   └── ...
├── services/           # Business logic and API clients
│   ├── aiProvider.ts   # Unified AI provider interface
│   ├── supabaseClient.ts # Supabase database client
│   ├── backendService.ts # Backend API wrapper
│   └── ...
├── hooks/              # React hooks
├── types.ts            # TypeScript type definitions
├── .env.local          # Environment variables (create this!)
├── vite.config.ts      # Vite configuration
├── supabase-schema.sql # Database schema
└── package.json        # Dependencies
```

## Features Breakdown

### 1. Vehicle Inspection
- Multi-category checklist system
- Photo and audio note capture
- Odometer reading
- VIN-based vehicle data lookup

### 2. AI-Powered Analysis
- **DTC Code Analysis**: Analyzes diagnostic trouble codes
- **Report Generation**: Creates comprehensive inspection reports
- **Chatbot**: Answers automotive questions with web/maps grounding (Gemini only)

### 3. External Data Integration
- **NHTSA VIN Decoder**: Real vehicle make/model/year data
- **Safety Recalls**: Official recall information by VIN
- **Vehicle History**: Simulated (can be replaced with real API)

### 4. Database Storage
- Persistent report storage in Supabase
- User management
- Automatic fallback to localStorage if Supabase unavailable

## Troubleshooting

### "API_KEY environment variable is not set"
- Check that your `.env.local` file exists
- Verify the API key for your chosen provider is set correctly
- Restart the dev server after changing env variables

### "SUPABASE_URL environment variable is not set"
- Add your Supabase URL to `.env.local`
- Or remove Supabase error checks to use localStorage fallback only

### "Failed to save report to database"
- Check Supabase credentials are correct
- Verify you ran the `supabase-schema.sql` script
- Check browser console for detailed error messages
- App will fallback to localStorage if Supabase fails

### AI Provider Not Working
- Verify you have the correct API key for your chosen provider
- Check that `AI_PROVIDER` matches the key you've set
- Ensure your API key has sufficient credits/quota

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_PROVIDER` | Yes | Which AI to use: 'openai', 'deepseek', or 'gemini' |
| `GEMINI_API_KEY` | If using Gemini | Google Gemini API key |
| `OPENAI_API_KEY` | If using OpenAI | OpenAI API key |
| `DEEPSEEK_API_KEY` | If using DeepSeek | DeepSeek API key |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public key |
| `API_KEY` | No | Legacy support for Gemini |

## Security Notes

- Never commit `.env.local` to version control
- The `SUPABASE_ANON_KEY` is safe for client-side use
- Row Level Security (RLS) is enabled in Supabase for data protection
- API keys are injected at build time via Vite

## API Rate Limits

- **OpenAI**: Varies by plan (check your account)
- **DeepSeek**: Check platform documentation
- **Gemini**: Free tier has rate limits (60 requests/minute)
- **NHTSA APIs**: Public, no auth required

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues or questions:
1. Check this README
2. Review error messages in browser console
3. Verify all environment variables are set correctly
4. Check API provider status pages

## Roadmap

- [ ] Real authentication system (Auth0, Firebase Auth)
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] PDF report export
- [ ] Mobile app (React Native)
- [ ] Real vehicle history API integration
- [ ] Multi-language support

---

**Made with ❤️ using React, TypeScript, Vite, Supabase, and AI**
