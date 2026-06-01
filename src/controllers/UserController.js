import UserService from '../services/UserService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

/**
 * User Controller
 */
export class UserController {
  /**
   * Get user profile
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await UserService.getUserProfile(userId);
      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const { eventId } = req.params;
      await UserService.saveEvent(userId, eventId);
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
      const userId = req.user.id;
      const { eventId } = req.params;
      await UserService.unsaveEvent(userId, eventId);
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
      const result = await UserService.getUsers(req.pagination);
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
      const user = await UserService.getPublicProfile(userId);
      sendSuccess(res, user, 'Public profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get public profile by username
   */
  static async getPublicProfileByUsername(req, res, next) {
    try {
      const { username } = req.params;
      const user = await UserService.getPublicProfileByUsername(username);
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
