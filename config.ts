// config.ts

import {
  PricingPlan,
  BrandingConfig,
  AIModelOption,
  FeatureFlag,
  SubscriptionTier,
  AIProvider
} from './types';

interface ReportPricing {
  [key: string]: { price: number };
}

interface InspectionBundle {
  price: number;
  inspections: number;
  savings: number;
  validityDays: number;
}

interface Config {
  BRANDING: BrandingConfig;
  AI: {
    defaultProvider: AIProvider;
    models: AIModelOption[];
  };
  PRICING: {
    plans: {
      [key in SubscriptionTier]: PricingPlan;
    };
    reports: ReportPricing;
    bundles: {
      [key: string]: InspectionBundle;
    };
    operator: {
      setupFee: number;
      monthlyPlatformFee: number;
      revenueSharePercent: number;
      minimumTermMonths: number;
      territoryRadiusMiles: number;
    };
  };
  FEATURES: {
    flags: { [key: string]: FeatureFlag };
  };
}

export const CONFIG: Config = {
  BRANDING: {
    companyName: 'AI Auto Pro',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    accentColor: '#3b82f6',
    supportEmail: 'support@aiautopro.com',
    supportPhone: '1-800-AUTO-PRO',
  },

  AI: {
    defaultProvider: 'gemini',
    models: [
      {
        provider: 'gemini',
        modelName: 'gemini-2.0-flash-exp',
        displayName: 'Gemini 2.0 Flash',
        costPerMillionTokens: 0.075,
        capabilities: {
          vision: true,
          reasoning: true,
          chat: true,
          codeAnalysis: true,
        },
        availableForTiers: ['free', 'individual', 'professional', 'enterprise', 'operator'],
      },
      {
        provider: 'gemini',
        modelName: 'gemini-2.5-pro',
        displayName: 'Gemini 2.5 Pro',
        costPerMillionTokens: 1.25,
        capabilities: {
          vision: true,
          reasoning: true,
          chat: true,
          codeAnalysis: true,
        },
        availableForTiers: ['professional', 'enterprise', 'operator'],
      },
      {
        provider: 'deepseek',
        modelName: 'deepseek-reasoner',
        displayName: 'DeepSeek R1',
        costPerMillionTokens: 0.55,
        capabilities: {
          vision: false,
          reasoning: true,
          chat: true,
          codeAnalysis: true,
        },
        availableForTiers: ['free', 'individual', 'professional', 'enterprise', 'operator'],
      },
      {
        provider: 'deepseek',
        modelName: 'deepseek-chat',
        displayName: 'DeepSeek V3',
        costPerMillionTokens: 0.27,
        capabilities: {
          vision: false,
          reasoning: true,
          chat: true,
          codeAnalysis: true,
        },
        availableForTiers: ['free', 'individual', 'professional', 'enterprise', 'operator'],
      },
      {
        provider: 'openai',
        modelName: 'gpt-4o',
        displayName: 'GPT-4o',
        costPerMillionTokens: 2.5,
        capabilities: {
          vision: true,
          reasoning: true,
          chat: true,
          codeAnalysis: true,
        },
        availableForTiers: ['enterprise'],
      },
    ],
  },

  PRICING: {
    plans: {
      free: {
        name: 'Free Trial',
        monthlyPrice: 0,
        yearlyPrice: 0,
        interval: 'monthly',
        features: [
          '1 Free Standard Car Inspection (One-Time)',
          'VIN Decoder',
          'Basic Report (No AI Analysis)',
          'Community Support Only',
        ],
        limits: {
          inspectionsPerMonth: 0, // One-time trial, not recurring
          aiCallsPerMonth: 0,
          storageGB: 0.1,
          teamMembers: 1,
          apiCallsPerDay: 0,
        },
      },
      individual: {
        name: 'Unlimited Premium',
        monthlyPrice: 399,
        yearlyPrice: 3999, // Save $789 (~17% off)
        interval: 'monthly',
        features: [
          'Unlimited Inspections (All Vehicle Types)',
          'Full AI Diagnostic Reports',
          'Vehicle History Integration',
          'AI Assistant Chat (Unlimited)',
          'Priority Support',
          'PDF & Print Reports',
          'Mobile App Access',
          'Smart Inspection Guidance',
        ],
        limits: {
          inspectionsPerMonth: -1, // unlimited
          aiCallsPerMonth: -1,
          storageGB: 10,
          teamMembers: 1,
          apiCallsPerDay: 0,
        },
        recommended: false,
      },
      professional: {
        name: 'Professional',
        monthlyPrice: 899,
        yearlyPrice: 8999, // Save $1,789
        interval: 'monthly',
        features: [
          'Everything in Unlimited Premium',
          'Priority AI Processing (2x Faster)',
          'White-Label Reports (Remove Branding)',
          'API Access (100 calls/day)',
          'Batch Upload (50 vehicles at once)',
          'Advanced Analytics Dashboard',
          'Phone Support',
          'Team Accounts (up to 5 users)',
          'Export to Excel/CRM',
          'Dedicated Account Manager',
        ],
        limits: {
          inspectionsPerMonth: -1,
          aiCallsPerMonth: -1,
          storageGB: 100,
          teamMembers: 5,
          apiCallsPerDay: 100,
        },
      },
      enterprise: {
        name: 'Enterprise',
        monthlyPrice: 2499,
        yearlyPrice: 24999, // Save $4,989
        interval: 'monthly',
        features: [
          'Everything in Professional',
          'Full White-Labeling (Custom Domain)',
          'Unlimited API Calls',
          'Custom AI Model Training',
          'SSO/SAML Integration',
          'Dedicated Account Manager',
          '99.9% Uptime SLA',
          'Unlimited Users',
          'Custom Integrations',
          'On-Premise Deployment Option',
        ],
        limits: {
          inspectionsPerMonth: -1,
          aiCallsPerMonth: -1,
          storageGB: 1000,
          teamMembers: -1, // unlimited
          apiCallsPerDay: -1,
        },
      },
      operator: {
        name: 'Territory Operator License',
        monthlyPrice: 999,
        yearlyPrice: 9999,
        interval: 'monthly',
        features: [
          'Complete White-Label Platform',
          'Exclusive Territory Rights (50-mile radius)',
          'Set Your Own Pricing',
          'Build Your Own Customer Base',
          'Training & Certification (2-day program)',
          'Marketing Playbook & Materials',
          'Co-Branded Option',
          'Dedicated Support Portal',
          'Quarterly Business Reviews',
          'Operator Community Access',
        ],
        limits: {
          inspectionsPerMonth: -1,
          aiCallsPerMonth: -1,
          storageGB: 500,
          teamMembers: -1,
          apiCallsPerDay: -1,
        },
      },
    },

    // Per-Report Pricing (À La Carte) - PREMIUM POSITIONING
    // Priced ~5% below Lemon Squad ($169-199) but offering MORE value
    // AI-powered + instant + comprehensive + includes history & diagnostics
    reports: {
      'Motorcycle': { price: 129.99 },              // vs Lemon Squad ~$149
      'Standard Car/SUV': { price: 159.99 },        // vs Lemon Squad $169 (5% less)
      'Electric Vehicle (EV)': { price: 179.99 },   // vs Lemon Squad $189 (5% less)
      'Classic/Collector Car': { price: 189.99 },   // vs Lemon Squad $199 (5% less)
      'Recreational Vehicle (RV)': { price: 229.99 },     // vs Lemon Squad $249 (8% less)
      'Commercial Truck': { price: 249.99 },        // vs Lemon Squad $269 (7% less)
    },

    // Inspection Bundles (Volume Discount)
    // "5 for the price of 4" premium approach
    bundles: {
      '5-Pack Standard': {
        price: 639.99,   // ~$128 per inspection (20% savings vs $159.99 each)
        inspections: 5,
        savings: 159.96, // vs buying 5 individual at $159.99
        validityDays: 365,
        description: 'Perfect for families shopping for multiple vehicles',
      },
      '10-Pack Professional': {
        price: 1199.99,  // $120 per inspection (25% savings)
        inspections: 10,
        savings: 399.91, // vs buying 10 individual at $159.99
        validityDays: 365,
        description: 'For car flippers and small dealers',
      },
      '20-Pack Commercial': {
        price: 1999.99,  // $100 per inspection (37% savings)
        inspections: 20,
        savings: 1199.81, // vs buying 20 individual at $159.99
        validityDays: 365,
        description: 'Volume pricing for dealerships',
      },
    },

    operator: {
      setupFee: 12500, // One-time territory license fee
      monthlyPlatformFee: 999,
      revenueSharePercent: 15, // 15% of operator's subscription revenue
      minimumTermMonths: 24,
      territoryRadiusMiles: 50,
    },
  },

  FEATURES: {
    flags: {
      inspection: {
        name: 'Vehicle Inspection',
        enabled: true,
        rolloutPercent: 100,
        enabledForTiers: ['free', 'individual', 'professional', 'enterprise', 'operator'],
      },
      diagnostics: {
        name: 'OBD Diagnostics',
        enabled: true,
        rolloutPercent: 100,
        enabledForTiers: ['individual', 'professional', 'enterprise', 'operator'],
      },
      assistant: {
        name: 'AI Assistant Chat',
        enabled: true,
        rolloutPercent: 100,
        enabledForTiers: ['free', 'individual', 'professional', 'enterprise', 'operator'],
      },
      advancedReporting: {
        name: 'Advanced Reporting',
        enabled: true,
        rolloutPercent: 100,
        enabledForTiers: ['professional', 'enterprise', 'operator'],
      },
      whiteLabeling: {
        name: 'White-Label Branding',
        enabled: true,
        rolloutPercent: 100,
        enabledForTiers: ['enterprise', 'operator'],
      },
      apiAccess: {
        name: 'API Access',
        enabled: true,
        rolloutPercent: 100,
        enabledForTiers: ['professional', 'enterprise', 'operator'],
      },
      guidedInspection: {
        name: 'Guided Inspection Mode',
        enabled: true,
        rolloutPercent: 50, // A/B testing
        enabledForTiers: ['free', 'individual', 'professional', 'enterprise', 'operator'],
      },
      deepseekAI: {
        name: 'DeepSeek AI Models',
        enabled: true,
        rolloutPercent: 100,
        enabledForTiers: ['free', 'individual', 'professional', 'enterprise', 'operator'],
      },
      batchProcessing: {
        name: 'Batch Vehicle Processing',
        enabled: true,
        rolloutPercent: 100,
        enabledForTiers: ['professional', 'enterprise', 'operator'],
      },
    },
  },
};
