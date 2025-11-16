import { Notification } from '../types';

const STORAGE_KEY = 'ai-auto-pro-notifications';

/**
 * Local notification service for managing user notifications.
 * Stores notifications in localStorage.
 */
export const notificationService = {
  /**
   * Retrieves all notifications for a user.
   */
  getNotifications(userId: string): Notification[] {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('[NotificationService] Error retrieving notifications:', error);
      return [];
    }
  },

  /**
   * Adds a new notification.
   */
  addNotification(userId: string, notification: Omit<Notification, 'id' | 'date' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString(),
      read: false,
    };

    const notifications = this.getNotifications(userId);
    notifications.unshift(newNotification);

    // Keep only the last 100 notifications
    const trimmed = notifications.slice(0, 100);

    try {
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(trimmed));
    } catch (error) {
      console.error('[NotificationService] Error saving notification:', error);
    }

    return newNotification;
  },

  /**
   * Marks a notification as read.
   */
  markAsRead(userId: string, notificationId: string): void {
    const notifications = this.getNotifications(userId);
    const notification = notifications.find(n => n.id === notificationId);

    if (notification) {
      notification.read = true;
      try {
        localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(notifications));
      } catch (error) {
        console.error('[NotificationService] Error updating notification:', error);
      }
    }
  },

  /**
   * Marks all notifications as read.
   */
  markAllAsRead(userId: string): void {
    const notifications = this.getNotifications(userId);
    notifications.forEach(n => n.read = true);

    try {
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(notifications));
    } catch (error) {
      console.error('[NotificationService] Error marking all as read:', error);
    }
  },

  /**
   * Deletes a notification.
   */
  deleteNotification(userId: string, notificationId: string): void {
    const notifications = this.getNotifications(userId);
    const filtered = notifications.filter(n => n.id !== notificationId);

    try {
      localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(filtered));
    } catch (error) {
      console.error('[NotificationService] Error deleting notification:', error);
    }
  },

  /**
   * Clears all notifications for a user.
   */
  clearAll(userId: string): void {
    try {
      localStorage.removeItem(`${STORAGE_KEY}-${userId}`);
    } catch (error) {
      console.error('[NotificationService] Error clearing notifications:', error);
    }
  },

  /**
   * Gets the count of unread notifications.
   */
  getUnreadCount(userId: string): number {
    const notifications = this.getNotifications(userId);
    return notifications.filter(n => !n.read).length;
  },
};
