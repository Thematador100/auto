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
        name: 'Free',
        monthlyPrice: 0,
        yearlyPrice: 0,
        interval: 'monthly',
        features: [
          '1 Basic Inspection per Month',
          'VIN Decoder',
          'Basic AI Chat (10 messages/month)',
          'Standard Vehicles Only',
          'Community Support',
          'Ads Displayed',
        ],
        limits: {
          inspectionsPerMonth: 1,
          aiCallsPerMonth: 10,
          storageGB: 0.5,
          teamMembers: 1,
          apiCallsPerDay: 0,
        },
      },
      individual: {
        name: 'Individual',
        monthlyPrice: 89.99,
        yearlyPrice: 799, // Save $279
        interval: 'monthly',
        features: [
          'Unlimited Inspections',
          'All Vehicle Types',
          'Full AI Diagnostic Reports',
          'History Report Integration',
          'Unlimited AI Assistant',
          'Email Support',
          'PDF Reports',
          'No Ads',
        ],
        limits: {
          inspectionsPerMonth: -1, // unlimited
          aiCallsPerMonth: -1,
          storageGB: 10,
          teamMembers: 1,
          apiCallsPerDay: 0,
        },
        recommended: true,
      },
      professional: {
        name: 'Professional',
        monthlyPrice: 299,
        yearlyPrice: 2999, // Save $590
        interval: 'monthly',
        features: [
          'Everything in Individual',
          'Priority AI Processing (2x Faster)',
          'White-Label Reports',
          'API Access (100 calls/day)',
          'Batch Upload (50 vehicles)',
          'Advanced Analytics Dashboard',
          'Phone Support',
          'Team Accounts (up to 5 users)',
          'Export to Excel/CRM',
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
        name: 'Territory Operator',
        monthlyPrice: 999,
        yearlyPrice: 9999,
        interval: 'monthly',
        features: [
          'Complete White-Label Platform',
          'Exclusive Territory Rights (50-mile radius)',
          'Custom Pricing Control',
          'Your Own Customer Base',
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

    reports: {
      'Standard Car/SUV': { price: 39.99 },
      'Electric Vehicle (EV)': { price: 44.99 },
      'Commercial Truck': { price: 59.99 },
      'Recreational Vehicle (RV)': { price: 54.99 },
      'Classic/Collector Car': { price: 49.99 },
      'Motorcycle': { price: 29.99 },
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
