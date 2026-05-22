import NotificationModel from '../models/Notification.js';

/**
 * Notification Service
 */
export class NotificationService {
  /**
   * Get user notifications
   */
  static async getNotifications(userId, pagination) {
    const notifications = await NotificationModel.getByUser(userId, pagination.limit, pagination.offset);
    const unreadCount = await NotificationModel.countUnread(userId);
    
    return {
      notifications,
      unreadCount,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: notifications.length === pagination.limit,
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    await NotificationModel.markAsRead(notificationId, userId);
    return { success: true };
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId) {
    await NotificationModel.markAllAsRead(userId);
    return { success: true };
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId, userId) {
    await NotificationModel.delete(notificationId, userId);
    return { success: true };
  }

  /**
   * Internal helper to create and send notification
   */
  static async notify(userId, type, title, message, data = null) {
    // 1. Create in DB
    const notification = await NotificationModel.create({
      id_user: userId,
      type,
      title,
      message,
      data,
    });

    // 2. TODO: Trigger push notification via Firebase if user has FCM token
    // This will be implemented when we have FCM setup
    
    return notification;
  }
}

export default NotificationService;
