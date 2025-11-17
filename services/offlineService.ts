import { CompletedReport } from '../types';
import { backendService } from './backendService';

// Hybrid storage service: Uses Supabase when available, falls back to localStorage
const OFFLINE_STORAGE_KEY = 'ai-auto-pro-offline-reports';

export const offlineService = {
  /**
   * Saves a report to Supabase (primary) or localStorage (fallback).
   * @param report The completed report to save.
   * @param userId The user ID (required for Supabase).
   */
  async saveReport(report: CompletedReport, userId?: string): Promise<void> {
    // Try Supabase first if userId is provided
    if (userId) {
      try {
        await backendService.saveReport(report, userId);
        console.log('[OfflineService] Report saved to Supabase.');
        return;
      } catch (error) {
        console.warn('[OfflineService] Supabase save failed, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    try {
      const existingReports = await this.getLocalReports();
      const updatedReports = [report, ...existingReports];
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedReports));
      console.log('[OfflineService] Report saved to localStorage.');
    } catch (error) {
      console.error('[OfflineService] Failed to save report locally:', error);
      throw new Error('Failed to save report to both Supabase and localStorage');
    }
  },

  /**
   * Retrieves all saved reports from Supabase or localStorage.
   * @param userId The user ID (required for Supabase).
   * @returns A promise that resolves to an array of completed reports.
   */
  async getReports(userId?: string): Promise<CompletedReport[]> {
    // Try Supabase first if userId is provided
    if (userId) {
      try {
        const reports = await backendService.getReports(userId);
        console.log('[OfflineService] Reports loaded from Supabase.');
        return reports;
      } catch (error) {
        console.warn('[OfflineService] Supabase fetch failed, falling back to localStorage:', error);
      }
    }

    // Fallback to localStorage
    return this.getLocalReports();
  },

  /**
   * Gets reports from localStorage only.
   * @returns A promise that resolves to an array of completed reports.
   */
  async getLocalReports(): Promise<CompletedReport[]> {
    try {
      const reportsJson = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (reportsJson) {
        console.log('[OfflineService] Reports loaded from localStorage.');
        return JSON.parse(reportsJson) as CompletedReport[];
      }
      return [];
    } catch (error) {
      console.error('[OfflineService] Failed to load reports from localStorage:', error);
      return [];
    }
  },

  /**
   * Clears all offline data (localStorage only, does not affect Supabase).
   */
  async clearAll(): Promise<void> {
    try {
      localStorage.removeItem(OFFLINE_STORAGE_KEY);
      console.log('[OfflineService] All local data cleared.');
    } catch (error) {
      console.error('[OfflineService] Failed to clear local data:', error);
    }
  }
};
