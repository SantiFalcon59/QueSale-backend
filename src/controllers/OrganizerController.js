import OrganizerService from '../services/OrganizerService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import prisma from '../config/prisma.js';
import { RecommendationService, InteractionType } from '../services/RecommendationService.js';

/**
 * Organizer Controller
 */
export class OrganizerController {
  /**
   * Verify Organizer
   */
  static async verifyOrganizer(req, res, next) {
    try {
      const { organizerId } = req.params;
      const { verified } = req.body;
      
      const updated = await prisma.organizer.update({
        where: { id_organizer: organizerId },
        data: { verified }
      });
      
      sendSuccess(res, updated, `Organizer ${verified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Create organizer
   */
  static async createOrganizer(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, description } = req.body;
      const organizer = await OrganizerService.createOrganizer({ name, description }, userId);
      sendSuccess(res, organizer, 'Organizer created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get organizer details
   */
  static async getOrganizerDetails(req, res, next) {
    try {
      const { organizerId } = req.params;
      const currentUserId = req.user?.id || req.user?.userId || null;
      const organizer = await OrganizerService.getOrganizerDetails(organizerId, currentUserId);

      // Log profile view signal
      if (currentUserId) {
        RecommendationService.logInteraction(currentUserId, InteractionType.VIEW_ORGANIZER_PROFILE, {
          organizerId,
          metadata: { viewedUserId: organizer.id_creator }
        });
      }

      sendSuccess(res, organizer, 'Organizer retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update organizer
   */
  static async updateOrganizer(req, res, next) {
    try {
      const userId = req.user.id;
      const { organizerId } = req.params;
      const updateData = req.body;
      const organizer = await OrganizerService.updateOrganizer(organizerId, updateData, userId);
      sendSuccess(res, organizer, 'Organizer updated');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete organizer
   */
  static async deleteOrganizer(req, res, next) {
    try {
      const userId = req.user.id;
      const { organizerId } = req.params;
      const result = await OrganizerService.deleteOrganizer(organizerId, userId);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all organizers
   */
  static async getOrganizers(req, res, next) {
    try {
      const result = await OrganizerService.getOrganizers(req.pagination);
      sendPaginated(res, result.organizers, req.pagination, 'Organizers retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's organizers
   */
  static async getUserOrganizers(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await OrganizerService.getUserOrganizers(userId, req.pagination);
      sendPaginated(res, result.organizers, req.pagination, 'Your organizers retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add admin to organizer
   */
  static async addAdmin(req, res, next) {
    try {
      const userId = req.user.id;
      const { organizerId } = req.params;
      const { adminId, role = 'admin' } = req.body;
      const admins = await OrganizerService.addAdmin(organizerId, adminId, role, userId);
      sendSuccess(res, admins, 'Admin added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove admin from organizer
   */
  static async removeAdmin(req, res, next) {
    try {
      const userId = req.user.id;
      const { organizerId, adminId } = req.params;
      const result = await OrganizerService.removeAdmin(organizerId, adminId, userId);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get organizer admins
   */
  static async getAdmins(req, res, next) {
    try {
      const userId = req.user.id;
      const { organizerId } = req.params;
      const admins = await OrganizerService.getAdmins(organizerId, userId);
      sendSuccess(res, admins, 'Admins retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Follow organizer
   */
  static async followOrganizer(req, res, next) {
    try {
      const userId = req.user.id;
      const { organizerId } = req.params;
      const result = await OrganizerService.followOrganizer(organizerId, userId);
      sendSuccess(res, result, result.message, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unfollow organizer
   */
  static async unfollowOrganizer(req, res, next) {
    try {
      const userId = req.user.id;
      const { organizerId } = req.params;
      const result = await OrganizerService.unfollowOrganizer(organizerId, userId);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get followers
   */
  static async getFollowers(req, res, next) {
    try {
      const { organizerId } = req.params;
      const result = await OrganizerService.getFollowers(organizerId, req.pagination);
      sendPaginated(res, result.followers, req.pagination, 'Followers retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get organizer events
   */
  static async getOrganizerEvents(req, res, next) {
    try {
      const { organizerId } = req.params;
      const result = await OrganizerService.getOrganizerEvents(organizerId, req.pagination);
      sendPaginated(res, result.events, req.pagination, 'Events retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard analytics
   */
  static async getDashboardAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const { organizerId } = req.params;
      const analytics = await OrganizerService.getDashboardAnalytics(organizerId, userId);
      sendSuccess(res, analytics, 'Analytics retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default OrganizerController;
