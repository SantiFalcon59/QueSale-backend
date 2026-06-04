import CommunityService from '../services/CommunityService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

export class CommunityController {
  static async search(req, res, next) {
    try {
      const { q, type = 'all' } = req.query;
      if (!q || q.trim().length < 2) {
        return sendError(res, 'La búsqueda debe tener al menos 2 caracteres', 400);
      }
      const { limit, offset } = req.pagination || { limit: 20, offset: 0 };
      const results = await CommunityService.search(q.trim(), type, limit, offset);
      sendSuccess(res, results, 'Community search results');
    } catch (error) {
      next(error);
    }
  }

  static async followUser(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await CommunityService.followUser(req.user.id, userId);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async unfollowUser(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await CommunityService.unfollowUser(req.user.id, userId);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async getUserFollowers(req, res, next) {
    try {
      const { userId } = req.params;
      const { limit, offset } = req.pagination || { limit: 20, offset: 0 };
      const followers = await CommunityService.getUserFollowers(userId, limit, offset);
      sendSuccess(res, followers, 'Followers retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getUserFollowing(req, res, next) {
    try {
      const { userId } = req.params;
      const { limit, offset } = req.pagination || { limit: 20, offset: 0 };
      const following = await CommunityService.getUserFollowing(userId, limit, offset);
      sendSuccess(res, following, 'Following retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async checkFollowing(req, res, next) {
    try {
      const { userId } = req.params;
      const isFollowing = await CommunityService.getIsFollowing(req.user.id, userId);
      sendSuccess(res, { isFollowing }, 'Follow status');
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendations(req, res, next) {
    try {
      const { limit, offset } = req.pagination || { limit: 10, offset: 0 };
      const recommendations = await CommunityService.getRecommendations(req.user?.id, limit, offset);
      sendSuccess(res, recommendations, 'Recommendations retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default CommunityController;
