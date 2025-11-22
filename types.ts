// types.ts

// User and authentication types
export type SubscriptionTier = 'free' | 'individual' | 'professional' | 'enterprise' | 'operator';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial' | 'suspended';
export type SubscriptionInterval = 'monthly' | 'yearly';

export interface User {
  id: string;
  email: string;
  plan: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  operatorId?: string; // If user belongs to a territory operator
  tenantId?: string; // For white-label instances
}

// Vehicle data types
export interface Vehicle {
  vin: string;
  make: string;
  model: string;
  year: string;
}

export interface VehicleData {
  make: string;
  model: string;
  year: string;
}

// Inspection-related types
export interface InspectionPhoto {
  id: string;
  category: string;
  base64: string;
  mimeType: string;
  notes?: string;
}

export interface InspectionAudio {
  base64: string;
  mimeType: string;
}

export interface InspectionChecklistItem {
  item: string;
  checked: boolean;
  notes: string;
  photos: InspectionPhoto[];
  audio: InspectionAudio | null;
}

export interface InspectionSection {
  [key: string]: InspectionChecklistItem[];
}

export interface InspectionState {
  vehicle: Vehicle;
  vehicleType: keyof typeof import('./constants').VEHICLE_INSPECTION_TEMPLATES;
  checklist: InspectionSection;
  overallNotes: string;
  odometer: string;
}

// Diagnostic and Chat types
export interface DTCCode {
  code: string;
  description: string;
}

export interface GroundingSource {
  uri: string;
  title?: string;
}

// External data service types
export interface VehicleHistoryReport {
  ownerCount: number;
  hasAccident: boolean;
  accidentDetails: string | null;
  lastOdometerReading: string;
  titleIssues: string | null;
}

export interface SafetyRecall {
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
}

export interface TheftRecord {
  isStolen: boolean;
  isSalvage: boolean;
  details: string;
}

// Final Report types
export interface CompletedReport {
  id: string;
  date: string;
  vehicle: Vehicle;
  summary: {
    overallCondition: string;
    keyFindings: string[];
    recommendations: string[];
  };
  sections: {
    title: string;
    notes: string;
    items: {
      check: string;
      status: 'Pass' | 'Fail' | 'N/A';
      details: string;
      photos: { category: string; url: string; notes?: string }[];
    }[];
  }[];
  vehicleHistory: VehicleHistoryReport;
  safetyRecalls: SafetyRecall[];
  theftAndSalvage: TheftRecord;
}

// Pricing and configuration types
export interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  interval: SubscriptionInterval;
  features: string[];
  limits: {
    inspectionsPerMonth: number; // -1 for unlimited
    aiCallsPerMonth: number;
    storageGB: number;
    teamMembers: number;
    apiCallsPerDay: number;
  };
  recommended?: boolean;
}

export interface SubscriptionUsage {
  inspectionsThisMonth: number;
  aiCallsThisMonth: number;
  storageUsedGB: number;
  periodStart: string;
  periodEnd: string;
}

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  interval: SubscriptionInterval;
  startDate: string;
  endDate: string;
  cancelAtPeriodEnd: boolean;
  usage: SubscriptionUsage;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

// White-label configuration types
export interface BrandingConfig {
  companyName: string;
  logo?: string;
  logoUrl?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customDomain?: string;
  supportEmail: string;
  supportPhone?: string;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

export interface WhiteLabelConfig {
  tenantId: string;
  tenantName: string;
  enabled: boolean;
  branding: BrandingConfig;
  features: {
    inspection: boolean;
    diagnostics: boolean;
    assistant: boolean;
    reports: boolean;
    customReports: boolean;
    apiAccess: boolean;
    whiteLabeling: boolean;
  };
  customPricing?: {
    enabled: boolean;
    plans: { [key in SubscriptionTier]?: PricingPlan };
  };
  operatorId?: string; // Link to operator if this is operator's white-label
}

// Territory and Operator types
export interface Territory {
  id: string;
  name: string;
  region: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radiusMiles: number;
  operatorId: string;
  status: 'active' | 'inactive' | 'suspended';
  exclusiveUntil: string; // ISO date
}

export interface OperatorLicense {
  id: string;
  operatorId: string;
  setupFee: number;
  monthlyPlatformFee: number;
  revenueSharePercent: number;
  territories: Territory[];
  status: 'active' | 'expired' | 'suspended';
  startDate: string;
  expirationDate: string;
  minimumTermMonths: number;
  autoRenew: boolean;
  customBranding: WhiteLabelConfig;
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  licenses: OperatorLicense[];
  totalSubscribers: number;
  monthlyRevenue: number;
  platformFeePaid: boolean;
  revenueShareOwed: number;
  status: 'active' | 'suspended' | 'delinquent';
  onboardedDate: string;
  certificationDate?: string;
}

// AI Provider types
export type AIProvider = 'gemini' | 'deepseek' | 'openai';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  modelName: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIModelOption {
  provider: AIProvider;
  modelName: string;
  displayName: string;
  costPerMillionTokens: number;
  capabilities: {
    vision: boolean;
    reasoning: boolean;
    chat: boolean;
    codeAnalysis: boolean;
  };
  availableForTiers: SubscriptionTier[];
}

// Feature flags
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercent: number; // 0-100
  enabledForUsers?: string[];
  enabledForTiers?: SubscriptionTier[];
  enabledForOperators?: string[];
}
