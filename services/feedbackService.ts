import { CustomerFeedback } from '../types';

const STORAGE_KEY = 'ai-auto-pro-feedback';

/**
 * Local feedback service for managing customer satisfaction feedback.
 * Stores feedback in localStorage.
 */
export const feedbackService = {
  /**
   * Retrieves all feedback.
   */
  getAllFeedback(): CustomerFeedback[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('[FeedbackService] Error retrieving feedback:', error);
      return [];
    }
  },

  /**
   * Retrieves feedback for a specific report.
   */
  getFeedbackForReport(reportId: string): CustomerFeedback | null {
    const allFeedback = this.getAllFeedback();
    return allFeedback.find(f => f.reportId === reportId) || null;
  },

  /**
   * Retrieves feedback by customer.
   */
  getFeedbackByCustomer(customerId: string): CustomerFeedback[] {
    const allFeedback = this.getAllFeedback();
    return allFeedback.filter(f => f.customerId === customerId);
  },

  /**
   * Saves new feedback.
   */
  saveFeedback(feedback: CustomerFeedback): void {
    const allFeedback = this.getAllFeedback();

    // Check if feedback already exists for this report
    const existingIndex = allFeedback.findIndex(f => f.reportId === feedback.reportId);

    if (existingIndex >= 0) {
      // Update existing feedback
      allFeedback[existingIndex] = feedback;
    } else {
      // Add new feedback
      allFeedback.push(feedback);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allFeedback));
    } catch (error) {
      console.error('[FeedbackService] Error saving feedback:', error);
    }
  },

  /**
   * Gets average rating across all feedback.
   */
  getAverageRating(): number {
    const allFeedback = this.getAllFeedback();
    if (allFeedback.length === 0) return 0;

    const sum = allFeedback.reduce((acc, f) => acc + f.rating, 0);
    return sum / allFeedback.length;
  },

  /**
   * Gets statistics about feedback.
   */
  getStatistics(): {
    totalFeedback: number;
    averageRating: number;
    recommendationRate: number;
    averageAspects: {
      thoroughness: number;
      clarity: number;
      timeliness: number;
      professionalism: number;
    };
  } {
    const allFeedback = this.getAllFeedback();

    if (allFeedback.length === 0) {
      return {
        totalFeedback: 0,
        averageRating: 0,
        recommendationRate: 0,
        averageAspects: {
          thoroughness: 0,
          clarity: 0,
          timeliness: 0,
          professionalism: 0,
        },
      };
    }

    const totalFeedback = allFeedback.length;
    const averageRating = allFeedback.reduce((acc, f) => acc + f.rating, 0) / totalFeedback;
    const recommendCount = allFeedback.filter(f => f.wouldRecommend).length;
    const recommendationRate = (recommendCount / totalFeedback) * 100;

    const averageAspects = {
      thoroughness: allFeedback.reduce((acc, f) => acc + f.aspects.thoroughness, 0) / totalFeedback,
      clarity: allFeedback.reduce((acc, f) => acc + f.aspects.clarity, 0) / totalFeedback,
      timeliness: allFeedback.reduce((acc, f) => acc + f.aspects.timeliness, 0) / totalFeedback,
      professionalism: allFeedback.reduce((acc, f) => acc + f.aspects.professionalism, 0) / totalFeedback,
    };

    return {
      totalFeedback,
      averageRating,
      recommendationRate,
      averageAspects,
    };
  },
};
