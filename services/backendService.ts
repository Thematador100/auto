import { CompletedReport } from '../types';
import { supabaseService } from './supabaseClient';

// Real backend service using Supabase
export const backendService = {
  async saveReport(report: CompletedReport, userId: string): Promise<{ success: boolean; reportId: string }> {
    console.log('[Backend] Saving report to Supabase:', report.id);
    try {
      const result = await supabaseService.saveReport(report, userId);
      return result;
    } catch (error) {
      console.error('[Backend] Failed to save report:', error);
      throw new Error('Failed to save report to database');
    }
  },

  async getReports(userId: string): Promise<CompletedReport[]> {
    console.log('[Backend] Fetching reports from Supabase');
    try {
      const reports = await supabaseService.getReports(userId);
      return reports;
    } catch (error) {
      console.error('[Backend] Failed to fetch reports:', error);
      throw new Error('Failed to fetch reports from database');
    }
  },

  async deleteReport(reportId: string, userId: string): Promise<void> {
    console.log('[Backend] Deleting report from Supabase:', reportId);
    try {
      await supabaseService.deleteReport(reportId, userId);
    } catch (error) {
      console.error('[Backend] Failed to delete report:', error);
      throw new Error('Failed to delete report from database');
    }
  },
};
