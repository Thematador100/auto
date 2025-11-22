// useWhiteLabelConfig.ts
import { useState, useEffect } from 'react';
import { WhiteLabelConfig } from '../types';
import {
  getWhiteLabelConfigFromDomain,
  applyWhiteLabelBranding,
  DEFAULT_WHITELABEL_CONFIG,
} from '../services/whitelabelService';

/**
 * Hook to manage white-label configuration
 * @returns White-label configuration and utilities
 */
export const useWhiteLabelConfig = () => {
  const [config, setConfig] = useState<WhiteLabelConfig>(DEFAULT_WHITELABEL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load white-label configuration on mount
    const loadConfig = async () => {
      try {
        setIsLoading(true);

        // Get config from domain/URL/localStorage
        const whitelabelConfig = getWhiteLabelConfigFromDomain();

        // Apply branding to document
        if (whitelabelConfig.enabled) {
          applyWhiteLabelBranding(whitelabelConfig);
        }

        setConfig(whitelabelConfig);
      } catch (error) {
        console.error('Error loading white-label config:', error);
        setConfig(DEFAULT_WHITELABEL_CONFIG);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  return {
    config,
    branding: config.branding,
    features: config.features,
    isWhiteLabeled: config.enabled,
    tenantId: config.tenantId,
    isLoading,
  };
};
