// config.ts

import { PricingPlan, WhiteLabelConfig } from './types';

interface ReportPricing {
  [key: string]: { price: number };
}

interface Config {
  BRANDING: {
    companyName: string;
  };
  PRICING: {
    plans: {
      pro: PricingPlan;
    };
    reports: ReportPricing;
  };
}

export const CONFIG: Config = {
  BRANDING: {
    companyName: 'AI Auto Pro',
  },
  PRICING: {
    plans: {
      pro: {
        name: 'Pro',
        price: '$49.99 / mo',
        features: [
          'Unlimited Vehicle Inspections',
          'AI-Powered Report Summaries',
          'Vehicle History Integration',
          'Diagnostic Code Analysis',
          'AI Assistant Chat',
        ],
      },
    },
    reports: {
      'Standard Car/SUV': { price: 19.99 },
      'Electric Vehicle (EV)': { price: 24.99 },
      'Commercial Truck': { price: 39.99 },
      'Recreational Vehicle (RV)': { price: 34.99 },
      'Classic/Collector Car': { price: 29.99 },
      'Motorcycle': { price: 14.99 },
    },
  },
};

// White Label Configuration Management
// Each white label customer stores their configuration in localStorage
const WHITE_LABEL_CONFIG_KEY = 'ai-auto-pro-white-label-config';

export function getWhiteLabelConfig(): WhiteLabelConfig | null {
  const stored = localStorage.getItem(WHITE_LABEL_CONFIG_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as WhiteLabelConfig;
  } catch {
    return null;
  }
}

export function setWhiteLabelConfig(config: WhiteLabelConfig): void {
  localStorage.setItem(WHITE_LABEL_CONFIG_KEY, JSON.stringify(config));
  // Apply branding changes
  if (config.primaryColor) {
    document.documentElement.style.setProperty('--primary', config.primaryColor);
  }
}

export function clearWhiteLabelConfig(): void {
  localStorage.removeItem(WHITE_LABEL_CONFIG_KEY);
}

// Get active Stripe publishable key (from white label config or default)
export function getStripePublishableKey(): string | null {
  const whiteLabelConfig = getWhiteLabelConfig();
  if (whiteLabelConfig?.stripePublishableKey) {
    return whiteLabelConfig.stripePublishableKey;
  }
  // Return default/demo Stripe key if no white label config
  // Note: Replace with your own test key or return null to require configuration
  return null;
}

// Get active company name
export function getCompanyName(): string {
  const whiteLabelConfig = getWhiteLabelConfig();
  return whiteLabelConfig?.companyName || CONFIG.BRANDING.companyName;
}
