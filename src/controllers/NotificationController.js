import NotificationService from '../services/NotificationService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

/**
 * Notification Controller
 */
export class NotificationController {
  /**
   * Get user notifications
   */
  static async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await NotificationService.getNotifications(userId, req.pagination);
      sendPaginated(res, result.notifications, req.pagination, 'Notifications retrieved', {
        unreadCount: result.unreadCount
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark as read
   */
  static async markAsRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;
      await NotificationService.markAsRead(notificationId, userId);
      sendSuccess(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.id;
      await NotificationService.markAllAsRead(userId);
      sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;
      await NotificationService.deleteNotification(notificationId, userId);
      sendSuccess(res, null, 'Notification deleted');
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
