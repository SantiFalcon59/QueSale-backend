import OrganizerModel from '../models/Organizer.js';
import { ORGANIZER_ROLES } from '../constants/roles.js';
import { generateId } from '../utils/generators.js';
import { NotificationService } from './NotificationService.js';

/**
 * Organizer Service
 */
export class OrganizerService {
  /**
   * Create new organizer
   */
  static async createOrganizer(organizerData, userId) {
    const organizerId = generateId();

    // Check if name already exists
    const existing = await OrganizerModel.findByName(organizerData.name);
    if (existing) {
      throw { statusCode: 409, message: 'Organizer name already exists' };
    }

    const organizer = await OrganizerModel.create({
      id_organizer: organizerId,
      name: organizerData.name,
      description: organizerData.description,
      id_creator: userId,
    });

    // Add creator as admin
    await OrganizerModel.addAdmin(organizerId, userId, 'admin');

    return organizer;
  }

  /**
   * Get organizer details
   */
  static async getOrganizerDetails(organizerId, currentUserId = null) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    let is_following = false;
    if (currentUserId) {
      is_following = await OrganizerModel.isFollowing(organizerId, currentUserId);
    }

    return { ...organizer, is_following };
  }

  /**
   * Update organizer
   */
  static async updateOrganizer(organizerId, updateData, userId) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    // Check if user is admin
    const isAdmin = await OrganizerModel.isAdmin(organizerId, userId);
    if (!isAdmin && organizer.id_creator !== userId) {
      throw { statusCode: 403, message: 'Unauthorized to update this organizer' };
    }

    // Check name uniqueness if updating
    if (updateData.name && updateData.name !== organizer.name) {
      const existing = await OrganizerModel.findByName(updateData.name);
      if (existing) {
        throw { statusCode: 409, message: 'Organizer name already exists' };
      }
    }

    const updated = await OrganizerModel.update(organizerId, updateData);
    return updated;
  }

  /**
   * Delete organizer
   */
  static async deleteOrganizer(organizerId, userId) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    if (organizer.id_creator !== userId) {
      throw { statusCode: 403, message: 'Only creator can delete organizer' };
    }

    await OrganizerModel.delete(organizerId);
    return { message: 'Organizer deleted successfully' };
  }

  /**
   * Get organizers
   */
  static async getOrganizers(pagination) {
    const organizers = await OrganizerModel.getAll(pagination.limit, pagination.offset);
    return {
      organizers,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: organizers.length === pagination.limit,
    };
  }

  /**
   * Get user's organizers
   */
  static async getUserOrganizers(userId, pagination) {
    const organizers = await OrganizerModel.getByCreator(userId, pagination.limit, pagination.offset);
    return {
      organizers,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: organizers.length === pagination.limit,
    };
  }

  /**
   * Add admin to organizer
   */
  static async addAdmin(organizerId, newAdminId, role = 'admin', userId) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    const isAdmin = await OrganizerModel.isAdmin(organizerId, userId);
    if (!isAdmin && organizer.id_creator !== userId) {
      throw { statusCode: 403, message: 'Unauthorized' };
    }

    if (!ORGANIZER_ROLES.includes(role)) {
      throw { statusCode: 400, message: 'Invalid role' };
    }

    await OrganizerModel.addAdmin(organizerId, newAdminId, role);
    const admins = await OrganizerModel.getAdmins(organizerId);
    return admins;
  }

  /**
   * Remove admin from organizer
   */
  static async removeAdmin(organizerId, adminId, userId) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    if (organizer.id_creator !== userId) {
      throw { statusCode: 403, message: 'Only creator can remove admins' };
    }

    if (adminId === organizer.id_creator) {
      throw { statusCode: 400, message: 'Cannot remove creator from organizer' };
    }

    await OrganizerModel.removeAdmin(organizerId, adminId);
    return { message: 'Admin removed successfully' };
  }

  /**
   * Get organizer admins
   */
  static async getAdmins(organizerId, userId) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    const isAdmin = await OrganizerModel.isAdmin(organizerId, userId);
    if (!isAdmin && organizer.id_creator !== userId) {
      throw { statusCode: 403, message: 'Unauthorized' };
    }

    const admins = await OrganizerModel.getAdmins(organizerId);
    return admins;
  }

  /**
   * Follow organizer
   */
  static async followOrganizer(organizerId, userId) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    const isFollowing = await OrganizerModel.isFollowing(organizerId, userId);
    if (isFollowing) {
      throw { statusCode: 409, message: 'Already following this organizer' };
    }

    await OrganizerModel.addFollower(organizerId, userId);

    const { default: prisma } = await import('../config/prisma.js');
    const currentUser = await prisma.user.findUnique({
      where: { id_user: userId },
      select: { username: true, profile: { select: { photo_url: true } } },
    });
    if (currentUser && organizer.id_creator) {
      NotificationService.notify(organizer.id_creator, 'new_follower', currentUser.username,
        `${currentUser.username} empezó a seguir tu organización "${organizer.name}"`,
        { fromId: userId, fromPhoto: currentUser.profile?.photo_url,
          targetId: organizerId, targetType: 'organizer',
          targetLink: `/organizer/${organizerId}` }
      );
    }

    return { message: 'Following organizer' };
  }

  /**
   * Unfollow organizer
   */
  static async unfollowOrganizer(organizerId, userId) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    await OrganizerModel.removeFollower(organizerId, userId);
    return { message: 'Unfollowed organizer' };
  }

  /**
   * Get followers
   */
  static async getFollowers(organizerId, pagination) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    const followers = await OrganizerModel.getFollowers(organizerId, pagination.limit, pagination.offset);
    return {
      followers,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: followers.length === pagination.limit,
    };
  }

  /**
   * Get organizer events
   */
  static async getOrganizerEvents(organizerId, pagination) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    const events = await OrganizerModel.getEvents(organizerId, pagination.limit, pagination.offset);
    return {
      events,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: events.length === pagination.limit,
    };
  }

  /**
   * Get dashboard analytics
   */
  static async getDashboardAnalytics(organizerId, userId) {
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      throw { statusCode: 404, message: 'Organizer not found' };
    }

    const isAdmin = await OrganizerModel.isAdmin(organizerId, userId);
    if (!isAdmin && organizer.id_creator !== userId) {
      throw { statusCode: 403, message: 'Unauthorized' };
    }

    const analytics = await OrganizerModel.getDashboardAnalytics(organizerId);
    return analytics;
  }

  /**
   * Get user's admin organizers
   */
  static async getUserAdminOrganizers(userId) {
    return await OrganizerModel.getUserAdminOrganizers(userId);
  }
}

export default OrganizerService;
