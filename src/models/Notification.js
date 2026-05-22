import prisma from '../config/prisma.js';

/**
 * Notification Model
 */
export class NotificationModel {
  /**
   * Create notification
   */
  static async create(notificationData) {
    const { id_user, type, title, message, data } = notificationData;
    return await prisma.notification.create({
      data: {
        id_user,
        type,
        title,
        message,
        data: data || null,
      },
    });
  }

  /**
   * Get user notifications
   */
  static async getByUser(userId, limit, offset) {
    return await prisma.notification.findMany({
      where: { id_user: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Count unread notifications
   */
  static async countUnread(userId) {
    return await prisma.notification.count({
      where: { id_user: userId, is_read: false },
    });
  }

  /**
   * Mark as read
   */
  static async markAsRead(notificationId, userId) {
    await prisma.notification.updateMany({
      where: { id_notification: notificationId, id_user: userId },
      data: { is_read: true },
    });
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(userId) {
    await prisma.notification.updateMany({
      where: { id_user: userId, is_read: false },
      data: { is_read: true },
    });
  }

  /**
   * Delete notification
   */
  static async delete(notificationId, userId) {
    await prisma.notification.deleteMany({
      where: { id_notification: notificationId, id_user: userId },
    });
  }
}

export default NotificationModel;
