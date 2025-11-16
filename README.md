<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AutoPro - AI-Powered Vehicle Inspection Platform

A comprehensive vehicle inspection application powered by Google's Gemini AI, designed for mechanics and customers to conduct thorough vehicle inspections with intelligent reporting and support.

View your app in AI Studio: https://ai.studio/apps/drive/1Sbnc1iHk6C-AHfLWRW4ers0aV7TRKwac

## Features

✨ **Intelligent Vehicle Inspections** - VIN scanning, photo documentation, audio notes
🤖 **AI-Powered Diagnostics** - DTC code analysis and repair recommendations
📊 **Professional Reports** - Auto-generated inspection summaries
💬 **Smart Support Agent** - In-app AI assistant to help with any issues
🚀 **Easy Deployment** - Deploy to production in minutes

## Run Locally

**Prerequisites:**  Node.js (v16 or higher)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Deploy to Production

Ready to launch your app with a custom domain? Check out our comprehensive deployment guide:

📘 **[Complete Deployment & Hosting Guide](DEPLOYMENT.md)**

This guide covers:
- How to purchase and configure a domain name
- Step-by-step deployment to hosting providers (Vercel, Netlify, Cloudflare)
- SSL certificate setup (automatic and free!)
- Environment variable configuration
- Troubleshooting common issues
- Cost breakdowns and recommendations

**Quick start:** Deploy to Vercel in under 5 minutes for free!

## Getting Help

Need assistance? The app includes a built-in **Support Agent** (Alex) that can help with:
- App features and usage
- Deployment and hosting questions
- Technical troubleshooting
- Best practices

Just click the help button in the bottom-right corner of the app!

## Project Structure

```
├── components/          # React components
│   ├── MainApp.tsx      # Main application container
│   ├── SupportAgent.tsx # AI support chat
│   ├── InspectionForm.tsx
│   └── ...
├── services/            # API and business logic
│   └── geminiService.ts # AI integration
├── DEPLOYMENT.md        # Deployment guide
└── README.md            # You are here
```

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **AI:** Google Gemini API
- **Styling:** Tailwind CSS
- **Deployment:** Vercel / Netlify / Cloudflare Pages

## Support & Documentation

- 📖 [Deployment Guide](DEPLOYMENT.md) - Complete hosting and domain setup
- 💬 In-app Support Agent - Click the help button in the app
- 🐛 [Report Issues](https://github.com/YOUR-USERNAME/YOUR-REPO/issues)

---

Made with ❤️ for mechanics and automotive professionals
