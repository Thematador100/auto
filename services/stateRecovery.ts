/**
 * State Recovery Service
 *
 * Manages application state persistence, validation, and recovery
 * to prevent data loss and state corruption.
 */

import { InspectionState, Vehicle } from '../types';
import { SafeStorage } from './errorRecoveryService';

export interface StateSnapshot<T> {
  data: T;
  timestamp: number;
  version: string;
  checksum?: string;
}

export interface RecoveryOptions {
  maxAge?: number; // Maximum age of snapshot in milliseconds
  validateChecksum?: boolean;
  fallbackToDefault?: boolean;
}

/**
 * Calculate a simple checksum for data integrity
 */
function calculateChecksum(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

/**
 * State recovery manager for persistent state management
 */
export class StateRecoveryManager<T> {
  private currentState: T;
  private snapshots: StateSnapshot<T>[] = [];
  private maxSnapshots: number;
  private storageKey: string;

  constructor(
    initialState: T,
    storageKey: string,
    maxSnapshots: number = 5
  ) {
    this.currentState = initialState;
    this.storageKey = storageKey;
    this.maxSnapshots = maxSnapshots;

    // Try to recover state from storage
    this.recoverFromStorage();
  }

  /**
   * Update current state and create snapshot
   */
  updateState(newState: T, createSnapshot: boolean = true): void {
    this.currentState = newState;

    if (createSnapshot) {
      this.createSnapshot(newState);
    }

    // Persist to storage
    this.saveToStorage();
  }

  /**
   * Get current state
   */
  getState(): T {
    return this.currentState;
  }

  /**
   * Create a snapshot of the current state
   */
  private createSnapshot(state: T): void {
    const snapshot: StateSnapshot<T> = {
      data: JSON.parse(JSON.stringify(state)), // Deep copy
      timestamp: Date.now(),
      version: '1.0',
      checksum: calculateChecksum(state)
    };

    this.snapshots.unshift(snapshot);

    // Keep only max snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(0, this.maxSnapshots);
    }

    console.log(`[State Recovery] Created snapshot (total: ${this.snapshots.length})`);
  }

  /**
   * Recover state from a previous snapshot
   */
  recoverFromSnapshot(index: number = 0): boolean {
    if (index >= this.snapshots.length) {
      console.error(`[State Recovery] Snapshot ${index} does not exist`);
      return false;
    }

    const snapshot = this.snapshots[index];
    const age = Date.now() - snapshot.timestamp;

    console.log(`[State Recovery] Recovering from snapshot ${index} (age: ${age}ms)`);

    // Validate checksum if available
    if (snapshot.checksum) {
      const currentChecksum = calculateChecksum(snapshot.data);
      if (currentChecksum !== snapshot.checksum) {
        console.warn('[State Recovery] Snapshot checksum mismatch, data may be corrupted');
      }
    }

    this.currentState = JSON.parse(JSON.stringify(snapshot.data));
    this.saveToStorage();

    return true;
  }

  /**
   * Save current state to localStorage
   */
  private saveToStorage(): void {
    const stateData = {
      current: this.currentState,
      snapshots: this.snapshots,
      lastSaved: Date.now()
    };

    const success = SafeStorage.set(this.storageKey, stateData);

    if (!success) {
      console.error('[State Recovery] Failed to save state to storage');
    }
  }

  /**
   * Recover state from localStorage
   */
  private recoverFromStorage(): void {
    const defaultState = {
      current: this.currentState,
      snapshots: [],
      lastSaved: 0
    };

    const stateData = SafeStorage.get(this.storageKey, defaultState);

    if (stateData.lastSaved > 0) {
      const age = Date.now() - stateData.lastSaved;
      console.log(`[State Recovery] Recovered state from storage (age: ${age}ms)`);

      this.currentState = stateData.current;
      this.snapshots = stateData.snapshots || [];
    } else {
      console.log('[State Recovery] No saved state found, using initial state');
    }
  }

  /**
   * Validate state integrity
   */
  validateState(validator: (state: T) => boolean): boolean {
    return validator(this.currentState);
  }

  /**
   * Repair state using a repair function
   */
  repairState(repairer: (state: T) => T): void {
    console.log('[State Recovery] Attempting to repair state');
    const repairedState = repairer(this.currentState);
    this.updateState(repairedState, true);
  }

  /**
   * Clear all snapshots and storage
   */
  clear(): void {
    console.log('[State Recovery] Clearing all snapshots and storage');
    this.snapshots = [];
    SafeStorage.remove(this.storageKey);
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): StateSnapshot<T>[] {
    return [...this.snapshots];
  }
}

/**
 * Inspection state validator
 */
export function validateInspectionState(state: any): state is InspectionState {
  if (!state || typeof state !== 'object') {
    return false;
  }

  // Validate vehicle
  if (!state.vehicle || typeof state.vehicle !== 'object') {
    return false;
  }

  const vehicle = state.vehicle;
  if (typeof vehicle.vin !== 'string' ||
      typeof vehicle.make !== 'string' ||
      typeof vehicle.model !== 'string' ||
      typeof vehicle.year !== 'string') {
    return false;
  }

  // Validate vehicleType
  if (typeof state.vehicleType !== 'string') {
    return false;
  }

  // Validate checklist
  if (!state.checklist || typeof state.checklist !== 'object') {
    return false;
  }

  // Validate overallNotes
  if (typeof state.overallNotes !== 'string') {
    return false;
  }

  // Validate odometer
  if (typeof state.odometer !== 'string') {
    return false;
  }

  return true;
}

/**
 * Repair corrupted inspection state
 */
export function repairInspectionState(state: any): InspectionState {
  console.log('[State Recovery] Repairing inspection state');

  const defaultVehicle: Vehicle = {
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear().toString()
  };

  return {
    vehicle: {
      vin: state?.vehicle?.vin || defaultVehicle.vin,
      make: state?.vehicle?.make || defaultVehicle.make,
      model: state?.vehicle?.model || defaultVehicle.model,
      year: state?.vehicle?.year || defaultVehicle.year
    },
    vehicleType: state?.vehicleType || 'sedan',
    checklist: state?.checklist || {},
    overallNotes: state?.overallNotes || '',
    odometer: state?.odometer || ''
  };
}

/**
 * Auto-save functionality for inspection state
 */
export class AutoSaveManager {
  private saveTimer: NodeJS.Timeout | null = null;
  private isDirty: boolean = false;
  private saveIntervalMs: number;

  constructor(
    private saveFunction: () => void,
    saveIntervalMs: number = 30000 // Default: 30 seconds
  ) {
    this.saveIntervalMs = saveIntervalMs;
  }

  /**
   * Mark state as dirty (needs saving)
   */
  markDirty(): void {
    this.isDirty = true;

    if (!this.saveTimer) {
      this.scheduleAutoSave();
    }
  }

  /**
   * Schedule an auto-save
   */
  private scheduleAutoSave(): void {
    this.saveTimer = setTimeout(() => {
      if (this.isDirty) {
        console.log('[Auto-Save] Performing auto-save');
        try {
          this.saveFunction();
          this.isDirty = false;
        } catch (error: any) {
          console.error('[Auto-Save] Failed to auto-save:', error.message);
        }
      }

      this.saveTimer = null;

      // Continue auto-save cycle if still dirty
      if (this.isDirty) {
        this.scheduleAutoSave();
      }
    }, this.saveIntervalMs);
  }

  /**
   * Force immediate save
   */
  forceSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }

    if (this.isDirty) {
      console.log('[Auto-Save] Forcing immediate save');
      this.saveFunction();
      this.isDirty = false;
    }
  }

  /**
   * Stop auto-save
   */
  stop(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return this.isDirty;
  }
}
