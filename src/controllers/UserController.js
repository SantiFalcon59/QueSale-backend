import UserService from '../services/UserService.js';
import RecommendationService, { InteractionType } from '../services/RecommendationService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import prisma from '../config/prisma.js';

/**
 * User Controller
 */
export class UserController {
  /**
   * Helper to get internal DB id from Firebase UID
   */
  static async getInternalId(firebaseUid) {
    const user = await prisma.user.findUnique({ where: { firebase_uid: firebaseUid } });
    if (!user) throw { statusCode: 404, message: 'User not found in database' };
    return user.id_user;
  }

  /**
   * Update User Global Role (Admin only)
   */
  static async updateGlobalRole(req, res, next) {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      const updatedUser = await prisma.user.update({
        where: { id_user: userId },
        data: { global_role: role }
      });
      
      sendSuccess(res, updatedUser, `User role updated to ${role}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(req, res, next) {
    try {
      const userId = await UserController.getInternalId(req.user.id);
      const user = await UserService.getUserProfile(userId);
      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get organizations where user is admin
   */
  static async getAdminOrganizations(req, res, next) {
    try {
      const userId = await UserController.getInternalId(req.user.id);
      const organizations = await UserService.getAdminOrganizations(userId);
      sendSuccess(res, organizations, 'Admin organizations retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res, next) {
    try {
      const userId = await UserController.getInternalId(req.user.id);
      const { username, email, description, photo_url } = req.body;
      const user = await UserService.updateProfile(userId, { username, email, description, photo_url });
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set user interests
   */
  static async setInterests(req, res, next) {
    try {
      const userId = await UserController.getInternalId(req.user.id);
      const { interestIds } = req.body;
      const interests = await UserService.setInterests(userId, interestIds);
      sendSuccess(res, interests, 'Interests updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get saved events
   */
  static async getSavedEvents(req, res, next) {
    try {
      const userId = await UserController.getInternalId(req.user.id);
      const result = await UserService.getSavedEvents(userId, req.pagination);
      sendPaginated(res, result.events, req.pagination, 'Saved events retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save an event
   */
  static async saveEvent(req, res, next) {
    try {
      const userId = await UserController.getInternalId(req.user.id);
      const { eventId } = req.params;
      await UserService.saveEvent(userId, eventId);

      // Log behavior signal
      RecommendationService.logInteraction(userId, InteractionType.SAVE_EVENT, { eventId });

      sendSuccess(res, null, 'Event saved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unsave an event
   */
  static async unsaveEvent(req, res, next) {
    try {
      const userId = await UserController.getInternalId(req.user.id);
      const { eventId } = req.params;
      await UserService.unsaveEvent(userId, eventId);

      // Log behavior signal
      RecommendationService.logInteraction(userId, InteractionType.UNSAVE_EVENT, { eventId });

      sendSuccess(res, null, 'Event unsaved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users list
   */
  static async getUsers(req, res, next) {
    try {
      const { search } = req.query;
      const result = await UserService.getUsers(req.pagination, search);
      sendPaginated(res, result.users, req.pagination, 'Users retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get public profile
   */
  static async getPublicProfile(req, res, next) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id_user || null;
      const user = await UserService.getPublicProfile(userId, currentUserId);
      sendSuccess(res, user, 'Public profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getPublicProfileByUsername(req, res, next) {
    try {
      const { username } = req.params;
      const currentUserId = req.user?.id_user || null;
      const user = await UserService.getPublicProfileByUsername(username, currentUserId);
      sendSuccess(res, user, 'Public profile retrieved');
    } catch (error) {
      next(error);
    }
  }


  /**
   * Get user wall posts
   */
  static async getWall(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await UserService.getWall(userId, req.pagination);
      sendPaginated(res, result.posts, req.pagination, 'Wall posts retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create wall post
   */
  static async createWallPost(req, res, next) {
    try {
      const { userId } = req.params;
      const authorId = req.user.id;
      const { content } = req.body;
      const post = await UserService.createWallPost(userId, authorId, content);
      sendSuccess(res, post, 'Wall post created');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create wall comment
   */
  static async createWallComment(req, res, next) {
    try {
      const { postId } = req.params;
      const authorId = req.user.id;
      const { content } = req.body;
      const comment = await UserService.createWallComment(postId, authorId, content);
      sendSuccess(res, comment, 'Wall comment created');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete wall post
   */
  static async deleteWallPost(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      await UserService.deleteWallPost(postId, userId);
      sendSuccess(res, null, 'Wall post deleted');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete wall comment
   */
  static async deleteWallComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      await UserService.deleteWallComment(commentId, userId);
      sendSuccess(res, null, 'Wall comment deleted');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle wall post like
   */
  static async toggleWallPostLike(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      const post = await UserService.toggleWallPostLike(postId, userId);
      sendSuccess(res, post, 'Like toggled');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle wall comment like
   */
  static async toggleWallCommentLike(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      const comment = await UserService.toggleWallCommentLike(commentId, userId);
      sendSuccess(res, comment, 'Like toggled');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start Instagram linking
   */
  static async startInstagramLink(req, res, next) {
    try {
      const userId = req.user.id;
      const { instagram } = req.body;
      const result = await UserService.startInstagramLink(userId, instagram);
      sendSuccess(res, result, 'Instagram link started');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Instagram link
   */
  static async verifyInstagramLink(req, res, next) {
    try {
      const userId = req.user.id;
      const { code } = req.body;
      const result = await UserService.verifyInstagramLink(userId, code);
      sendSuccess(res, result, 'Instagram verified');
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
