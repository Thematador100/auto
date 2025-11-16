import { CompletedReport, CustomerFeedback, Notification } from '../types';

// Backend API configuration
const API_BASE_URL = process.env.VITE_API_URL || '';

export const backendService = {
  /**
   * Saves a completed inspection report to the backend.
   * NOTE: Requires backend API integration.
   */
  async saveReport(report: CompletedReport): Promise<{ success: boolean; reportId: string; error?: string }> {
    console.log('[BackendService] Saving report:', report.id);

    if (!API_BASE_URL) {
      console.warn('[BackendService] API URL not configured. Report saved locally only.');
      return { success: true, reportId: report.id };
    }

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, reportId: data.id || report.id };
    } catch (error) {
      console.error('[BackendService] Error saving report:', error);
      return {
        success: false,
        reportId: report.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Fetches all reports for the current user from the backend.
   * NOTE: Requires backend API integration.
   */
  async getReports(userId?: string): Promise<CompletedReport[]> {
    console.log('[BackendService] Fetching reports');

    if (!API_BASE_URL) {
      console.warn('[BackendService] API URL not configured. Returning empty array.');
      return [];
    }

    try {
      const url = userId
        ? `${API_BASE_URL}/api/reports?userId=${userId}`
        : `${API_BASE_URL}/api/reports`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[BackendService] Error fetching reports:', error);
      return [];
    }
  },

  /**
   * Updates the status of a report (e.g., completed, submitted, reviewed).
   */
  async updateReportStatus(
    reportId: string,
    status: 'in-progress' | 'completed' | 'submitted' | 'reviewed'
  ): Promise<{ success: boolean; error?: string }> {
    console.log('[BackendService] Updating report status:', reportId, status);

    if (!API_BASE_URL) {
      console.warn('[BackendService] API URL not configured.');
      return { success: false, error: 'API not configured' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('[BackendService] Error updating report status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Submits customer feedback for a report.
   */
  async submitFeedback(feedback: CustomerFeedback): Promise<{ success: boolean; error?: string }> {
    console.log('[BackendService] Submitting feedback:', feedback.id);

    if (!API_BASE_URL) {
      console.warn('[BackendService] API URL not configured.');
      return { success: false, error: 'API not configured' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('[BackendService] Error submitting feedback:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Fetches notifications for a user.
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    console.log('[BackendService] Fetching notifications for user:', userId);

    if (!API_BASE_URL) {
      console.warn('[BackendService] API URL not configured. Returning empty array.');
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[BackendService] Error fetching notifications:', error);
      return [];
    }
  },

  /**
   * Marks a notification as read.
   */
  async markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    console.log('[BackendService] Marking notification as read:', notificationId);

    if (!API_BASE_URL) {
      return { success: false };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      return { success: response.ok };
    } catch (error) {
      console.error('[BackendService] Error marking notification as read:', error);
      return { success: false };
    }
  },
};
