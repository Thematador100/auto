/**
 * Self-Repair System Integration Example
 *
 * This file demonstrates how to integrate all self-repair components
 * into your application for maximum resilience.
 */

import { healthMonitor, StandardHealthChecks, HealthStatus } from './healthMonitor';
import { circuitBreakerRegistry } from './circuitBreaker';
import { StateRecoveryManager, validateInspectionState, repairInspectionState, AutoSaveManager } from './stateRecovery';
import { diagnosticsService, Logger } from './diagnosticsService';
import { SafeStorage } from './errorRecoveryService';
import { InspectionState, Vehicle } from '../types';

/**
 * Initialize the self-repair system
 * Call this once when your application starts
 */
export function initializeSelfRepairSystem(): void {
  Logger.info('SelfRepair', 'Initializing self-repair system...');

  // 1. Register health checks
  registerHealthChecks();

  // 2. Start health monitoring
  healthMonitor.startMonitoring();

  // 3. Set up error handlers
  setupGlobalErrorHandlers();

  // 4. Initialize circuit breakers (already done in geminiService.ts)
  Logger.info('SelfRepair', 'Circuit breakers initialized for API services');

  // 5. Load any persisted error logs
  loadPersistedErrors();

  Logger.info('SelfRepair', 'Self-repair system initialized successfully');
}

/**
 * Register all health checks for the application
 */
function registerHealthChecks(): void {
  // Check localStorage health
  healthMonitor.registerCheck(
    'localStorage',
    StandardHealthChecks.localStorage,
    {
      intervalMs: 60000, // Check every minute
      maxFailures: 2,
      repair: async () => {
        Logger.warn('SelfRepair', 'Attempting to repair localStorage');
        try {
          // Clear some space
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('temp-') || key?.startsWith('cache-')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
          Logger.info('SelfRepair', `Removed ${keysToRemove.length} temporary items from localStorage`);
        } catch (error: any) {
          Logger.error('SelfRepair', 'Failed to repair localStorage', {}, error);
        }
      }
    }
  );

  // Check memory health
  healthMonitor.registerCheck(
    'memory',
    StandardHealthChecks.memory,
    {
      intervalMs: 30000, // Check every 30 seconds
      maxFailures: 3,
      repair: async () => {
        Logger.warn('SelfRepair', 'High memory usage detected, attempting cleanup');
        // Trigger garbage collection hint (not guaranteed in all browsers)
        if (global.gc) {
          global.gc();
        }
        // Clear diagnostic logs to free memory
        diagnosticsService.clearLogs();
        Logger.info('SelfRepair', 'Memory cleanup completed');
      }
    }
  );

  // Check network health
  healthMonitor.registerCheck(
    'network',
    StandardHealthChecks.network,
    {
      intervalMs: 30000, // Check every 30 seconds
      maxFailures: 2,
      repair: async () => {
        Logger.warn('SelfRepair', 'Network connectivity issues detected');
        // Could switch to offline mode here
        SafeStorage.set('offline-mode', true);
      }
    }
  );

  // Check Gemini API health
  healthMonitor.registerCheck(
    'gemini-api',
    async () => {
      const breaker = circuitBreakerRegistry.get('dtc-analysis');
      if (!breaker) {
        return { healthy: true, message: 'Circuit breaker not initialized yet' };
      }

      const stats = breaker.getStats();

      if (stats.state === 'OPEN') {
        return {
          healthy: false,
          message: 'Gemini API circuit is OPEN (service unavailable)',
          metadata: stats
        };
      }

      if (stats.state === 'HALF_OPEN') {
        return {
          healthy: false,
          message: 'Gemini API circuit is HALF_OPEN (testing recovery)',
          metadata: stats
        };
      }

      // Check success rate
      const successRate = stats.totalRequests > 0
        ? (stats.totalSuccesses / stats.totalRequests) * 100
        : 100;

      if (successRate < 50) {
        return {
          healthy: false,
          message: `Gemini API success rate too low: ${successRate.toFixed(1)}%`,
          metadata: stats
        };
      }

      return {
        healthy: true,
        message: `Gemini API healthy (${successRate.toFixed(1)}% success rate)`,
        metadata: stats
      };
    },
    {
      intervalMs: 45000, // Check every 45 seconds
      maxFailures: 3,
      repair: async () => {
        Logger.warn('SelfRepair', 'Attempting to repair Gemini API connection');
        // Reset circuit breaker
        const breaker = circuitBreakerRegistry.get('dtc-analysis');
        if (breaker) {
          breaker.reset();
          Logger.info('SelfRepair', 'Reset Gemini API circuit breaker');
        }
      }
    }
  );

  Logger.info('SelfRepair', 'All health checks registered');
}

/**
 * Set up global error handlers
 */
function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    Logger.error(
      'GlobalError',
      'Unhandled promise rejection',
      {
        reason: event.reason,
        promise: event.promise
      },
      event.reason instanceof Error ? event.reason : undefined
    );

    // Prevent default handling
    event.preventDefault();

    // Track in diagnostics
    diagnosticsService.trackRequest(false);
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    Logger.error(
      'GlobalError',
      'Global error caught',
      {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      event.error
    );

    // Track in diagnostics
    diagnosticsService.trackRequest(false);
  });

  Logger.info('SelfRepair', 'Global error handlers installed');
}

/**
 * Load persisted errors from previous sessions
 */
function loadPersistedErrors(): void {
  try {
    const errorLog = localStorage.getItem('error_log');
    if (errorLog) {
      const errors = JSON.parse(errorLog);
      Logger.info('SelfRepair', `Loaded ${errors.length} persisted errors from previous session`);
    }
  } catch (error) {
    Logger.warn('SelfRepair', 'Failed to load persisted errors');
  }
}

/**
 * Create an inspection state manager with auto-save
 * Use this in your components that manage inspection state
 */
export function createInspectionStateManager(initialState: InspectionState) {
  const defaultState: InspectionState = {
    vehicle: {
      vin: '',
      make: '',
      model: '',
      year: new Date().getFullYear().toString()
    },
    vehicleType: 'sedan',
    checklist: {},
    overallNotes: '',
    odometer: ''
  };

  // Create state recovery manager
  const stateManager = new StateRecoveryManager<InspectionState>(
    initialState || defaultState,
    'current-inspection-state',
    5 // Keep 5 snapshots
  );

  // Create auto-save manager
  const autoSave = new AutoSaveManager(
    () => {
      const state = stateManager.getState();

      // Validate before saving
      if (!validateInspectionState(state)) {
        Logger.warn('StateManager', 'State validation failed, attempting repair');
        stateManager.repairState(repairInspectionState);
      }

      Logger.debug('StateManager', 'Auto-save triggered');
    },
    30000 // Auto-save every 30 seconds
  );

  return {
    /**
     * Get current state
     */
    getState: (): InspectionState => {
      return stateManager.getState();
    },

    /**
     * Update state
     */
    updateState: (newState: InspectionState) => {
      // Validate new state
      if (!validateInspectionState(newState)) {
        Logger.warn('StateManager', 'Invalid state provided, repairing');
        newState = repairInspectionState(newState);
      }

      stateManager.updateState(newState, true);
      autoSave.markDirty();

      Logger.debug('StateManager', 'State updated');
    },

    /**
     * Force immediate save
     */
    save: () => {
      autoSave.forceSave();
      Logger.info('StateManager', 'State saved');
    },

    /**
     * Recover from snapshot
     */
    recover: (snapshotIndex: number = 0) => {
      const success = stateManager.recoverFromSnapshot(snapshotIndex);
      if (success) {
        Logger.info('StateManager', `Recovered from snapshot ${snapshotIndex}`);
      } else {
        Logger.error('StateManager', `Failed to recover from snapshot ${snapshotIndex}`);
      }
      return success;
    },

    /**
     * Get available snapshots
     */
    getSnapshots: () => {
      return stateManager.getSnapshots();
    },

    /**
     * Check for unsaved changes
     */
    hasUnsavedChanges: () => {
      return autoSave.hasUnsavedChanges();
    },

    /**
     * Cleanup
     */
    cleanup: () => {
      autoSave.stop();
      Logger.info('StateManager', 'Cleanup completed');
    }
  };
}

/**
 * Get system diagnostics
 * Call this to display system health to users or for debugging
 */
export async function getSystemDiagnostics() {
  const report = await diagnosticsService.generateDiagnosticsReport();

  return {
    // Overall health
    isHealthy: report.systemHealth.overall === HealthStatus.HEALTHY,
    healthStatus: report.systemHealth.overall,

    // Individual component health
    components: report.systemHealth.checks.map(check => ({
      name: check.name,
      status: check.status,
      message: check.message,
      consecutiveFailures: check.consecutiveFailures
    })),

    // Circuit breakers
    circuitBreakers: Object.entries(report.circuitBreakers).map(([name, stats]) => ({
      name,
      state: (stats as any).state,
      totalRequests: (stats as any).totalRequests,
      successRate: (stats as any).totalRequests > 0
        ? ((stats as any).totalSuccesses / (stats as any).totalRequests * 100).toFixed(1) + '%'
        : 'N/A'
    })),

    // Performance metrics
    performance: {
      uptime: Math.round(report.performanceMetrics.uptime / 1000 / 60) + ' minutes',
      totalRequests: report.performanceMetrics.totalRequests,
      successRate: report.performanceMetrics.totalRequests > 0
        ? (report.performanceMetrics.successfulRequests / report.performanceMetrics.totalRequests * 100).toFixed(1) + '%'
        : 'N/A',
      averageResponseTime: report.performanceMetrics.averageResponseTime.toFixed(0) + 'ms',
      memoryUsage: report.performanceMetrics.memoryUsage
        ? report.performanceMetrics.memoryUsage.percentage.toFixed(1) + '%'
        : 'N/A'
    },

    // Storage info
    storage: {
      available: report.storageInfo.available,
      keys: report.storageInfo.usage.keys,
      estimatedSize: (report.storageInfo.usage.estimatedSize / 1024).toFixed(1) + ' KB',
      quota: report.storageInfo.quota
        ? report.storageInfo.quota.percentage.toFixed(1) + '%'
        : 'N/A'
    },

    // Recent errors
    recentErrors: report.recentErrors.slice(0, 5).map(error => ({
      timestamp: new Date(error.timestamp).toLocaleString(),
      category: error.category,
      message: error.message,
      level: error.level
    }))
  };
}

/**
 * Manual recovery trigger
 * Call this if you want to manually trigger system recovery
 */
export async function triggerManualRecovery(): Promise<void> {
  Logger.info('SelfRepair', 'Manual recovery triggered');

  // Reset all circuit breakers
  circuitBreakerRegistry.resetAll();
  Logger.info('SelfRepair', 'All circuit breakers reset');

  // Force run all health checks
  const health = healthMonitor.getSystemHealth();
  for (const check of health.checks) {
    await healthMonitor.runCheck(check.name);
  }
  Logger.info('SelfRepair', 'All health checks re-run');

  // Clear diagnostic logs
  diagnosticsService.clearLogs();
  diagnosticsService.resetMetrics();
  Logger.info('SelfRepair', 'Diagnostics reset');

  Logger.info('SelfRepair', 'Manual recovery completed');
}

/**
 * Export diagnostics for support
 * Call this to get a diagnostic report to send to support
 */
export async function exportDiagnosticsForSupport(): Promise<string> {
  const report = await diagnosticsService.exportDiagnostics();
  const timestamp = new Date().toISOString();

  const supportReport = {
    timestamp,
    version: '1.0',
    userAgent: navigator.userAgent,
    diagnostics: JSON.parse(report)
  };

  return JSON.stringify(supportReport, null, 2);
}

/**
 * Example: Integrate into a React component
 */
export function useInspectionStateWithRecovery(initialState: InspectionState) {
  // This would be a custom React hook
  // const [state, setState] = useState(initialState);
  // const stateManager = useMemo(() => createInspectionStateManager(initialState), []);

  // useEffect(() => {
  //   // Load saved state
  //   const savedState = stateManager.getState();
  //   setState(savedState);
  //
  //   // Cleanup on unmount
  //   return () => {
  //     stateManager.cleanup();
  //   };
  // }, [stateManager]);
  //
  // const updateState = useCallback((newState: InspectionState) => {
  //   setState(newState);
  //   stateManager.updateState(newState);
  // }, [stateManager]);
  //
  // return { state, updateState, stateManager };
}
