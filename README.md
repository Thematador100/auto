# AI Auto Inspection Platform 🚗

A complete, production-ready vehicle inspection management system with AI-powered analysis, mobile-first design, admin panel, payment processing, and white-label capabilities.

## 🌟 Features

### Core Inspection Features
- **AI-Powered Analysis**: Google Gemini AI integration for intelligent report generation
- **Multiple Vehicle Types**: Support for Cars, SUVs, Electric Vehicles, Commercial Trucks, RVs, Classic Cars, and Motorcycles
- **Comprehensive Inspection**: Detailed checklists with photo and audio notes
- **VIN Decoder**: Automatic vehicle information lookup via NHTSA API
- **OBD-II Diagnostics**: DTC code analyzer with AI-powered repair recommendations
- **Vehicle History**: Integration for accident reports, recalls, and theft records

### User Management & Authentication
- **Secure Authentication**: Login/signup with bcrypt password hashing and JWT tokens
- **Role-Based Access**: Admin, Inspector, and Viewer roles
- **User Profiles**: Customizable profiles with company information
- **Multi-tenancy**: Support for multiple companies/organizations

### Admin Panel
- **User Management**: Create, edit, and delete users
- **Analytics Dashboard**: Charts and statistics for inspections, revenue, and user activity
- **User Activity Tracking**: Monitor inspection trends and user engagement
- **System Configuration**: Platform-wide settings management

### Payment & Subscriptions
- **Stripe Integration**: Subscription and one-time payment processing
- **Multiple Plans**: Free, Basic, Pro, and Enterprise tiers
- **Billing Management**: Invoice history and payment method management
- **Trial Periods**: 14-day free trial for new users

### White Label
- **Custom Branding**: Configure company name, colors, and logo
- **Custom Domains**: Support for custom domain names
- **Email Customization**: Branded email templates
- **Toggle Branding**: Option to hide platform branding

### Export & Sharing
- **PDF Export**: Professional inspection reports with AI summary
- **Excel Export**: Detailed data export for analysis
- **Email Reports**: Send reports directly to customers
- **Print-Friendly**: Optimized report layouts

### Mobile Experience
- **Responsive Design**: Optimized for tablets and smartphones
- **Touch-Friendly**: Large buttons and easy navigation
- **PWA Support**: Installable as a mobile app
- **Offline Capability**: Service worker for offline access

### AI Assistant
- **Chat Interface**: Real-time AI assistant powered by Gemini
- **Web Search Grounding**: Access to real-time information
- **Google Maps Integration**: Location-based business search
- **Citation Tracking**: Source attribution for AI responses

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Google Gemini API key

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Edit `.env.local` file and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Get your Gemini API key from: https://aistudio.google.com/app/apikey

3. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 🔐 Demo Accounts

The application comes with demo accounts for testing:

### Admin Account
- **Email**: admin@autoinspect.com
- **Password**: admin123
- **Capabilities**: Full system access, user management, analytics

### Inspector Account
- **Email**: inspector@autoinspect.com
- **Password**: inspector123
- **Capabilities**: Create inspections, generate reports

### Creating New Accounts
Click "Sign Up" on the login screen to create a new account. All new accounts start with a 14-day free trial.

## 📱 Usage Guide

### Creating an Inspection

1. **Start New Inspection**: Click "New Inspection" from the dashboard
2. **Enter VIN**: Input the 17-digit VIN (or use demo VIN: 1HGBH41JXMN109186)
3. **Select Vehicle Type**: Choose the appropriate vehicle category
4. **Complete Checklist**: Go through each section, adding photos and notes
5. **Finalize Report**: Generate AI-powered summary
6. **Export/Share**: Download PDF, Excel, or email to customer

### Managing Subscriptions

1. Navigate to **Pricing** page from the header
2. Choose your plan (Free, Basic, Pro, Enterprise)
3. Click "Subscribe Now"
4. View billing history and manage payment methods

### Admin Panel

Only users with the "admin" role can access the admin panel:

1. Click **Admin** in the navigation
2. View dashboard statistics and charts
3. Manage users (edit, delete, change plans)
4. Configure system settings

### White Label Configuration

1. Go to **Settings** → **White Label** tab
2. Configure your branding:
   - Company name
   - Primary and secondary colors
   - Email settings
   - Custom domain (enterprise plan)
3. Save changes

## 🏗️ Technology Stack

### Frontend
- **React 19**: Latest React with modern hooks
- **TypeScript 5.8**: Type-safe development
- **Vite 6.2**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first CSS framework

### AI & APIs
- **Google Gemini**: AI-powered analysis and chat
- **NHTSA vPIC**: VIN decoding
- **Google Search Grounding**: Real-time web search
- **Google Maps Grounding**: Location services

### Data Management
- **LocalStorage**: Client-side data persistence
- **IndexedDB**: Offline report storage
- **React Context**: State management

### Payments & Auth
- **Stripe**: Payment processing (demo mode)
- **JWT**: Token-based authentication
- **bcrypt**: Password hashing

### Export & Reporting
- **jsPDF**: PDF generation
- **xlsx**: Excel export
- **Recharts**: Data visualization

## 📂 Project Structure

```
/auto
├── components/          # React components
│   ├── AdminDashboard.tsx    # Admin panel
│   ├── AuthForms.tsx         # Login/signup
│   ├── PricingPage.tsx       # Subscription plans
│   ├── SettingsPage.tsx      # User settings
│   ├── InspectionForm.tsx    # Main inspection UI
│   ├── ReportView.tsx        # Report display
│   └── ...
├── services/           # Business logic
│   ├── authService.ts        # Authentication
│   ├── paymentService.ts     # Stripe integration
│   ├── geminiService.ts      # AI analysis
│   ├── exportService.ts      # PDF/Excel export
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx       # Auth state management
├── hooks/              # Custom React hooks
├── types.ts            # TypeScript definitions
├── constants.ts        # App constants
├── config.ts           # Configuration
└── App.tsx            # Main app component
```

## 🔧 Configuration

### Pricing Plans

Edit `services/paymentService.ts` to customize pricing plans:

```typescript
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'pro',
    name: 'pro',
    displayName: 'Pro',
    price: 79,
    priceDisplay: '$79',
    interval: 'month',
    features: [...],
    stripePriceId: 'price_pro_monthly',
  },
  // ...
];
```

### Vehicle Templates

Edit `constants.ts` to add or modify vehicle inspection templates:

```typescript
export const VEHICLE_INSPECTION_TEMPLATES = {
  'Standard Car/SUV': {
    categories: [...],
  },
  // Add your custom template
};
```

### Branding

Edit `config.ts` to change default branding:

```typescript
export const CONFIG = {
  BRANDING: {
    companyName: 'Your Company Name',
  },
  // ...
};
```

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable: `VITE_GEMINI_API_KEY`
4. Deploy

### Deploy to Netlify

1. Build the project: `npm run build`
2. Deploy `dist` folder to Netlify
3. Add environment variable in Netlify dashboard

### Deploy to Your Server

1. Build: `npm run build`
2. Upload `dist` folder to your web server
3. Configure web server to serve `index.html` for all routes
4. Set up SSL certificate

## 🔒 Security Notes

**Important**: This demo uses client-side authentication for simplicity. In production:

1. **Move authentication to backend**: Use a secure backend API for login/signup
2. **Use secure JWT secrets**: Store JWT secrets in environment variables
3. **Implement rate limiting**: Protect against brute force attacks
4. **Use HTTPS**: Always use SSL in production
5. **Validate on server**: Never trust client-side validation alone
6. **Use Stripe webhooks**: Handle payment events securely on backend

## 📄 License

This project is provided as-is for demonstration purposes.

## 🎯 Roadmap

Future enhancements:
- [ ] Real backend API with database (PostgreSQL/MongoDB)
- [ ] Team collaboration features
- [ ] Advanced analytics and reporting
- [ ] Mobile native apps (React Native)
- [ ] SMS notifications
- [ ] API webhooks for integrations
- [ ] Multi-language support
- [ ] Advanced permission system
- [ ] Audit logs
- [ ] Data export tools

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- NHTSA for VIN decoding API
- Stripe for payment processing
- Tailwind CSS for the design system
- All open-source contributors

---

**Built with ❤️ for mobile vehicle inspectors worldwide**
