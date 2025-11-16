// config.ts

import { PricingPlan } from './types';

interface ReportPricing {
  [key: string]: { price: number };
}

interface MobileInspectionPricing {
  [key: string]: { price: number; originalPrice: number };
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
    mobileInspections: MobileInspectionPricing;
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
    // Mobile on-site inspection services (competing with LemonSquad at $119.95)
    // Our pricing: 5% less = $113.95 for standard
    mobileInspections: {
      'Standard Car/SUV': { price: 113.95, originalPrice: 119.95 },
      'Electric Vehicle (EV)': { price: 132.95, originalPrice: 139.95 },
      'Commercial Truck': { price: 189.95, originalPrice: 199.95 },
      'Recreational Vehicle (RV)': { price: 237.95, originalPrice: 249.95 },
      'Classic/Vintage Car': { price: 161.95, originalPrice: 169.95 },
      'Motorcycle': { price: 94.95, originalPrice: 99.95 },
    },
  },
};
