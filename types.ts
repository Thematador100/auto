// types.ts

// User and authentication types
export type UserRole = 'admin' | 'inspector' | 'viewer';
export type UserPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan: UserPlan;
  companyId?: string;
  companyName?: string;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  trialEndsAt?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends AuthCredentials {
  name: string;
  companyName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Company/White Label types
export interface WhiteLabelConfig {
  id: string;
  companyId: string;
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain?: string;
  emailFrom: string;
  supportEmail: string;
  showBranding: boolean;
  customCss?: string;
  favicon?: string;
}

export interface Company {
  id: string;
  name: string;
  plan: UserPlan;
  maxUsers: number;
  currentUsers: number;
  whiteLabelConfig?: WhiteLabelConfig;
  createdAt: string;
  owner: string;
  stripeCustomerId?: string;
  subscriptionId?: string;
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
  id: string;
  name: string;
  displayName: string;
  price: number;
  priceDisplay: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId?: string;
  maxUsers?: number;
  maxInspections?: number;
  isPopular?: boolean;
}

// Payment types
export interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  invoiceUrl?: string;
  description: string;
}

export interface Subscription {
  id: string;
  plan: PricingPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// Analytics types
export interface InspectionStats {
  totalInspections: number;
  thisMonth: number;
  thisWeek: number;
  avgPerDay: number;
  byVehicleType: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface UserActivity {
  date: string;
  inspections: number;
  reports: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalInspections: number;
  revenue: number;
  revenueGrowth: number;
  newUsersThisMonth: number;
  usersByPlan: Record<string, number>;
  recentActivity: UserActivity[];
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Team collaboration types
export interface TeamMember {
  id: string;
  userId: string;
  companyId: string;
  role: UserRole;
  permissions: string[];
  addedAt: string;
  addedBy: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'inspections' | 'reports' | 'users' | 'settings' | 'billing';
}
