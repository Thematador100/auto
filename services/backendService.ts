import { CompletedReport } from '../types';
import {
  saveReportToDB,
  getAllReportsFromDB,
  getReportByIdFromDB,
  getReportsByVINFromDB,
  deleteReportFromDB,
} from './databaseService';

// Real backend service using IndexedDB for persistent storage
// This provides full CRUD operations for inspection reports

export const backendService = {
  /**
   * Saves a completed inspection report to the database
   */
  async saveReport(report: CompletedReport): Promise<{ success: true; reportId: string }> {
    console.log('[BackendService] Saving report to database:', report.id);
    try {
      await saveReportToDB(report);
      return { success: true, reportId: report.id };
    } catch (error) {
      console.error('[BackendService] Error saving report:', error);
      throw new Error('Failed to save report. Please try again.');
    }
  },

  /**
   * Retrieves all inspection reports from the database
   */
  async getReports(): Promise<CompletedReport[]> {
    console.log('[BackendService] Fetching all reports from database');
    try {
      const reports = await getAllReportsFromDB();
      return reports;
    } catch (error) {
      console.error('[BackendService] Error fetching reports:', error);
      throw new Error('Failed to load reports. Please try again.');
    }
  },

  /**
   * Retrieves a single report by its ID
   */
  async getReportById(reportId: string): Promise<CompletedReport | null> {
    console.log('[BackendService] Fetching report:', reportId);
    try {
      const report = await getReportByIdFromDB(reportId);
      return report;
    } catch (error) {
      console.error('[BackendService] Error fetching report:', error);
      throw new Error('Failed to load report. Please try again.');
    }
  },

  /**
   * Retrieves all reports for a specific VIN
   */
  async getReportsByVIN(vin: string): Promise<CompletedReport[]> {
    console.log('[BackendService] Fetching reports for VIN:', vin);
    try {
      const reports = await getReportsByVINFromDB(vin);
      return reports;
    } catch (error) {
      console.error('[BackendService] Error fetching reports by VIN:', error);
      throw new Error('Failed to load reports. Please try again.');
    }
  },

  /**
   * Deletes a report from the database
   */
  async deleteReport(reportId: string): Promise<{ success: true }> {
    console.log('[BackendService] Deleting report:', reportId);
    try {
      await deleteReportFromDB(reportId);
      return { success: true };
    } catch (error) {
      console.error('[BackendService] Error deleting report:', error);
      throw new Error('Failed to delete report. Please try again.');
    }
  },
};
