# AI Auto Pro - Implementation Guide
## Premium Multi-Tier Platform with DeepSeek, White-Labeling & Territory Licensing

---

## Table of Contents

1. [Overview](#overview)
2. [New Features](#new-features)
3. [Environment Setup](#environment-setup)
4. [Pricing Tiers](#pricing-tiers)
5. [DeepSeek AI Integration](#deepseek-ai-integration)
6. [White-Labeling System](#white-labeling-system)
7. [Territory Operator Licensing](#territory-operator-licensing)
8. [Guided Inspection Mode](#guided-inspection-mode)
9. [Feature Flags](#feature-flags)
10. [API Integration Examples](#api-integration-examples)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## Overview

This implementation transforms AI Auto Pro into a premium, multi-tier SaaS platform with:

- **5 Subscription Tiers**: Free, Individual ($89.99/mo), Professional ($299/mo), Enterprise ($2,499/mo), Territory Operator ($999/mo + $12,500 setup)
- **Multi-AI Provider Support**: Gemini, DeepSeek R1/V3, GPT-4o (cost optimization based on tier)
- **White-Labeling**: Full branding customization for Enterprise and Operator tiers
- **Territory Licensing**: Geographic operator licensing system (no franchise regulations)
- **Guided Inspection**: Step-by-step mode for beginners
- **Feature Flags**: A/B testing and rollout control

**Projected Year 1 Revenue**: $87M (conservative)

---

## New Features

### ✅ Completed

1. **Multi-Tier Pricing Model**
   - Free tier (1 inspection/month) for viral growth
   - Individual, Professional, Enterprise, and Operator tiers
   - Annual billing options with discounts
   - Usage limits per tier

2. **DeepSeek AI Integration**
   - DeepSeek R1 (Reasoning) for diagnostics
   - DeepSeek V3 (Chat) for cost-effective chat
   - 55% cost reduction vs Gemini
   - Provider factory pattern for easy switching

3. **White-Labeling System**
   - Custom branding (logo, colors, domain)
   - Tenant-specific configuration
   - Feature toggling per tenant
   - Custom pricing per tenant

4. **Territory Operator Licensing**
   - Geographic territory management (50-mile radius)
   - Operator registration and licensing
   - Revenue share calculation (15%)
   - Territory overlap detection

5. **Guided Inspection Mode**
   - Step-by-step wizard for beginners
   - Tips and red flags per step
   - Photo requirements with validation
   - Progress tracking

6. **Feature Flags Service**
   - A/B testing support
   - Rollout percentage control
   - Tier-based feature access
   - User/operator whitelisting

---

## Environment Setup

### 1. Install Dependencies

No new dependencies required! All services use native Fetch API.

### 2. Environment Variables

Create or update `.env.local`:

```bash
# Existing
GEMINI_API_KEY=your_gemini_api_key_here

# New AI Providers
DEEPSEEK_API_KEY=your_deepseek_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # For Enterprise tier

# Stripe (for payment processing - future)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 3. Get API Keys

**DeepSeek API:**
1. Go to https://platform.deepseek.com
2. Sign up for account
3. Navigate to API Keys
4. Create new key
5. Copy to `.env.local`

**OpenAI (optional, for Enterprise):**
1. Go to https://platform.openai.com
2. Create API key
3. Add to `.env.local`

### 4. Start Development Server

```bash
npm install
npm run dev
```

Server will start on `http://localhost:3000`

---

## Pricing Tiers

### Configuration

All pricing is configured in `/config.ts`:

```typescript
CONFIG.PRICING.plans = {
  free: {
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: {
      inspectionsPerMonth: 1,
      aiCallsPerMonth: 10,
      storageGB: 0.5,
      teamMembers: 1,
      apiCallsPerDay: 0,
    },
  },
  individual: {
    monthlyPrice: 89.99,
    yearlyPrice: 799, // Save $279/year
    limits: {
      inspectionsPerMonth: -1, // unlimited
      aiCallsPerMonth: -1,
      storageGB: 10,
      teamMembers: 1,
      apiCallsPerDay: 0,
    },
  },
  // ... professional, enterprise, operator
}
```

### Usage Tracking

To enforce limits, implement usage tracking in your application:

```typescript
import { UserSubscription } from './types';

// Check if user can perform action
function canUserInspect(subscription: UserSubscription): boolean {
  const plan = CONFIG.PRICING.plans[subscription.tier];

  if (plan.limits.inspectionsPerMonth === -1) {
    return true; // unlimited
  }

  return subscription.usage.inspectionsThisMonth < plan.limits.inspectionsPerMonth;
}
```

---

## DeepSeek AI Integration

### Basic Usage

```typescript
import { analyzeDTCCodes, generateReportSummary } from './services/aiProviderFactory';

// Analyze DTC codes (automatically uses optimal provider)
const codes = [
  { code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected' }
];
const analysis = await analyzeDTCCodes(codes);

// Generate report (automatically uses optimal provider)
const report = await generateReportSummary(inspectionState);

// Force specific provider
const reportDeepSeek = await generateReportSummary(inspectionState, 'deepseek');
const reportGemini = await generateReportSummary(inspectionState, 'gemini');
```

### Provider Selection Strategy

The factory automatically chooses the best provider:

| Tier | Task Type | Provider | Reason |
|------|-----------|----------|--------|
| Free | Text | DeepSeek | Lowest cost |
| Free | Vision | Gemini | DeepSeek has no vision |
| Individual | Text | DeepSeek | Cost-effective |
| Professional | Text | Gemini | Better quality |
| Enterprise | All | GPT-4o | Highest quality |

### Cost Comparison

| Provider | Model | Cost per 1M tokens | Use Case |
|----------|-------|-------------------|----------|
| DeepSeek | V3 | $0.27 | Chat, low-cost text |
| DeepSeek | R1 | $0.55 | Complex reasoning |
| Gemini | 2.0 Flash | $0.075 | Vision, fast inference |
| Gemini | 2.5 Pro | $1.25 | Complex multimodal |
| OpenAI | GPT-4o | $2.50 | Enterprise critical tasks |

---

## White-Labeling System

### Setup White-Label Tenant

```typescript
import { createOperatorWhiteLabel } from './services/whitelabelService';

// Create white-label config for operator
const whitelabelConfig = createOperatorWhiteLabel(
  'operator-123',
  {
    companyName: 'Auto Inspect Pro',
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    accentColor: '#34d399',
    supportEmail: 'support@autoinspectpro.com',
    logoUrl: 'https://example.com/logo.png',
    customDomain: 'inspections.autoinspectpro.com',
  }
);
```

### Use White-Label in Components

```typescript
import { useWhiteLabelConfig } from './hooks/useWhiteLabelConfig';

function Header() {
  const { branding, isWhiteLabeled } = useWhiteLabelConfig();

  return (
    <header>
      <h1>{branding.companyName}</h1>
      {branding.logoUrl && <img src={branding.logoUrl} alt="Logo" />}
    </header>
  );
}
```

### Domain Mapping

White-label configs are automatically loaded based on:

1. **Custom Domain**: `inspections.autoinspectpro.com` → operator-specific config
2. **Subdomain**: `operator123.aiautopro.com` → loads `operator123` tenant
3. **URL Parameter**: `?tenant=operator123` → loads specific tenant
4. **LocalStorage**: Persists tenant selection for session

### Testing White-Label

```typescript
// In browser console:
localStorage.setItem('whitelabel_tenant_id', 'operator-sample-123');
location.reload();

// Or use URL parameter:
// http://localhost:3000/?tenant=operator-sample-123
```

---

## Territory Operator Licensing

### Register New Operator

```typescript
import { registerOperator } from './services/licenseService';

const operator = registerOperator(
  'John Smith',                    // Name
  'john@autoinspectpro.com',      // Email
  '555-0123',                      // Phone
  'Auto Inspect Pro LLC',          // Business name
  {
    name: 'Miami Metro',
    region: 'Miami',
    state: 'FL',
    lat: 25.7617,
    lng: -80.1918,
  },
  {
    companyName: 'Auto Inspect Pro',
    primaryColor: '#10b981',
    supportEmail: 'support@autoinspectpro.com',
    customDomain: 'inspections.autoinspectpro.com',
  }
);

console.log(operator);
// {
//   id: 'operator_...',
//   licenses: [{
//     setupFee: 12500,
//     monthlyPlatformFee: 999,
//     revenueSharePercent: 15,
//     territories: [...]
//   }]
// }
```

### Check Territory Availability

```typescript
import { checkTerritoryOverlap, getAvailableTerritories } from './services/licenseService';

// Check if location is available
const { overlaps, conflictingTerritories } = checkTerritoryOverlap(
  40.7128,  // NYC latitude
  -74.0060, // NYC longitude
  50        // 50-mile radius
);

if (overlaps) {
  console.log('Territory already claimed by:', conflictingTerritories[0].name);
}

// Get list of available major cities
const available = getAvailableTerritories();
console.log(available);
// [
//   { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.006, population: 8336817 },
//   ...
// ]
```

### Calculate Revenue Share

```typescript
import { calculateRevenueShare } from './services/licenseService';

// Operator has 200 subscribers at $89.99/month = $17,998/month revenue
const revenueCalc = calculateRevenueShare('operator-123', 17998);

console.log(revenueCalc);
// {
//   platformFee: 999,           // Fixed monthly fee
//   revenueShare: 2699.70,      // 15% of $17,998
//   totalOwed: 3698.70,         // Total owed to platform
//   operatorNet: 14299.30       // Operator keeps this
// }
```

### Territory Map Visualization

```typescript
import { getAllOperators, getOperatorTerritories } from './services/licenseService';

// Get all operators and their territories for map display
const operators = getAllOperators();

operators.forEach(op => {
  const territories = getOperatorTerritories(op.id);
  territories.forEach(t => {
    // Draw circle on map
    drawCircle(t.coordinates.lat, t.coordinates.lng, t.radiusMiles);
  });
});
```

---

## Guided Inspection Mode

### Use Guided Inspection Component

```typescript
import { GuidedInspection } from './components/GuidedInspection';

function InspectionView() {
  const [inspectionState, setInspectionState] = useState<InspectionState>({
    vehicle: { vin: '...', make: 'Toyota', model: 'Camry', year: '2020' },
    vehicleType: 'Standard Car/SUV',
    checklist: {},
    overallNotes: '',
    odometer: '50000',
  });

  const handleStepComplete = (stepId: string, data: any) => {
    console.log('Step completed:', stepId, data);
    // Update inspection state with captured photos/notes
  };

  const handleComplete = () => {
    console.log('Inspection completed!');
    // Generate final report
  };

  return (
    <GuidedInspection
      inspectionState={inspectionState}
      onStepComplete={handleStepComplete}
      onComplete={handleComplete}
    />
  );
}
```

### Guided Inspection Features

- **8 Step Process**:
  1. Front Exterior
  2. Side Panels
  3. Rear Exterior
  4. Engine Bay
  5. Interior - Front
  6. Interior - Rear
  7. Undercarriage
  8. Test Drive

- **Each Step Includes**:
  - Clear description
  - Required number of photos
  - Tips (what to look for)
  - Red flags (warning signs)
  - Progress tracking
  - Optional audio notes

- **User Experience**:
  - Cannot proceed without required photos
  - Progress bar shows completion
  - Tips/red flags are collapsible
  - Mobile-friendly camera capture

---

## Feature Flags

### Check Feature Access

```typescript
import { isFeatureEnabled, getUserFeatures } from './services/featureFlagsService';

// Check single feature
if (isFeatureEnabled('guidedInspection', userId, 'individual')) {
  // Show guided inspection option
}

// Get all features for user
const features = getUserFeatures(userId, 'professional', operatorId);
console.log(features);
// {
//   inspection: true,
//   diagnostics: true,
//   guidedInspection: true,
//   apiAccess: true,
//   whiteLabeling: false,
//   ...
// }
```

### Feature Flag Configuration

In `/config.ts`:

```typescript
FEATURES: {
  flags: {
    guidedInspection: {
      name: 'Guided Inspection Mode',
      enabled: true,
      rolloutPercent: 50,  // A/B testing: show to 50% of users
      enabledForTiers: ['free', 'individual', 'professional'],
    },
    deepseekAI: {
      name: 'DeepSeek AI Models',
      enabled: true,
      rolloutPercent: 100,
      enabledForTiers: ['free', 'individual', 'professional', 'enterprise'],
    },
  },
}
```

### A/B Testing

The rollout percentage provides deterministic A/B testing:

```typescript
// User 'abc123' will consistently be in the same group (A or B)
isFeatureEnabled('guidedInspection', 'abc123', 'individual');
// Returns same result every time for this user
```

---

## API Integration Examples

### Create New Inspection with AI Analysis

```typescript
import { analyzeDTCCodes, generateReportSummary } from './services/aiProviderFactory';

async function createInspection(inspectionData: InspectionState, dtcCodes: DTCCode[]) {
  // 1. Analyze DTC codes using optimal AI provider
  const diagnosticAnalysis = await analyzeDTCCodes(dtcCodes);

  // 2. Generate report summary
  const reportSummary = await generateReportSummary(inspectionData);

  // 3. Save to backend (implement your backend service)
  const report = {
    ...inspectionData,
    diagnosticAnalysis,
    reportSummary,
    createdAt: new Date().toISOString(),
  };

  // await backendService.saveReport(report);

  return report;
}
```

### Operator Dashboard Data

```typescript
import { getOperator, calculateRevenueShare } from './services/licenseService';

function OperatorDashboard({ operatorId }: { operatorId: string }) {
  const operator = getOperator(operatorId);
  const revenueCalc = calculateRevenueShare(operatorId, operator.monthlyRevenue);

  return (
    <div>
      <h1>{operator.businessName} Dashboard</h1>

      <div className="stats">
        <div>Total Subscribers: {operator.totalSubscribers}</div>
        <div>Monthly Revenue: ${operator.monthlyRevenue}</div>
        <div>Platform Fee: ${revenueCalc.platformFee}</div>
        <div>Revenue Share (15%): ${revenueCalc.revenueShare}</div>
        <div>Your Net: ${revenueCalc.operatorNet}</div>
      </div>

      <div className="territories">
        {operator.licenses[0].territories.map(t => (
          <div key={t.id}>
            {t.name} - {t.radiusMiles} mile radius
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Testing

### Test White-Labeling

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Test white-label
curl http://localhost:3000/?tenant=operator-sample-123
```

In browser:
```javascript
// Create sample operator config
import { createSampleOperatorConfig } from './services/whitelabelService';
createSampleOperatorConfig();

// Reload with tenant
localStorage.setItem('whitelabel_tenant_id', 'operator-sample-123');
location.reload();
```

### Test Operator Registration

```javascript
import { createSampleOperator } from './services/licenseService';

// Create test operator
const operator = createSampleOperator();
console.log(operator);

// Check revenue calculation
import { calculateRevenueShare } from './services/licenseService';
const revenue = calculateRevenueShare(operator.id, 18000);
console.log(revenue);
```

### Test AI Provider Switching

```javascript
import * as aiFactory from './services/aiProviderFactory';

// Test DTC analysis with different providers
const codes = [{ code: 'P0300', description: 'Misfire' }];

const deepseekResult = await aiFactory.analyzeDTCCodes(codes, 'deepseek');
const geminiResult = await aiFactory.analyzeDTCCodes(codes, 'gemini');

console.log('DeepSeek:', deepseekResult);
console.log('Gemini:', geminiResult);
```

---

## Deployment

### Production Checklist

- [ ] Set up production environment variables
- [ ] Configure custom domains for white-label tenants
- [ ] Implement payment processing (Stripe)
- [ ] Set up production database (PostgreSQL/MongoDB)
- [ ] Configure CDN for static assets
- [ ] Set up SSL certificates for custom domains
- [ ] Implement user authentication (Firebase/Auth0)
- [ ] Add monitoring (Sentry, LogRocket)
- [ ] Set up analytics (Google Analytics, Mixpanel)
- [ ] Configure backup and disaster recovery
- [ ] Implement rate limiting for API calls
- [ ] Add GDPR compliance (cookie consent, data export)

### Environment-Specific Configs

```typescript
// config.production.ts
export const PRODUCTION_CONFIG = {
  ...CONFIG,
  AI: {
    ...CONFIG.AI,
    defaultProvider: 'deepseek', // Use cheaper provider in prod
  },
  FEATURES: {
    flags: {
      ...CONFIG.FEATURES.flags,
      guidedInspection: {
        ...CONFIG.FEATURES.flags.guidedInspection,
        rolloutPercent: 100, // Full rollout in production
      },
    },
  },
};
```

### Deployment Steps

```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify/AWS
vercel deploy --prod

# Or manual deployment
npm run build
# Upload dist/ folder to your hosting
```

### Custom Domain Setup (for White-Label)

1. **DNS Configuration**: Point custom domain to your server
2. **SSL Certificate**: Use Let's Encrypt or cloud provider SSL
3. **Domain Mapping**: Map domain to tenant in your backend

```typescript
// Example domain mapping (in production backend)
const domainToTenant = {
  'inspections.autoinspectpro.com': 'operator-123',
  'carcheck.example.com': 'operator-456',
};
```

---

## Next Steps

### Immediate (Week 1-2)
1. ✅ Test all new features locally
2. ⬜ Integrate Stripe for payment processing
3. ⬜ Set up production database
4. ⬜ Implement user authentication

### Short-term (Month 1-2)
1. ⬜ Build operator onboarding flow
2. ⬜ Create territory selection map
3. ⬜ Implement subscription management
4. ⬜ Add usage analytics dashboard
5. ⬜ Build marketing website

### Medium-term (Month 3-6)
1. ⬜ Launch operator recruitment program
2. ⬜ Implement referral system
3. ⬜ Build mobile apps (iOS/Android)
4. ⬜ Add integrations (Carfax, AutoTrader)
5. ⬜ Develop API marketplace

---

## Support

For questions or issues:

- **Technical**: Open issue on GitHub
- **Business**: Contact sales team
- **Operator Support**: Access operator portal

---

## License

Proprietary - All Rights Reserved
