import WallService from '../services/WallService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

export class WallController {
  static async getPosts(req, res, next) {
    try {
      const { wallType, wallId } = req.params;
      const typeFilter = req.query.type || null;
      const currentUserId = req.user?.id || null;
      const result = await WallService.getPosts(wallType, wallId, req.pagination, typeFilter, currentUserId);
      sendPaginated(res, result, req.pagination, 'Posts retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createPost(req, res, next) {
    try {
      const { wallType, wallId } = req.params;
      const userId = req.user.id;
      const { content, type, media } = req.body;
      const post = await WallService.createPost(wallType, wallId, userId, content, type, media);
      sendSuccess(res, post, 'Post created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deletePost(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      await WallService.deletePost(parseInt(postId), userId);
      sendSuccess(res, null, 'Post deleted');
    } catch (error) {
      next(error);
    }
  }

  static async createComment(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      const { content } = req.body;
      const comment = await WallService.createComment(parseInt(postId), userId, content);
      sendSuccess(res, comment, 'Comment created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      await WallService.deleteComment(parseInt(commentId), userId);
      sendSuccess(res, null, 'Comment deleted');
    } catch (error) {
      next(error);
    }
  }

  static async toggleReaction(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      const { type } = req.body;
      if (!type) return sendError(res, 'Reaction type is required', 400);
      await WallService.toggleReaction(parseInt(postId), userId, type);
      const reactions = await WallService.getPostReactions(parseInt(postId));
      sendSuccess(res, { reactions }, 'Reaction toggled');
    } catch (error) {
      next(error);
    }
  }
}

export default WallController;
