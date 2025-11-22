// licenseService.ts
import { Operator, OperatorLicense, Territory, WhiteLabelConfig } from '../types';
import { CONFIG } from '../config';
import { createOperatorWhiteLabel } from './whitelabelService';

/**
 * In-memory store for operators and licenses (would be database in production)
 */
const operators: Map<string, Operator> = new Map();
const territories: Map<string, Territory> = new Map();

/**
 * Generate a unique ID
 */
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param lat1 Latitude 1
 * @param lon1 Longitude 1
 * @param lat2 Latitude 2
 * @param lon2 Longitude 2
 * @returns Distance in miles
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Check if a territory overlaps with existing territories
 * @param lat Latitude
 * @param lng Longitude
 * @param radiusMiles Radius in miles
 * @returns True if territory overlaps with an existing one
 */
export const checkTerritoryOverlap = (
  lat: number,
  lng: number,
  radiusMiles: number
): { overlaps: boolean; conflictingTerritories: Territory[] } => {
  const conflicting: Territory[] = [];

  for (const [, territory] of territories) {
    if (territory.status !== 'active') continue;

    const distance = calculateDistance(
      lat,
      lng,
      territory.coordinates.lat,
      territory.coordinates.lng
    );

    // Check if territories overlap (distance < sum of radii)
    if (distance < radiusMiles + territory.radiusMiles) {
      conflicting.push(territory);
    }
  }

  return {
    overlaps: conflicting.length > 0,
    conflictingTerritories: conflicting,
  };
};

/**
 * Create a new territory
 * @param name Territory name
 * @param region Region/city
 * @param state State
 * @param lat Latitude
 * @param lng Longitude
 * @param operatorId Operator ID
 * @param radiusMiles Radius in miles
 * @returns Created territory
 */
export const createTerritory = (
  name: string,
  region: string,
  state: string,
  lat: number,
  lng: number,
  operatorId: string,
  radiusMiles: number = CONFIG.PRICING.operator.territoryRadiusMiles
): Territory => {
  // Check for overlaps
  const { overlaps, conflictingTerritories } = checkTerritoryOverlap(lat, lng, radiusMiles);
  if (overlaps) {
    throw new Error(
      `Territory overlaps with existing territory: ${conflictingTerritories[0].name}`
    );
  }

  const territory: Territory = {
    id: generateId('territory'),
    name,
    region,
    state,
    country: 'USA',
    coordinates: { lat, lng },
    radiusMiles,
    operatorId,
    status: 'active',
    exclusiveUntil: new Date(
      Date.now() + CONFIG.PRICING.operator.minimumTermMonths * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
  };

  territories.set(territory.id, territory);
  return territory;
};

/**
 * Create operator license
 * @param operatorId Operator ID
 * @param territories Array of territories
 * @param customBranding Custom branding configuration
 * @returns Created license
 */
export const createOperatorLicense = (
  operatorId: string,
  territoriesData: Territory[],
  customBranding: WhiteLabelConfig
): OperatorLicense => {
  const license: OperatorLicense = {
    id: generateId('license'),
    operatorId,
    setupFee: CONFIG.PRICING.operator.setupFee,
    monthlyPlatformFee: CONFIG.PRICING.operator.monthlyPlatformFee,
    revenueSharePercent: CONFIG.PRICING.operator.revenueSharePercent,
    territories: territoriesData,
    status: 'active',
    startDate: new Date().toISOString(),
    expirationDate: new Date(
      Date.now() + CONFIG.PRICING.operator.minimumTermMonths * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    minimumTermMonths: CONFIG.PRICING.operator.minimumTermMonths,
    autoRenew: true,
    customBranding,
  };

  return license;
};

/**
 * Register a new operator
 * @param name Operator name
 * @param email Email
 * @param phone Phone
 * @param businessName Business name
 * @param territoryInfo Territory information
 * @param brandingInfo Branding information
 * @returns Created operator
 */
export const registerOperator = (
  name: string,
  email: string,
  phone: string,
  businessName: string,
  territoryInfo: {
    name: string;
    region: string;
    state: string;
    lat: number;
    lng: number;
  },
  brandingInfo: {
    companyName: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    supportEmail: string;
    supportPhone?: string;
    logoUrl?: string;
    customDomain?: string;
  }
): Operator => {
  const operatorId = generateId('operator');

  // Create territory
  const territory = createTerritory(
    territoryInfo.name,
    territoryInfo.region,
    territoryInfo.state,
    territoryInfo.lat,
    territoryInfo.lng,
    operatorId
  );

  // Create white-label configuration
  const whitelabelConfig = createOperatorWhiteLabel(operatorId, {
    companyName: brandingInfo.companyName,
    primaryColor: brandingInfo.primaryColor || '#2563eb',
    secondaryColor: brandingInfo.secondaryColor || '#1e40af',
    accentColor: brandingInfo.accentColor || '#3b82f6',
    supportEmail: brandingInfo.supportEmail,
    supportPhone: brandingInfo.supportPhone,
    logoUrl: brandingInfo.logoUrl,
    customDomain: brandingInfo.customDomain,
  });

  // Create license
  const license = createOperatorLicense(operatorId, [territory], whitelabelConfig);

  // Create operator
  const operator: Operator = {
    id: operatorId,
    name,
    email,
    phone,
    businessName,
    licenses: [license],
    totalSubscribers: 0,
    monthlyRevenue: 0,
    platformFeePaid: false,
    revenueShareOwed: 0,
    status: 'active',
    onboardedDate: new Date().toISOString(),
  };

  operators.set(operatorId, operator);

  console.log(`Operator registered: ${businessName} (${operatorId})`);
  console.log(`Territory: ${territory.name} - ${territory.radiusMiles} mile radius`);
  console.log(`Setup fee: $${license.setupFee}, Monthly: $${license.monthlyPlatformFee}`);

  return operator;
};

/**
 * Get operator by ID
 * @param operatorId Operator ID
 * @returns Operator or null
 */
export const getOperator = (operatorId: string): Operator | null => {
  return operators.get(operatorId) || null;
};

/**
 * Get all operators
 * @returns Array of operators
 */
export const getAllOperators = (): Operator[] => {
  return Array.from(operators.values());
};

/**
 * Get territories by operator ID
 * @param operatorId Operator ID
 * @returns Array of territories
 */
export const getOperatorTerritories = (operatorId: string): Territory[] => {
  const operator = getOperator(operatorId);
  if (!operator) return [];

  return operator.licenses.flatMap(license => license.territories);
};

/**
 * Validate if a user location is within operator territory
 * @param operatorId Operator ID
 * @param userLat User latitude
 * @param userLng User longitude
 * @returns True if within territory
 */
export const validateUserInTerritory = (
  operatorId: string,
  userLat: number,
  userLng: number
): boolean => {
  const territories = getOperatorTerritories(operatorId);

  for (const territory of territories) {
    const distance = calculateDistance(
      userLat,
      userLng,
      territory.coordinates.lat,
      territory.coordinates.lng
    );

    if (distance <= territory.radiusMiles) {
      return true;
    }
  }

  return false;
};

/**
 * Calculate operator revenue share
 * @param operatorId Operator ID
 * @param operatorMonthlyRevenue Operator's monthly revenue from subscriptions
 * @returns Revenue share calculation
 */
export const calculateRevenueShare = (
  operatorId: string,
  operatorMonthlyRevenue: number
): {
  platformFee: number;
  revenueShare: number;
  totalOwed: number;
  operatorNet: number;
} => {
  const operator = getOperator(operatorId);
  if (!operator) {
    throw new Error('Operator not found');
  }

  const license = operator.licenses[0]; // Assume first license for simplicity
  const platformFee = license.monthlyPlatformFee;
  const revenueShare = (operatorMonthlyRevenue * license.revenueSharePercent) / 100;
  const totalOwed = platformFee + revenueShare;
  const operatorNet = operatorMonthlyRevenue - totalOwed;

  return {
    platformFee,
    revenueShare,
    totalOwed,
    operatorNet,
  };
};

/**
 * Update operator revenue
 * @param operatorId Operator ID
 * @param monthlyRevenue Monthly revenue
 */
export const updateOperatorRevenue = (operatorId: string, monthlyRevenue: number): void => {
  const operator = getOperator(operatorId);
  if (!operator) {
    throw new Error('Operator not found');
  }

  const revenueCalc = calculateRevenueShare(operatorId, monthlyRevenue);

  operator.monthlyRevenue = monthlyRevenue;
  operator.revenueShareOwed = revenueCalc.totalOwed;
  operator.platformFeePaid = false; // Mark as unpaid

  operators.set(operatorId, operator);

  console.log(`Operator revenue updated: ${operatorId}`);
  console.log(`Monthly revenue: $${monthlyRevenue}`);
  console.log(`Amount owed to platform: $${revenueCalc.totalOwed}`);
  console.log(`Operator net: $${revenueCalc.operatorNet}`);
};

/**
 * Get available territories (not yet claimed)
 * Returns major US cities as available territories
 */
export const getAvailableTerritories = (): Array<{
  name: string;
  state: string;
  lat: number;
  lng: number;
  population: number;
}> => {
  const majorCities = [
    { name: 'New York', state: 'NY', lat: 40.7128, lng: -74.006, population: 8336817 },
    { name: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437, population: 3979576 },
    { name: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298, population: 2693976 },
    { name: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698, population: 2320268 },
    { name: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.074, population: 1680992 },
    { name: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652, population: 1584064 },
    { name: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936, population: 1547253 },
    { name: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611, population: 1423851 },
    { name: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.797, population: 1343573 },
    { name: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863, population: 1021795 },
  ];

  // Filter out cities that already have territories
  return majorCities.filter(city => {
    const { overlaps } = checkTerritoryOverlap(city.lat, city.lng, CONFIG.PRICING.operator.territoryRadiusMiles);
    return !overlaps;
  });
};

// Example: Create a sample operator for testing
export const createSampleOperator = () => {
  const operator = registerOperator(
    'John Smith',
    'john@autoinspectpro.com',
    '555-0123',
    'Auto Inspect Pro LLC',
    {
      name: 'Miami Metro',
      region: 'Miami',
      state: 'FL',
      lat: 25.7617,
      lng: -80.1918,
    },
    {
      companyName: 'Auto Inspect Pro',
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentColor: '#34d399',
      supportEmail: 'support@autoinspectpro.com',
      supportPhone: '1-800-INSPECT',
      customDomain: 'inspections.autoinspectpro.com',
    }
  );

  console.log('Sample operator created:', operator);
  return operator;
};
