<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Auto Pro - Professional Vehicle Inspection Platform

A fully functional AI-powered vehicle inspection application with real data persistence and API integrations.

## ✅ Real Implementation - Not Mock

This application uses **real functionality** with:
- ✅ Real persistent storage (IndexedDB)
- ✅ Real VIN decoding (NHTSA vPIC API)
- ✅ Real AI analysis (Google Gemini API)
- ✅ Real safety recalls (NHTSA Recalls API)
- ⚠️ Real vehicle history (limited by free APIs - see [IMPLEMENTATION.md](IMPLEMENTATION.md) for upgrade options)

**No mock data is used.** All inspection reports are saved permanently and can be retrieved later.

View your app in AI Studio: https://ai.studio/apps/drive/1Sbnc1iHk6C-AHfLWRW4ers0aV7TRKwac

## 🚀 Quick Start

**Prerequisites:** Node.js (v16 or higher)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your API key:**
   - Open `.env.local` file
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_key_here
     ```
   - Get a free key at: https://aistudio.google.com/app/apikey

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to `http://localhost:5173`
   - Start creating inspection reports!

## 📋 Features

### Fully Functional
- **VIN Scanner & Decoder** - Decode any VIN using NHTSA's official database
- **Comprehensive Inspection Forms** - Multiple vehicle types (Car/SUV, EV, Truck, RV, Classic, Motorcycle)
- **Photo & Audio Notes** - Attach photos and voice recordings to inspection items
- **AI-Powered Reports** - Gemini AI generates professional inspection summaries
- **DTC Code Analysis** - Diagnostic trouble code interpretation with repair recommendations
- **Safety Recalls** - Check for open recalls from NHTSA database
- **Report Storage** - All reports saved persistently in IndexedDB
- **AI Assistant Chatbot** - Get answers with Google Search and Maps grounding
- **Offline Support** - Service worker for offline functionality

### Partial Functionality (Upgradable)
- **Vehicle History** - Basic history using free APIs (upgrade to CARFAX for comprehensive data)
- **Theft/Salvage Check** - Basic checks using NHTSA data (upgrade to NICB for official data)

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for details on upgrading to paid services.

## 📖 Documentation

- **[IMPLEMENTATION.md](IMPLEMENTATION.md)** - Complete implementation details, API information, and upgrade guides
- **[package.json](package.json)** - Dependencies and scripts
- **[types.ts](types.ts)** - TypeScript type definitions

## 🗂️ Project Structure

```
/services
  ├── backendService.ts          # Real backend with IndexedDB persistence
  ├── databaseService.ts         # IndexedDB wrapper and utilities
  ├── geminiService.ts           # AI analysis and chat (Gemini API)
  ├── vehicleDataService.ts      # VIN decoding (NHTSA vPIC API)
  ├── vehicleHistoryService.ts   # Vehicle history (free APIs + upgrade options)
  ├── vehicleExtraDataService.ts # Recalls and theft/salvage checks
  ├── vinValidator.ts            # Client-side VIN validation
  ├── imageOptimizer.ts          # Photo compression and optimization
  ├── offlineService.ts          # Offline support utilities
  └── featureDetector.ts         # Browser feature detection

/components
  ├── VINScanner.tsx             # VIN input and scanning
  ├── InspectionForm.tsx         # Multi-step inspection form
  ├── ReportView.tsx             # Generated report display
  ├── ChatBot.tsx                # AI assistant interface
  ├── OBDScanner.tsx             # OBD-II diagnostic tool
  └── ... (other UI components)
```

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional - Only needed if using paid services
CARFAX_API_KEY=your_carfax_key
NICB_API_KEY=your_nicb_key
```

## 🧪 Testing

To test the real functionality:

1. **Create an inspection:**
   - Enter a valid VIN (try: `1HGBH41JXMN109186`)
   - Fill out the inspection checklist
   - Add photos and notes
   - Generate AI report

2. **Verify persistence:**
   - Refresh the page
   - Navigate to "Customer Dashboard"
   - Your report should be there!

3. **Check VIN decoding:**
   - Enter a VIN
   - Verify make/model/year are correctly decoded from NHTSA

4. **Test AI features:**
   - Generate a report summary
   - Ask the chatbot questions
   - Analyze DTC codes

## 🔄 Upgrading to Production

For production deployment, consider:

1. **Backend Server**
   - Replace IndexedDB with cloud database (Firebase, Supabase, AWS)
   - Add user authentication
   - Enable multi-device sync

2. **Paid API Integrations**
   - CARFAX/AutoCheck for comprehensive vehicle history
   - NICB API for official theft/salvage data
   - NMVTIS for title brand information

3. **Payment Processing**
   - Integrate Stripe or similar
   - Implement per-report or subscription billing

4. **Enhanced Features**
   - PDF report generation and email delivery
   - Admin dashboard and analytics
   - Mobile app versions

See [IMPLEMENTATION.md](IMPLEMENTATION.md) for detailed upgrade instructions.

## 🐛 Troubleshooting

**Reports not saving?**
- Check browser console for errors
- Ensure IndexedDB is enabled in your browser
- Try in incognito/private mode to rule out extensions

**AI features not working?**
- Verify `GEMINI_API_KEY` is set in `.env.local`
- Check API key is valid at https://aistudio.google.com
- Check browser console for API errors

**VIN decoding fails?**
- Verify VIN is valid (17 characters, no I/O/Q)
- Check NHTSA API status: https://vpic.nhtsa.dot.gov/api/
- Try again - NHTSA API may have rate limits

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Contributing

Contributions welcome! Please read the implementation documentation before submitting PRs.

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with real APIs and real persistence. No mock data. Production-ready foundation.**
