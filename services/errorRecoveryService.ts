/**
 * Error Recovery Service - Self-Repair System
 *
 * This service provides automatic error recovery and self-repair capabilities
 * for the AI agent, including retry logic, exponential backoff, and fallback mechanisms.
 */

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export interface RecoveryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  recoveryStrategy?: string;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', '503', '429', '500'],
};

/**
 * Sleep utility for delays
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determines if an error is retryable
 */
const isRetryableError = (error: any, retryableErrors: string[]): boolean => {
  if (!error) return false;

  const errorString = error.toString();
  const errorCode = error.code || error.status?.toString() || '';
  const errorMessage = error.message || '';

  return retryableErrors.some(retryable =>
    errorString.includes(retryable) ||
    errorCode.includes(retryable) ||
    errorMessage.includes(retryable)
  );
};

/**
 * Executes a function with retry logic and exponential backoff
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context?: string
): Promise<RecoveryResult<T>> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;
  let currentDelay = finalConfig.initialDelayMs;

  for (let attempt = 1; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const result = await fn();

      if (attempt > 1) {
        console.log(`[Self-Repair] ${context || 'Operation'} succeeded after ${attempt} attempts`);
      }

      return {
        success: true,
        data: result,
        attempts: attempt,
        recoveryStrategy: attempt > 1 ? 'retry-with-backoff' : 'direct-success'
      };
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));

      const isLastAttempt = attempt === finalConfig.maxRetries;
      const shouldRetry = isRetryableError(error, finalConfig.retryableErrors || []);

      console.warn(
        `[Self-Repair] ${context || 'Operation'} attempt ${attempt}/${finalConfig.maxRetries} failed:`,
        error.message
      );

      if (isLastAttempt || !shouldRetry) {
        console.error(`[Self-Repair] ${context || 'Operation'} failed permanently after ${attempt} attempts`);
        break;
      }

      // Wait before retrying with exponential backoff
      console.log(`[Self-Repair] Retrying in ${currentDelay}ms...`);
      await sleep(currentDelay);

      currentDelay = Math.min(currentDelay * finalConfig.backoffMultiplier, finalConfig.maxDelayMs);
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: finalConfig.maxRetries,
    recoveryStrategy: 'all-retries-exhausted'
  };
}

/**
 * Executes a function with a fallback
 */
export async function executeWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  context?: string
): Promise<RecoveryResult<T>> {
  try {
    const result = await primary();
    return {
      success: true,
      data: result,
      attempts: 1,
      recoveryStrategy: 'primary-success'
    };
  } catch (primaryError: any) {
    console.warn(`[Self-Repair] ${context || 'Primary operation'} failed, attempting fallback:`, primaryError.message);

    try {
      const result = await fallback();
      console.log(`[Self-Repair] ${context || 'Operation'} recovered using fallback strategy`);
      return {
        success: true,
        data: result,
        attempts: 2,
        recoveryStrategy: 'fallback-success'
      };
    } catch (fallbackError: any) {
      console.error(`[Self-Repair] ${context || 'Operation'} failed completely (both primary and fallback)`);
      return {
        success: false,
        error: fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)),
        attempts: 2,
        recoveryStrategy: 'all-strategies-failed'
      };
    }
  }
}

/**
 * Validates and repairs data structure
 */
export function validateAndRepair<T>(
  data: any,
  validator: (data: any) => boolean,
  repairer: (data: any) => T,
  context?: string
): T {
  if (validator(data)) {
    return data as T;
  }

  console.warn(`[Self-Repair] ${context || 'Data'} validation failed, attempting repair`);
  const repaired = repairer(data);

  if (validator(repaired)) {
    console.log(`[Self-Repair] ${context || 'Data'} successfully repaired`);
    return repaired;
  }

  throw new Error(`Failed to repair ${context || 'data'}: validation still failing after repair attempt`);
}

/**
 * Safe JSON parse with recovery
 */
export function safeJsonParse<T>(
  jsonString: string,
  fallbackValue: T,
  context?: string
): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error: any) {
    console.warn(`[Self-Repair] JSON parse failed for ${context || 'data'}, using fallback:`, error.message);
    return fallbackValue;
  }
}

/**
 * Safe local storage operations with recovery
 */
export const SafeStorage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return fallback;
      }
      return safeJsonParse(item, fallback, `localStorage key '${key}'`);
    } catch (error: any) {
      console.warn(`[Self-Repair] Failed to read from localStorage key '${key}':`, error.message);
      return fallback;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error: any) {
      console.error(`[Self-Repair] Failed to write to localStorage key '${key}':`, error.message);

      // Attempt recovery by clearing some space
      if (error.name === 'QuotaExceededError') {
        console.log('[Self-Repair] Attempting to free up localStorage space...');
        try {
          // Clear old inspection drafts if they exist
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const storageKey = localStorage.key(i);
            if (storageKey?.startsWith('inspection-draft-')) {
              keysToRemove.push(storageKey);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));

          // Try again
          localStorage.setItem(key, JSON.stringify(value));
          console.log('[Self-Repair] Successfully recovered from QuotaExceededError');
          return true;
        } catch (retryError) {
          console.error('[Self-Repair] Failed to recover from QuotaExceededError');
          return false;
        }
      }

      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error: any) {
      console.warn(`[Self-Repair] Failed to remove localStorage key '${key}':`, error.message);
      return false;
    }
  }
};
