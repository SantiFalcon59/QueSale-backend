import prisma from '../config/prisma.js';

/**
 * Device Token Model
 */
export class DeviceTokenModel {
  /**
   * Register or update a device token for a user
   */
  static async register(userId, token) {
    return await prisma.userDeviceToken.upsert({
      where: { token },
      update: { id_user: userId },
      create: { id_user: userId, token },
    });
  }

  /**
   * Unregister/delete a device token
   */
  static async unregister(token) {
    try {
      return await prisma.userDeviceToken.deleteMany({
        where: { token },
      });
    } catch (e) {
      console.warn('⚠️ Error unregistering token (might not exist):', e.message);
      return null;
    }
  }
}

export default DeviceTokenModel;
