// featureFlagsService.ts
import { FeatureFlag, SubscriptionTier } from '../types';
import { CONFIG } from '../config';

/**
 * Check if a feature is enabled for a user
 * @param featureName Feature name
 * @param userId User ID (optional)
 * @param userTier User subscription tier (optional)
 * @param operatorId Operator ID (optional)
 * @returns True if feature is enabled
 */
export const isFeatureEnabled = (
  featureName: string,
  userId?: string,
  userTier?: SubscriptionTier,
  operatorId?: string
): boolean => {
  const flag = CONFIG.FEATURES.flags[featureName];

  if (!flag) {
    console.warn(`Feature flag not found: ${featureName}`);
    return false;
  }

  // Check if feature is globally disabled
  if (!flag.enabled) {
    return false;
  }

  // Check user whitelist (always enabled for specific users)
  if (userId && flag.enabledForUsers?.includes(userId)) {
    return true;
  }

  // Check tier restrictions
  if (userTier && flag.enabledForTiers && !flag.enabledForTiers.includes(userTier)) {
    return false;
  }

  // Check operator restrictions
  if (operatorId && flag.enabledForOperators && !flag.enabledForOperators.includes(operatorId)) {
    return false;
  }

  // Check rollout percentage (A/B testing)
  if (flag.rolloutPercent < 100) {
    // Deterministic rollout based on user ID
    if (userId) {
      const hash = simpleHash(userId);
      const userPercent = hash % 100;
      return userPercent < flag.rolloutPercent;
    } else {
      // Random rollout if no user ID
      return Math.random() * 100 < flag.rolloutPercent;
    }
  }

  return true;
};

/**
 * Simple hash function for deterministic A/B testing
 * @param str String to hash
 * @returns Hash value
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Get all features enabled for a user
 * @param userId User ID
 * @param userTier User subscription tier
 * @param operatorId Operator ID (optional)
 * @returns Object with feature flags
 */
export const getUserFeatures = (
  userId: string,
  userTier: SubscriptionTier,
  operatorId?: string
): { [key: string]: boolean } => {
  const features: { [key: string]: boolean } = {};

  for (const featureName in CONFIG.FEATURES.flags) {
    features[featureName] = isFeatureEnabled(featureName, userId, userTier, operatorId);
  }

  return features;
};

/**
 * Get feature flag details
 * @param featureName Feature name
 * @returns Feature flag or null
 */
export const getFeatureFlag = (featureName: string): FeatureFlag | null => {
  return CONFIG.FEATURES.flags[featureName] || null;
};

/**
 * Get all feature flags
 * @returns All feature flags
 */
export const getAllFeatureFlags = (): { [key: string]: FeatureFlag } => {
  return CONFIG.FEATURES.flags;
};

/**
 * Check if user has access to a specific tier's features
 * @param userTier User's subscription tier
 * @param requiredTier Required tier
 * @returns True if user has access
 */
export const hasTierAccess = (
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean => {
  const tierHierarchy: SubscriptionTier[] = [
    'free',
    'individual',
    'professional',
    'enterprise',
    'operator',
  ];

  const userTierIndex = tierHierarchy.indexOf(userTier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);

  return userTierIndex >= requiredTierIndex;
};

/**
 * Log feature flag usage (for analytics)
 * @param featureName Feature name
 * @param userId User ID
 * @param enabled Whether feature was enabled
 */
export const logFeatureUsage = (
  featureName: string,
  userId: string,
  enabled: boolean
): void => {
  // In production, send to analytics service
  console.log(`Feature: ${featureName}, User: ${userId}, Enabled: ${enabled}`);

  // Could integrate with analytics services like:
  // - Google Analytics
  // - Mixpanel
  // - Amplitude
  // - Custom analytics backend
};

/**
 * Get features available for a subscription tier
 * @param tier Subscription tier
 * @returns List of enabled feature names
 */
export const getTierFeatures = (tier: SubscriptionTier): string[] => {
  const features: string[] = [];

  for (const [featureName, flag] of Object.entries(CONFIG.FEATURES.flags)) {
    if (flag.enabledForTiers?.includes(tier)) {
      features.push(featureName);
    }
  }

  return features;
};
