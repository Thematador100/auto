# 🚗 AutoPro Inspector

**The Ultimate Vehicle Inspection Tool** - Simple enough for everyday car buyers, powerful enough for professional inspectors.

[![Made with React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Powered by Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat&logo=supabase)](https://supabase.com/)
[![AI by Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange?style=flat&logo=google)](https://ai.google.dev/)

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local

# Start development server
npm run dev
```

**📖 For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 🎯 What Makes AutoPro Special?

### 👨‍👩‍👧 For Everyone
- **No technical knowledge needed** - Guided step-by-step checklists
- **Snap photos & add notes** - Document everything with your phone
- **Voice recording** - Record observations hands-free
- **AI explains everything** - Get simple, plain-English explanations
- **7-day free trial** - Try all features risk-free

### 🔧 For Professionals
- **6 vehicle types supported** - Standard, EV, Commercial, RV, Classic, Motorcycle
- **OBD-II diagnostic tool** - Decode & analyze trouble codes with AI
- **Complete vehicle history** - Previous owners, accidents, title issues
- **Safety recalls integration** - Real-time NHTSA recall data
- **Theft & salvage checks** - Verify vehicle legitimacy
- **Cloud storage** - Access reports from any device
- **Export to PDF** - Professional reports for clients

---

## 🌟 Features

### Core Inspection Tools
- ✅ **VIN Scanner** - Automatic vehicle identification
- ✅ **Smart Checklists** - Customized for each vehicle type
- ✅ **Photo Management** - Organize by category (exterior, engine, interior, etc.)
- ✅ **Audio Notes** - Record detailed observations
- ✅ **AI Report Generation** - Comprehensive analysis with recommendations

### External Data Integration
- 🔍 **NHTSA VIN Decoder** - Official vehicle specs
- 🔍 **Safety Recalls** - Up-to-date recall information
- 🔍 **Vehicle History** - Ownership and accident history
- 🔍 **Theft/Salvage Database** - Verify clean title

### AI-Powered Features
- 🤖 **Google Gemini Integration**
  - Inspection report summarization
  - DTC code analysis & repair guidance
  - Chat assistant with grounding (Google Search & Maps)
  - Location-aware service recommendations

### Diagnostics
- 🔧 **OBD-II Code Scanner** - Enter & analyze trouble codes
- 🔧 **AI Diagnostics** - Understand code relationships
- 🔧 **Repair Guidance** - Step-by-step troubleshooting
- 🔧 **Symptom Analysis** - Identify root causes

### User Experience
- 🎨 **Dark Theme** - Easy on the eyes
- 📱 **Mobile Responsive** - Works on any device
- 💾 **Offline Support** - Continue working without internet
- ☁️ **Auto-Sync** - Seamlessly sync when online
- 🔐 **Secure Authentication** - Email, Google, or GitHub login

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19, TypeScript 5.8, Vite 6.2 |
| **Styling** | Tailwind CSS (via CDN) |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (Email + OAuth) |
| **Payments** | Stripe |
| **AI** | Google Gemini 1.5 |
| **APIs** | NHTSA vPIC, NHTSA Recalls |
| **Storage** | Supabase Storage + localStorage |

---

## 💰 Pricing Plans

### Pro Plan - $49.99/month
- ✅ Unlimited vehicle inspections
- ✅ AI-powered reports
- ✅ Vehicle history reports
- ✅ OBD-II diagnostics
- ✅ AI chat assistant
- ✅ Cloud storage
- ✅ Export to PDF
- ✅ Email support

### Pay-Per-Report
- Standard Car/SUV: $19.99
- Electric Vehicle: $24.99
- Commercial Truck: $39.99
- RV: $34.99
- Classic/Collector: $29.99
- Motorcycle: $14.99

### Free Trial
- 7 days full access
- No credit card required
- Cancel anytime

---

## 🚀 Deployment

### Prerequisites
1. **Supabase Project** - [Sign up free](https://supabase.com)
2. **Stripe Account** - [Create account](https://stripe.com)
3. **Google Gemini API Key** - [Get key](https://makersuite.google.com/app/apikey)

### Deploy Steps

1. **Set up Supabase**
   ```sql
   -- Run supabase-migrations.sql in Supabase SQL Editor
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Fill in your API keys
   ```

3. **Build**
   ```bash
   npm run build
   ```

4. **Deploy to Vercel** (Recommended)
   ```bash
   npm install -g vercel
   vercel
   ```

**📖 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions**

---

## 🔒 Security Features

- ✅ **Row Level Security (RLS)** - Users can only access their own data
- ✅ **Encrypted connections** - All data transmitted via HTTPS
- ✅ **Secure authentication** - Industry-standard OAuth 2.0
- ✅ **API key protection** - Keys never exposed to client
- ✅ **Payment security** - PCI-compliant via Stripe
- ✅ **No passwords stored** - Handled by Supabase Auth

---

## 📞 Support

- 📧 **Email**: support@autopro.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourrepo/issues)
- 📖 **Docs**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

<div align="center">

**Built with ❤️ to help car buyers avoid getting ripped off**

[Get Started](./SETUP_GUIDE.md) • [Report Bug](#) • [Request Feature](#)

</div>
