// whitelabelService.ts
import { WhiteLabelConfig, BrandingConfig } from '../types';
import { CONFIG } from '../config';

/**
 * Default white-label configuration (uses CONFIG.BRANDING)
 */
export const DEFAULT_WHITELABEL_CONFIG: WhiteLabelConfig = {
  tenantId: 'default',
  tenantName: 'AI Auto Pro',
  enabled: false,
  branding: CONFIG.BRANDING,
  features: {
    inspection: true,
    diagnostics: true,
    assistant: true,
    reports: true,
    customReports: false,
    apiAccess: false,
    whiteLabeling: false,
  },
};

/**
 * In-memory store for white-label configs (would be database in production)
 */
const whitelabelConfigs: Map<string, WhiteLabelConfig> = new Map();

/**
 * Initialize default config
 */
whitelabelConfigs.set('default', DEFAULT_WHITELABEL_CONFIG);

/**
 * Get white-label configuration by tenant ID
 * @param tenantId Tenant identifier (can be subdomain, custom domain, or operator ID)
 * @returns White-label configuration
 */
export const getWhiteLabelConfig = (tenantId: string = 'default'): WhiteLabelConfig => {
  const config = whitelabelConfigs.get(tenantId);
  return config || DEFAULT_WHITELABEL_CONFIG;
};

/**
 * Get white-label configuration from current domain
 * Checks:
 * 1. Custom domain mapping
 * 2. Subdomain (e.g., operator123.aiautopro.com)
 * 3. URL parameter (?tenant=xyz)
 * 4. LocalStorage (for testing)
 */
export const getWhiteLabelConfigFromDomain = (): WhiteLabelConfig => {
  // Check localStorage first (for testing/development)
  const localTenantId = localStorage.getItem('whitelabel_tenant_id');
  if (localTenantId) {
    return getWhiteLabelConfig(localTenantId);
  }

  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const urlTenantId = urlParams.get('tenant');
  if (urlTenantId) {
    // Save to localStorage for session persistence
    localStorage.setItem('whitelabel_tenant_id', urlTenantId);
    return getWhiteLabelConfig(urlTenantId);
  }

  // Check subdomain (e.g., operator123.aiautopro.com)
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    const subdomain = parts[0];
    const config = getWhiteLabelConfig(subdomain);
    if (config.tenantId !== 'default') {
      return config;
    }
  }

  // Check custom domain mapping (would query backend in production)
  const customDomainConfig = getWhiteLabelConfigByCustomDomain(hostname);
  if (customDomainConfig) {
    return customDomainConfig;
  }

  return DEFAULT_WHITELABEL_CONFIG;
};

/**
 * Get white-label config by custom domain
 * @param domain Custom domain
 * @returns White-label configuration or null
 */
export const getWhiteLabelConfigByCustomDomain = (domain: string): WhiteLabelConfig | null => {
  // In production, this would query a backend API
  // For now, iterate through configs to find matching custom domain
  for (const [, config] of whitelabelConfigs) {
    if (config.branding.customDomain === domain) {
      return config;
    }
  }
  return null;
};

/**
 * Create or update white-label configuration
 * @param config White-label configuration
 */
export const setWhiteLabelConfig = (config: WhiteLabelConfig): void => {
  whitelabelConfigs.set(config.tenantId, config);

  // In production, this would persist to backend database
  console.log(`White-label config saved for tenant: ${config.tenantId}`);
};

/**
 * Create white-label configuration for an operator
 * @param operatorId Operator ID
 * @param branding Branding configuration
 * @param customFeatures Optional custom features
 * @returns Created white-label configuration
 */
export const createOperatorWhiteLabel = (
  operatorId: string,
  branding: Partial<BrandingConfig>,
  customFeatures?: Partial<WhiteLabelConfig['features']>
): WhiteLabelConfig => {
  const config: WhiteLabelConfig = {
    tenantId: operatorId,
    tenantName: branding.companyName || 'Auto Inspection Pro',
    enabled: true,
    branding: {
      ...CONFIG.BRANDING,
      ...branding,
    },
    features: {
      inspection: true,
      diagnostics: true,
      assistant: true,
      reports: true,
      customReports: true,
      apiAccess: true,
      whiteLabeling: true,
      ...customFeatures,
    },
    operatorId,
  };

  setWhiteLabelConfig(config);
  return config;
};

/**
 * Apply white-label branding to the document
 * Updates CSS variables, favicon, title, etc.
 * @param config White-label configuration
 */
export const applyWhiteLabelBranding = (config: WhiteLabelConfig): void => {
  const { branding } = config;

  // Update CSS variables
  const root = document.documentElement;
  root.style.setProperty('--color-primary', branding.primaryColor);
  root.style.setProperty('--color-secondary', branding.secondaryColor);
  root.style.setProperty('--color-accent', branding.accentColor);

  // Update page title
  document.title = branding.companyName;

  // Update favicon if provided
  if (branding.favicon) {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = branding.favicon;
    document.getElementsByTagName('head')[0].appendChild(link);
  }

  // Add meta tags
  const metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement || document.createElement('meta');
  metaThemeColor.name = 'theme-color';
  metaThemeColor.content = branding.primaryColor;
  if (!metaThemeColor.parentElement) {
    document.getElementsByTagName('head')[0].appendChild(metaThemeColor);
  }

  console.log(`Applied white-label branding for: ${branding.companyName}`);
};

/**
 * Check if a feature is enabled for the current tenant
 * @param featureName Feature name
 * @param config White-label configuration
 * @returns True if feature is enabled
 */
export const isFeatureEnabled = (
  featureName: keyof WhiteLabelConfig['features'],
  config: WhiteLabelConfig
): boolean => {
  return config.features[featureName] ?? false;
};

/**
 * Get pricing for tenant (can be customized per tenant)
 * @param config White-label configuration
 * @returns Pricing configuration
 */
export const getTenantPricing = (config: WhiteLabelConfig) => {
  if (config.customPricing?.enabled && config.customPricing.plans) {
    return config.customPricing.plans;
  }
  return CONFIG.PRICING.plans;
};

// Example: Create a sample operator white-label config for testing
export const createSampleOperatorConfig = () => {
  const sampleConfig = createOperatorWhiteLabel(
    'operator-sample-123',
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

  console.log('Sample operator white-label config created:', sampleConfig);
  return sampleConfig;
};
