/**
 * Health Monitoring Service
 *
 * Monitors the health of various system components and triggers
 * self-repair actions when issues are detected.
 */

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  UNKNOWN = 'UNKNOWN'
}

export interface HealthCheck {
  name: string;
  status: HealthStatus;
  lastCheck: number;
  lastSuccess: number | null;
  consecutiveFailures: number;
  message?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  overall: HealthStatus;
  checks: HealthCheck[];
  timestamp: number;
  uptime: number;
}

export type HealthCheckFunction = () => Promise<{ healthy: boolean; message?: string; metadata?: Record<string, any> }>;
export type RepairFunction = () => Promise<void>;

interface RegisteredCheck {
  name: string;
  check: HealthCheckFunction;
  repair?: RepairFunction;
  intervalMs: number;
  maxFailures: number;
  lastCheck: HealthCheck;
  timeoutId?: NodeJS.Timeout;
}

class HealthMonitor {
  private checks: Map<string, RegisteredCheck> = new Map();
  private startTime: number = Date.now();
  private isMonitoring: boolean = false;

  /**
   * Register a health check
   */
  registerCheck(
    name: string,
    check: HealthCheckFunction,
    options: {
      intervalMs?: number;
      maxFailures?: number;
      repair?: RepairFunction;
    } = {}
  ): void {
    const {
      intervalMs = 60000, // Default: 1 minute
      maxFailures = 3,
      repair
    } = options;

    if (this.checks.has(name)) {
      console.warn(`[Health Monitor] Check '${name}' already registered, updating...`);
      this.unregisterCheck(name);
    }

    const registeredCheck: RegisteredCheck = {
      name,
      check,
      repair,
      intervalMs,
      maxFailures,
      lastCheck: {
        name,
        status: HealthStatus.UNKNOWN,
        lastCheck: 0,
        lastSuccess: null,
        consecutiveFailures: 0
      }
    };

    this.checks.set(name, registeredCheck);
    console.log(`[Health Monitor] Registered check '${name}' (interval: ${intervalMs}ms, max failures: ${maxFailures})`);

    // If monitoring is active, start this check
    if (this.isMonitoring) {
      this.startCheck(registeredCheck);
    }
  }

  /**
   * Unregister a health check
   */
  unregisterCheck(name: string): void {
    const check = this.checks.get(name);
    if (check?.timeoutId) {
      clearTimeout(check.timeoutId);
    }
    this.checks.delete(name);
    console.log(`[Health Monitor] Unregistered check '${name}'`);
  }

  /**
   * Start monitoring all registered checks
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('[Health Monitor] Already monitoring');
      return;
    }

    console.log(`[Health Monitor] Starting monitoring of ${this.checks.size} checks`);
    this.isMonitoring = true;

    this.checks.forEach(check => {
      this.startCheck(check);
    });
  }

  /**
   * Stop monitoring all checks
   */
  stopMonitoring(): void {
    console.log('[Health Monitor] Stopping monitoring');
    this.isMonitoring = false;

    this.checks.forEach(check => {
      if (check.timeoutId) {
        clearTimeout(check.timeoutId);
        check.timeoutId = undefined;
      }
    });
  }

  /**
   * Start a specific check
   */
  private startCheck(check: RegisteredCheck): void {
    const runCheck = async () => {
      await this.executeCheck(check);

      if (this.isMonitoring) {
        check.timeoutId = setTimeout(runCheck, check.intervalMs);
      }
    };

    // Run immediately, then schedule periodic checks
    runCheck();
  }

  /**
   * Execute a health check and handle failures
   */
  private async executeCheck(check: RegisteredCheck): Promise<void> {
    const now = Date.now();

    try {
      const result = await check.check();

      if (result.healthy) {
        check.lastCheck = {
          name: check.name,
          status: HealthStatus.HEALTHY,
          lastCheck: now,
          lastSuccess: now,
          consecutiveFailures: 0,
          message: result.message,
          metadata: result.metadata
        };

        if (check.lastCheck.consecutiveFailures > 0) {
          console.log(`[Health Monitor] Check '${check.name}' recovered`);
        }
      } else {
        check.lastCheck.consecutiveFailures++;
        check.lastCheck.lastCheck = now;
        check.lastCheck.message = result.message;
        check.lastCheck.metadata = result.metadata;

        const isDegraded = check.lastCheck.consecutiveFailures < check.maxFailures;
        check.lastCheck.status = isDegraded ? HealthStatus.DEGRADED : HealthStatus.UNHEALTHY;

        console.warn(
          `[Health Monitor] Check '${check.name}' failed ` +
          `(${check.lastCheck.consecutiveFailures}/${check.maxFailures}): ${result.message}`
        );

        // Attempt repair if service is unhealthy
        if (check.lastCheck.status === HealthStatus.UNHEALTHY && check.repair) {
          await this.attemptRepair(check);
        }
      }
    } catch (error: any) {
      check.lastCheck.consecutiveFailures++;
      check.lastCheck.lastCheck = now;
      check.lastCheck.message = error.message || 'Check threw an exception';
      check.lastCheck.status = check.lastCheck.consecutiveFailures >= check.maxFailures
        ? HealthStatus.UNHEALTHY
        : HealthStatus.DEGRADED;

      console.error(`[Health Monitor] Check '${check.name}' threw error:`, error);

      if (check.lastCheck.status === HealthStatus.UNHEALTHY && check.repair) {
        await this.attemptRepair(check);
      }
    }
  }

  /**
   * Attempt to repair a failing component
   */
  private async attemptRepair(check: RegisteredCheck): Promise<void> {
    if (!check.repair) return;

    console.log(`[Health Monitor] Attempting repair for '${check.name}'`);

    try {
      await check.repair();
      console.log(`[Health Monitor] Repair completed for '${check.name}'`);

      // Re-run the check immediately to verify repair
      setTimeout(() => this.executeCheck(check), 1000);
    } catch (error: any) {
      console.error(`[Health Monitor] Repair failed for '${check.name}':`, error.message);
    }
  }

  /**
   * Run a specific check immediately
   */
  async runCheck(name: string): Promise<HealthCheck | null> {
    const check = this.checks.get(name);
    if (!check) {
      console.warn(`[Health Monitor] Check '${name}' not found`);
      return null;
    }

    await this.executeCheck(check);
    return check.lastCheck;
  }

  /**
   * Get current system health
   */
  getSystemHealth(): SystemHealth {
    const checks = Array.from(this.checks.values()).map(c => c.lastCheck);

    // Determine overall health
    let overall = HealthStatus.HEALTHY;

    if (checks.some(c => c.status === HealthStatus.UNHEALTHY)) {
      overall = HealthStatus.UNHEALTHY;
    } else if (checks.some(c => c.status === HealthStatus.DEGRADED)) {
      overall = HealthStatus.DEGRADED;
    } else if (checks.every(c => c.status === HealthStatus.UNKNOWN)) {
      overall = HealthStatus.UNKNOWN;
    }

    return {
      overall,
      checks,
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime
    };
  }

  /**
   * Get status of a specific check
   */
  getCheckStatus(name: string): HealthCheck | null {
    return this.checks.get(name)?.lastCheck || null;
  }

  /**
   * Reset all check statuses
   */
  reset(): void {
    console.log('[Health Monitor] Resetting all checks');
    this.checks.forEach(check => {
      check.lastCheck = {
        name: check.name,
        status: HealthStatus.UNKNOWN,
        lastCheck: 0,
        lastSuccess: null,
        consecutiveFailures: 0
      };
    });
  }
}

// Singleton instance
export const healthMonitor = new HealthMonitor();

/**
 * Predefined health checks for common issues
 */
export const StandardHealthChecks = {
  /**
   * Check if localStorage is available and working
   */
  localStorage: async (): Promise<{ healthy: boolean; message?: string }> => {
    try {
      const testKey = '__health_check__';
      const testValue = Date.now().toString();

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        return { healthy: false, message: 'localStorage read/write mismatch' };
      }

      return { healthy: true, message: 'localStorage operational' };
    } catch (error: any) {
      return { healthy: false, message: `localStorage error: ${error.message}` };
    }
  },

  /**
   * Check memory usage (basic heuristic)
   */
  memory: async (): Promise<{ healthy: boolean; message?: string; metadata?: any }> => {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

      return {
        healthy: usedPercent < 90,
        message: `Memory usage: ${usedPercent.toFixed(1)}%`,
        metadata: {
          usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
          limitMB: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)
        }
      };
    }

    return { healthy: true, message: 'Memory API not available' };
  },

  /**
   * Check network connectivity
   */
  network: async (): Promise<{ healthy: boolean; message?: string }> => {
    if (!navigator.onLine) {
      return { healthy: false, message: 'No network connection' };
    }

    try {
      // Attempt a lightweight request
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });

      return { healthy: true, message: 'Network connectivity confirmed' };
    } catch (error) {
      return { healthy: false, message: 'Network request failed' };
    }
  }
};
