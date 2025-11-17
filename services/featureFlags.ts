/**
 * Feature Flags Service
 * Centralized system for enabling/disabling features dynamically
 */

export interface FeatureFlags {
  // Landing pages
  publicLandingPage: boolean;
  leadGenerationPage: boolean;
  affiliateProgramPage: boolean;

  // Core features
  aiAssistant: boolean;
  obdDiagnostics: boolean;
  vinScanner: boolean;
  audioRecording: boolean;
  pdfExport: boolean;

  // Advanced features
  vehicleHistory: boolean;
  offlineMode: boolean;
  paymentProcessing: boolean;

  // Admin features
  adminPanel: boolean;
  analytics: boolean;

  // Experimental features
  aiSeoOptimization: boolean;
  multiLanguage: boolean;
  darkMode: boolean;
}

// Default feature flag configuration
const defaultFlags: FeatureFlags = {
  // Landing pages - enabled by default
  publicLandingPage: true,
  leadGenerationPage: true,
  affiliateProgramPage: true,

  // Core features - enabled
  aiAssistant: true,
  obdDiagnostics: true,
  vinScanner: true,
  audioRecording: true,
  pdfExport: true,

  // Advanced features - enabled
  vehicleHistory: true,
  offlineMode: true,
  paymentProcessing: true,

  // Admin features - enabled for pro users
  adminPanel: true,
  analytics: true,

  // Experimental features - can be toggled
  aiSeoOptimization: true,
  multiLanguage: false,
  darkMode: true,
};

class FeatureFlagService {
  private flags: FeatureFlags;
  private storageKey = 'app_feature_flags';

  constructor() {
    this.flags = this.loadFlags();
  }

  /**
   * Load feature flags from localStorage or use defaults
   */
  private loadFlags(): FeatureFlags {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedFlags = JSON.parse(stored);
        // Merge with defaults to ensure new flags are included
        return { ...defaultFlags, ...parsedFlags };
      }
    } catch (error) {
      console.error('Error loading feature flags:', error);
    }
    return { ...defaultFlags };
  }

  /**
   * Save feature flags to localStorage
   */
  private saveFlags(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.flags));
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature] ?? false;
  }

  /**
   * Enable a feature
   */
  enable(feature: keyof FeatureFlags): void {
    this.flags[feature] = true;
    this.saveFlags();
  }

  /**
   * Disable a feature
   */
  disable(feature: keyof FeatureFlags): void {
    this.flags[feature] = false;
    this.saveFlags();
  }

  /**
   * Toggle a feature
   */
  toggle(feature: keyof FeatureFlags): boolean {
    this.flags[feature] = !this.flags[feature];
    this.saveFlags();
    return this.flags[feature];
  }

  /**
   * Get all feature flags
   */
  getAll(): FeatureFlags {
    return { ...this.flags };
  }

  /**
   * Set multiple features at once
   */
  setFlags(flags: Partial<FeatureFlags>): void {
    this.flags = { ...this.flags, ...flags };
    this.saveFlags();
  }

  /**
   * Reset to default flags
   */
  reset(): void {
    this.flags = { ...defaultFlags };
    this.saveFlags();
  }

  /**
   * Enable all features (for testing/development)
   */
  enableAll(): void {
    Object.keys(this.flags).forEach((key) => {
      this.flags[key as keyof FeatureFlags] = true;
    });
    this.saveFlags();
  }

  /**
   * Disable all features (for testing)
   */
  disableAll(): void {
    Object.keys(this.flags).forEach((key) => {
      this.flags[key as keyof FeatureFlags] = false;
    });
    this.saveFlags();
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagService();

// React hook for using feature flags in components
import { useState, useEffect } from 'react';

export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  const [isEnabled, setIsEnabled] = useState(() => featureFlags.isEnabled(feature));

  useEffect(() => {
    // Update if flags change
    const checkFlag = () => {
      setIsEnabled(featureFlags.isEnabled(feature));
    };

    // Listen for storage changes (for multi-tab sync)
    window.addEventListener('storage', checkFlag);
    return () => window.removeEventListener('storage', checkFlag);
  }, [feature]);

  return isEnabled;
}

export default featureFlags;
