// types.ts

// User and authentication types
export interface User {
  id: string;
  email: string;
  plan: 'pro' | 'basic';
  name?: string;
  role: 'inspector' | 'customer' | 'admin';
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
  vehicleHistory?: VehicleHistoryReport;
  safetyRecalls: SafetyRecall[];
  theftAndSalvage?: TheftRecord;
  inspectorId: string;
  customerId?: string;
  status: 'in-progress' | 'completed' | 'submitted' | 'reviewed';
  completedAt?: string;
  submittedAt?: string;
}

// Pricing and configuration types
export interface PricingPlan {
  name: string;
  price: string;
  features: string[];
}

// Customer Satisfaction types
export interface CustomerFeedback {
  id: string;
  reportId: string;
  customerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  date: string;
  wouldRecommend: boolean;
  aspects: {
    thoroughness: number;
    clarity: number;
    timeliness: number;
    professionalism: number;
  };
}

// Notification types
export interface Notification {
  id: string;
  type: 'job-completed' | 'feedback-received' | 'report-submitted' | 'system-alert';
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedId?: string;
  priority: 'low' | 'medium' | 'high';
}

// Help and Tutorial types
export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: 'getting-started' | 'inspections' | 'reports' | 'troubleshooting' | 'faq';
  searchKeywords: string[];
}

export interface TutorialStep {
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}
