/**
 * Diagnostics and Logging Service
 *
 * Provides comprehensive diagnostics, logging, and error tracking
 * for the self-repair system.
 */

import { circuitBreakerRegistry } from './circuitBreaker';
import { healthMonitor, SystemHealth } from './healthMonitor';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

export interface DiagnosticsReport {
  timestamp: number;
  systemHealth: SystemHealth;
  circuitBreakers: Record<string, any>;
  recentErrors: LogEntry[];
  performanceMetrics: PerformanceMetrics;
  storageInfo: StorageInfo;
}

export interface PerformanceMetrics {
  uptime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  memoryUsage?: {
    used: number;
    limit: number;
    percentage: number;
  };
}

export interface StorageInfo {
  available: boolean;
  usage: {
    keys: number;
    estimatedSize: number;
  };
  quota?: {
    usage: number;
    quota: number;
    percentage: number;
  };
}

class DiagnosticsService {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private performanceData = {
    startTime: Date.now(),
    requests: 0,
    successes: 0,
    failures: 0,
    responseTimes: [] as number[]
  };

  /**
   * Log a message
   */
  log(level: LogLevel, category: string, message: string, metadata?: Record<string, any>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      metadata,
      stackTrace: error?.stack
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with color coding
    const logMethod = this.getConsoleMethod(level);
    const prefix = `[${category}] [${level}]`;
    logMethod(`${prefix} ${message}`, metadata || '');

    // Persist critical errors
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      this.persistError(entry);
    }
  }

  /**
   * Get console method for log level
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        return console.error.bind(console);
      case LogLevel.WARN:
        return console.warn.bind(console);
      case LogLevel.INFO:
      case LogLevel.DEBUG:
      default:
        return console.log.bind(console);
    }
  }

  /**
   * Persist error to localStorage for later analysis
   */
  private persistError(entry: LogEntry): void {
    try {
      const errorLog = localStorage.getItem('error_log');
      const errors = errorLog ? JSON.parse(errorLog) : [];
      errors.push(entry);

      // Keep last 50 errors
      const recentErrors = errors.slice(-50);
      localStorage.setItem('error_log', JSON.stringify(recentErrors));
    } catch (error) {
      console.error('Failed to persist error log:', error);
    }
  }

  /**
   * Track a request
   */
  trackRequest(success: boolean, responseTime?: number): void {
    this.performanceData.requests++;
    if (success) {
      this.performanceData.successes++;
    } else {
      this.performanceData.failures++;
    }

    if (responseTime !== undefined) {
      this.performanceData.responseTimes.push(responseTime);
      // Keep last 100 response times
      if (this.performanceData.responseTimes.length > 100) {
        this.performanceData.responseTimes.shift();
      }
    }
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const uptime = Date.now() - this.performanceData.startTime;
    const avgResponseTime = this.performanceData.responseTimes.length > 0
      ? this.performanceData.responseTimes.reduce((a, b) => a + b, 0) / this.performanceData.responseTimes.length
      : 0;

    const metrics: PerformanceMetrics = {
      uptime,
      totalRequests: this.performanceData.requests,
      successfulRequests: this.performanceData.successes,
      failedRequests: this.performanceData.failures,
      averageResponseTime: avgResponseTime
    };

    // Add memory info if available
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      metrics.memoryUsage = {
        used: memory.usedJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }

    return metrics;
  }

  /**
   * Get storage information
   */
  async getStorageInfo(): Promise<StorageInfo> {
    const info: StorageInfo = {
      available: false,
      usage: {
        keys: 0,
        estimatedSize: 0
      }
    };

    try {
      info.available = true;
      info.usage.keys = localStorage.length;

      // Estimate storage size
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          totalSize += key.length + (value?.length || 0);
        }
      }
      info.usage.estimatedSize = totalSize;

      // Get quota if available
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage !== undefined && estimate.quota !== undefined) {
          info.quota = {
            usage: estimate.usage,
            quota: estimate.quota,
            percentage: (estimate.usage / estimate.quota) * 100
          };
        }
      }
    } catch (error) {
      console.error('Failed to get storage info:', error);
    }

    return info;
  }

  /**
   * Generate comprehensive diagnostics report
   */
  async generateDiagnosticsReport(): Promise<DiagnosticsReport> {
    const systemHealth = healthMonitor.getSystemHealth();
    const circuitBreakers = circuitBreakerRegistry.getAllStats();
    const recentErrors = this.logs.filter(
      log => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL
    ).slice(-20);
    const performanceMetrics = this.getPerformanceMetrics();
    const storageInfo = await this.getStorageInfo();

    return {
      timestamp: Date.now(),
      systemHealth,
      circuitBreakers,
      recentErrors,
      performanceMetrics,
      storageInfo
    };
  }

  /**
   * Get logs filtered by criteria
   */
  getLogs(options?: {
    level?: LogLevel;
    category?: string;
    since?: number;
    limit?: number;
  }): LogEntry[] {
    let filtered = this.logs;

    if (options?.level) {
      filtered = filtered.filter(log => log.level === options.level);
    }

    if (options?.category) {
      filtered = filtered.filter(log => log.category === options.category);
    }

    if (options?.since) {
      filtered = filtered.filter(log => log.timestamp >= options.since);
    }

    if (options?.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered;
  }

  /**
   * Export diagnostics data for external analysis
   */
  async exportDiagnostics(): Promise<string> {
    const report = await this.generateDiagnosticsReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    console.log('[Diagnostics] Logs cleared');
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.performanceData = {
      startTime: Date.now(),
      requests: 0,
      successes: 0,
      failures: 0,
      responseTimes: []
    };
    console.log('[Diagnostics] Performance metrics reset');
  }
}

// Singleton instance
export const diagnosticsService = new DiagnosticsService();

/**
 * Convenience logging functions
 */
export const Logger = {
  debug: (category: string, message: string, metadata?: Record<string, any>) =>
    diagnosticsService.log(LogLevel.DEBUG, category, message, metadata),

  info: (category: string, message: string, metadata?: Record<string, any>) =>
    diagnosticsService.log(LogLevel.INFO, category, message, metadata),

  warn: (category: string, message: string, metadata?: Record<string, any>) =>
    diagnosticsService.log(LogLevel.WARN, category, message, metadata),

  error: (category: string, message: string, metadata?: Record<string, any>, error?: Error) =>
    diagnosticsService.log(LogLevel.ERROR, category, message, metadata, error),

  critical: (category: string, message: string, metadata?: Record<string, any>, error?: Error) =>
    diagnosticsService.log(LogLevel.CRITICAL, category, message, metadata, error)
};
