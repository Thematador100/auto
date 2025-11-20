// config.ts

import { PricingPlan } from './types';

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
