# Agent Self-Repair System Documentation

## Overview

This AI agent application includes a comprehensive self-repair system that automatically detects and recovers from various types of failures and glitches. The system ensures high availability and resilience even when external services (like the Gemini AI API) experience issues.

## Architecture

The self-repair system consists of five core components:

### 1. Error Recovery Service (`errorRecoveryService.ts`)
- **Automatic Retry Logic**: Retries failed operations with exponential backoff
- **Fallback Mechanisms**: Provides alternative methods when primary operations fail
- **Safe Storage**: Protected localStorage operations with automatic quota management
- **Data Validation**: Validates and repairs corrupted data structures

### 2. Circuit Breaker Pattern (`circuitBreaker.ts`)
- **Failure Detection**: Monitors service failures and opens circuit when threshold is reached
- **Service Protection**: Prevents cascading failures by stopping requests to failing services
- **Automatic Recovery**: Tests service recovery and closes circuit when service is healthy
- **Multiple States**: CLOSED (normal), OPEN (failing), HALF_OPEN (testing recovery)

### 3. Health Monitoring (`healthMonitor.ts`)
- **Continuous Monitoring**: Periodically checks health of critical system components
- **Automatic Repair**: Triggers repair functions when health checks fail
- **Status Tracking**: Tracks HEALTHY, DEGRADED, UNHEALTHY, and UNKNOWN states
- **Predefined Checks**: localStorage, memory usage, and network connectivity

### 4. State Recovery (`stateRecovery.ts`)
- **State Snapshots**: Maintains multiple snapshots of application state
- **Rollback Capability**: Can restore from previous snapshots if state becomes corrupted
- **Auto-Save**: Automatically saves state at regular intervals
- **Checksum Validation**: Detects data corruption using checksums

### 5. Diagnostics & Logging (`diagnosticsService.ts`)
- **Comprehensive Logging**: Multi-level logging (DEBUG, INFO, WARN, ERROR, CRITICAL)
- **Performance Tracking**: Monitors request success rates and response times
- **Diagnostics Reports**: Generates detailed system health reports
- **Error Persistence**: Saves critical errors for later analysis

## How It Works

### Automatic Error Recovery Flow

```
1. API Call Attempted
   ↓
2. Circuit Breaker Checks State
   ├─ OPEN? → Reject immediately (service is down)
   ├─ CLOSED? → Allow request
   └─ HALF_OPEN? → Test with one request
   ↓
3. Execute with Retry Logic
   ├─ Success? → Return result
   ├─ Retryable Error? → Wait and retry (exponential backoff)
   └─ Non-retryable? → Try fallback
   ↓
4. Fallback Strategy
   ├─ Use cached data
   ├─ Use basic template
   └─ Return offline mode response
   ↓
5. Update Circuit Breaker
   ├─ Success → Record success
   └─ Failure → Record failure, possibly open circuit
```

### Circuit Breaker States

**CLOSED** (Normal Operation)
- All requests are allowed
- Failures are counted
- Opens after reaching failure threshold (default: 5 failures)

**OPEN** (Service Failing)
- All requests are rejected immediately
- Saves resources by not attempting doomed requests
- After timeout (default: 60s), transitions to HALF_OPEN

**HALF_OPEN** (Testing Recovery)
- Limited requests allowed to test service
- Success transitions back to CLOSED
- Failure transitions back to OPEN

## Self-Repair Features

### 1. API Failure Recovery

When the Gemini AI API fails:

1. **Retry Mechanism**: Attempts up to 3 times with exponential backoff (2s, 4s, 8s)
2. **Circuit Breaker**: If failures persist, circuit opens to prevent resource waste
3. **Fallback Response**: Returns a basic template response so users can continue working
4. **Automatic Recovery**: Periodically tests if service is back online

**Example**: DTC Code Analysis
- Primary: Full AI-powered analysis using Gemini
- Fallback: Basic template with general recommendations
- User sees: Working analysis even if AI is down, with indicator showing fallback mode

### 2. State Corruption Recovery

When application state becomes corrupted:

1. **Validation**: Every state update is validated against a schema
2. **Repair**: If validation fails, automatic repair function fixes common issues
3. **Snapshot Rollback**: If repair fails, rolls back to last known good state
4. **User Notification**: Informs user of recovery action taken

**Example**: Inspection State
- Validates: vehicle info, checklist structure, data types
- Repairs: Missing fields, invalid types, corrupted arrays
- Rollback: Restores from snapshot if beyond repair

### 3. Storage Quota Management

When localStorage is full:

1. **Detection**: Catches QuotaExceededError
2. **Cleanup**: Removes old draft data
3. **Retry**: Attempts save again
4. **Fallback**: Uses in-memory storage if localStorage unusable

### 4. Network Failure Handling

When network connectivity is lost:

1. **Detection**: Health check detects offline state
2. **Mode Switch**: Application enters offline mode
3. **Local Operation**: Continues working with local data
4. **Sync on Recovery**: Syncs when connection restored

## Usage Examples

### Using Error Recovery

```typescript
import { executeWithRetry, executeWithFallback } from './services/errorRecoveryService';

// Basic retry
const result = await executeWithRetry(
  async () => await apiCall(),
  {
    maxRetries: 3,
    initialDelayMs: 1000,
    retryableErrors: ['503', 'ETIMEDOUT']
  },
  'My API Call'
);

if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Failed after retries:', result.error);
}

// With fallback
const result = await executeWithFallback(
  async () => await primaryMethod(),
  async () => await fallbackMethod(),
  'My Operation'
);
```

### Using Circuit Breaker

```typescript
import { circuitBreakerRegistry } from './services/circuitBreaker';

const breaker = circuitBreakerRegistry.getOrCreate('my-service', {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000
});

try {
  const result = await breaker.execute(async () => {
    return await externalServiceCall();
  });
} catch (error) {
  // Circuit is open, service is unavailable
  console.error('Service unavailable:', error.message);
}

// Check circuit status
const stats = breaker.getStats();
console.log('Circuit state:', stats.state);
```

### Using Health Monitor

```typescript
import { healthMonitor, StandardHealthChecks } from './services/healthMonitor';

// Register health checks
healthMonitor.registerCheck(
  'api-health',
  async () => {
    try {
      await fetch('/api/health');
      return { healthy: true };
    } catch {
      return { healthy: false, message: 'API unreachable' };
    }
  },
  {
    intervalMs: 30000, // Check every 30s
    maxFailures: 3,
    repair: async () => {
      // Attempt to repair (e.g., reconnect, clear cache)
      console.log('Attempting repair...');
    }
  }
);

// Register standard checks
healthMonitor.registerCheck('storage', StandardHealthChecks.localStorage);
healthMonitor.registerCheck('network', StandardHealthChecks.network);

// Start monitoring
healthMonitor.startMonitoring();

// Get system health
const health = healthMonitor.getSystemHealth();
console.log('Overall health:', health.overall);
```

### Using State Recovery

```typescript
import { StateRecoveryManager, validateInspectionState, repairInspectionState } from './services/stateRecovery';

// Create state manager
const stateManager = new StateRecoveryManager(
  initialInspectionState,
  'inspection-state',
  5 // Keep 5 snapshots
);

// Update state
stateManager.updateState(newState, true); // Creates snapshot

// Validate state
const isValid = stateManager.validateState(validateInspectionState);

if (!isValid) {
  // Repair corrupted state
  stateManager.repairState(repairInspectionState);
}

// Or rollback to previous snapshot
stateManager.recoverFromSnapshot(0); // Most recent snapshot
```

### Using Diagnostics

```typescript
import { diagnosticsService, Logger } from './services/diagnosticsService';

// Log messages
Logger.info('UserAction', 'User started inspection');
Logger.warn('Performance', 'Slow API response', { responseTime: 5000 });
Logger.error('APIError', 'Failed to fetch data', { endpoint: '/api/analyze' }, error);

// Track performance
diagnosticsService.trackRequest(true, 250); // Success, 250ms

// Generate diagnostics report
const report = await diagnosticsService.generateDiagnosticsReport();
console.log('System Health:', report.systemHealth.overall);
console.log('Circuit Breakers:', report.circuitBreakers);
console.log('Recent Errors:', report.recentErrors);
console.log('Performance:', report.performanceMetrics);

// Export for analysis
const exportData = await diagnosticsService.exportDiagnostics();
```

## Configuration

### Error Recovery Configuration

```typescript
const retryConfig = {
  maxRetries: 3,              // Maximum number of retry attempts
  initialDelayMs: 1000,       // Initial delay before first retry
  maxDelayMs: 10000,          // Maximum delay between retries
  backoffMultiplier: 2,       // Exponential backoff multiplier
  retryableErrors: [          // Errors that should trigger retry
    '503', '429', '500',      // HTTP status codes
    'ETIMEDOUT',              // Network timeout
    'ECONNRESET'              // Connection reset
  ]
};
```

### Circuit Breaker Configuration

```typescript
const circuitConfig = {
  failureThreshold: 5,        // Open circuit after 5 failures
  successThreshold: 2,        // Close circuit after 2 successes in HALF_OPEN
  timeout: 60000,             // Wait 60s before testing recovery
  monitoringPeriod: 120000    // 2-minute monitoring window
};
```

### Health Monitor Configuration

```typescript
const healthCheckConfig = {
  intervalMs: 60000,          // Run check every 60 seconds
  maxFailures: 3,             // Mark unhealthy after 3 consecutive failures
  repair: async () => {       // Optional repair function
    // Repair logic here
  }
};
```

## Monitoring & Debugging

### View System Health

```typescript
const health = healthMonitor.getSystemHealth();
console.log(`Overall: ${health.overall}`);
health.checks.forEach(check => {
  console.log(`${check.name}: ${check.status} - ${check.message}`);
});
```

### View Circuit Breaker Status

```typescript
const allStats = circuitBreakerRegistry.getAllStats();
Object.entries(allStats).forEach(([name, stats]) => {
  console.log(`${name}: ${stats.state}`);
  console.log(`  Failures: ${stats.totalFailures}/${stats.totalRequests}`);
});
```

### View Recent Errors

```typescript
const errors = diagnosticsService.getLogs({
  level: LogLevel.ERROR,
  since: Date.now() - 3600000, // Last hour
  limit: 20
});
```

### Export Diagnostics

```typescript
// Generate and download diagnostics report
const report = await diagnosticsService.exportDiagnostics();
const blob = new Blob([report], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `diagnostics-${Date.now()}.json`;
a.click();
```

## Best Practices

### 1. Always Use Error Recovery for External Calls

```typescript
// ❌ Bad
const result = await externalAPI.call();

// ✅ Good
const result = await executeWithRetry(
  () => externalAPI.call(),
  { maxRetries: 3 },
  'External API Call'
);
```

### 2. Provide Fallbacks for Critical Operations

```typescript
// ✅ Good
const result = await executeWithFallback(
  () => aiService.analyze(data),
  () => basicAnalysis(data),
  'Data Analysis'
);
```

### 3. Register Health Checks for Critical Services

```typescript
// ✅ Good
healthMonitor.registerCheck('critical-service', checkFunction, {
  intervalMs: 30000,
  repair: repairFunction
});
```

### 4. Validate State Before Using

```typescript
// ✅ Good
if (!stateManager.validateState(validator)) {
  stateManager.repairState(repairer);
}
const state = stateManager.getState();
```

### 5. Log Important Events

```typescript
// ✅ Good
Logger.info('UserAction', 'Report generated', { reportId: id });
Logger.error('ServiceError', 'Failed to save', { reason: error.message }, error);
```

## Troubleshooting

### Problem: Circuit constantly opening

**Cause**: Service is genuinely failing or threshold too low

**Solution**:
1. Check external service status
2. Increase `failureThreshold` in circuit breaker config
3. Add better error handling in service calls
4. Check network connectivity

### Problem: State keeps getting corrupted

**Cause**: Invalid data being written or storage issues

**Solution**:
1. Add validation before writing state
2. Check localStorage quota
3. Review state update logic
4. Enable checksum validation

### Problem: Too many retries slowing down app

**Cause**: Retry configuration too aggressive

**Solution**:
1. Reduce `maxRetries`
2. Increase `initialDelayMs`
3. Make errors non-retryable if appropriate
4. Add timeout to requests

### Problem: Health checks causing performance issues

**Cause**: Too frequent checks or heavy check operations

**Solution**:
1. Increase `intervalMs`
2. Optimize health check functions
3. Remove unnecessary checks
4. Use lighter-weight checks

## Recovery Strategies by Error Type

| Error Type | Recovery Strategy | Fallback |
|------------|------------------|----------|
| Network timeout | Retry with backoff | Cached data / Offline mode |
| API rate limit | Wait and retry | Queued processing |
| Service unavailable | Circuit breaker | Basic template response |
| Data corruption | Validate & repair | Snapshot rollback |
| Storage quota | Cleanup & retry | In-memory storage |
| Memory pressure | Garbage collection | Reduce feature set |
| Invalid input | Sanitize & retry | Default values |

## Metrics & KPIs

The self-repair system tracks:

- **Availability**: Percentage of time system is operational
- **Recovery Time**: Time to detect and recover from failures
- **Success Rate**: Ratio of successful to failed operations
- **Circuit Breaker State**: Time spent in each circuit state
- **Health Status**: Overall system health score
- **Error Rate**: Errors per time period
- **Response Time**: Average API response time

Access these metrics via:

```typescript
const metrics = diagnosticsService.getPerformanceMetrics();
const health = healthMonitor.getSystemHealth();
const circuits = circuitBreakerRegistry.getAllStats();
```

## Conclusion

The self-repair system provides comprehensive resilience against various failure modes:

✅ **Automatic Recovery**: No manual intervention needed
✅ **Graceful Degradation**: Continues operating with reduced functionality
✅ **Transparency**: Users are informed of fallback modes
✅ **Comprehensive Monitoring**: Full visibility into system health
✅ **Battle-Tested Patterns**: Uses industry-standard circuit breaker and retry patterns

The agent can now handle glitches, API failures, network issues, state corruption, and storage problems automatically while maintaining service to users.
