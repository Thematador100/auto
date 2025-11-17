import { CompletedReport } from '../types';

// This is a mock backend service. In a real application, this would
// make HTTP requests to a server.

export const backendService = {
  async saveReport(report: CompletedReport): Promise<{ success: true; reportId: string }> {
    console.log('Saving report to backend:', report);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, reportId: report.id };
  },

  async getReports(): Promise<CompletedReport[]> {
    console.log('Fetching reports from backend');
    await new Promise(resolve => setTimeout(resolve, 800));
    // In a real app, you would fetch this from an API.
    // For now, it returns an empty array. The app uses mock data.
    return [];
  },
};
