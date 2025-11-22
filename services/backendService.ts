import { CompletedReport } from '../types';
import { supabaseService } from './supabaseService';

// Backend service now uses Supabase for data persistence
// Falls back to offline storage when Supabase is unavailable

export const backendService = {
  async saveReport(report: CompletedReport, userId?: string): Promise<{ success: true; reportId: string }> {
    if (!userId) {
      console.warn('No userId provided, falling back to offline storage');
      const { offlineService } = await import('./offlineService');
      offlineService.saveReport(report);
      return { success: true, reportId: report.id };
    }

    const result = await supabaseService.reports.saveReport(report, userId);
    return { success: true, reportId: result.reportId };
  },

  async getReports(userId?: string): Promise<CompletedReport[]> {
    if (!userId) {
      console.warn('No userId provided, falling back to offline storage');
      const { offlineService } = await import('./offlineService');
      return offlineService.getReports();
    }

    return supabaseService.reports.getReports(userId);
  },

  async deleteReport(reportId: string, userId?: string): Promise<boolean> {
    if (!userId) {
      console.warn('No userId provided, cannot delete from Supabase');
      return false;
    }

    return supabaseService.reports.deleteReport(reportId, userId);
  },
};
