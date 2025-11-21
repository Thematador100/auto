import { CompletedReport } from '../types';

// This is a placeholder for a more robust offline service using IndexedDB or similar.
// For this project, it simulates the basic API for storing and retrieving reports.

const OFFLINE_STORAGE_KEY = 'ai-auto-pro-offline-reports';

export const offlineService = {
  /**
   * Saves a report to the browser's localStorage.
   * @param report The completed report to save.
   */
  async saveReport(report: CompletedReport): Promise<void> {
    try {
      const existingReports = await this.getReports();
      const updatedReports = [report, ...existingReports];
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedReports));
      console.log('[OfflineService] Report saved locally.');
    } catch (error) {
      console.error('[OfflineService] Failed to save report locally:', error);
    }
  },

  /**
   * Retrieves all saved reports from localStorage.
   * @returns A promise that resolves to an array of completed reports.
   */
  async getReports(): Promise<CompletedReport[]> {
    try {
      const reportsJson = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (reportsJson) {
        console.log('[OfflineService] Reports loaded from local storage.');
        return JSON.parse(reportsJson) as CompletedReport[];
      }
      return [];
    } catch (error) {
      console.error('[OfflineService] Failed to load reports from local storage:', error);
      return [];
    }
  },

  /**
   * Clears all offline data.
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
