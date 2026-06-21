import NotificationModel from '../models/Notification.js';
import prisma from '../config/prisma.js';
import admin from '../config/firebase.js';

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
   * Create a notification and trigger push notification
   */
  static async createNotification(userId, notificationData) {
    const { type, fromId, fromName, fromPhoto, targetId, targetType, targetLink, message } = notificationData;
    const notification = await NotificationModel.create({
      id_user: userId,
      type,
      title: fromName,
      message,
      data: { fromId, fromPhoto, targetId, targetType, targetLink },
    });

    // Trigger push notification async
    NotificationService.sendPushNotification(userId, fromName, message, type, { fromId, fromPhoto, targetId, targetType, targetLink })
      .catch(err => console.error('❌ Push notify error in createNotification:', err));

    return notification;
  }

  /**
   * Internal helper to create and send notification (DB + Push)
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

    // 2. Trigger push notification async
    NotificationService.sendPushNotification(userId, title, message, type, data)
      .catch(err => console.error('❌ Push notify error in notify:', err));
    
    return notification;
  }

  /**
   * Sends FCM push notification to all user devices
   */
  static async sendPushNotification(userId, title, messageText, type, data = null) {
    if (!admin || admin.apps.length === 0) {
      console.warn('⚠️ Firebase Admin is not initialized. Cannot send push notification.');
      return;
    }

    try {
      // Get all active tokens for this user
      const userTokens = await prisma.userDeviceToken.findMany({
        where: { id_user: userId },
        select: { token: true },
      });

      if (userTokens.length === 0) {
        return;
      }

      const tokens = userTokens.map(t => t.token);
      
      // Build data payload (converting everything to string since FCM expects string values)
      const dataPayload = {
        type: String(type || ''),
        title: String(title || ''),
        message: String(messageText || ''),
      };

      if (data) {
        if (typeof data === 'object') {
          Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== undefined) {
              dataPayload[key] = typeof data[key] === 'object' ? JSON.stringify(data[key]) : String(data[key]);
            }
          });
        } else {
          dataPayload.data = String(data);
        }
      }

      const message = {
        notification: {
          title: title || 'QueSale',
          body: messageText || '',
        },
        data: dataPayload,
        tokens: tokens,
      };

      console.log(`[FCM] Sending push notification to user ${userId} on ${tokens.length} devices...`);
      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`[FCM] Sent successfully: ${response.successCount} succeeded, ${response.failureCount} failed.`);

      // Clean up expired or invalid tokens
      if (response.responses && response.responses.length > 0) {
        const tokensToRemove = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error?.code;
            if (
              errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered'
            ) {
              tokensToRemove.push(tokens[idx]);
            } else {
              console.warn(`[FCM] Error for token ${tokens[idx]}:`, resp.error);
            }
          }
        });

        if (tokensToRemove.length > 0) {
          await prisma.userDeviceToken.deleteMany({
            where: { token: { in: tokensToRemove } },
          });
          console.log(`[FCM] Cleaned up ${tokensToRemove.length} stale tokens for user ${userId}.`);
        }
      }
    } catch (error) {
      console.error('❌ Error sending FCM push notification:', error);
    }
  }
}

export default NotificationService;
