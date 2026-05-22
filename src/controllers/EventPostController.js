import EventPostService from '../services/EventPostService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';

/**
 * Event Post Controller
 */
export class EventPostController {
  static async getEventPosts(req, res, next) {
    try {
      const { eventId } = req.params;
      const { type } = req.query;
      const posts = await EventPostService.getPosts(eventId, type, req.pagination);
      return sendPaginated(res, posts, req.pagination, 'Event posts retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async createEventPost(req, res, next) {
    try {
      const { eventId } = req.params;
      const { content, type } = req.body;
      const userId = req.user.id;
      const post = await EventPostService.createPost(eventId, userId, content, type);
      return sendSuccess(res, post, 'Event post created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteEventPost(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      await EventPostService.deletePost(postId, userId);
      return sendSuccess(res, null, 'Event post deleted');
    } catch (error) {
      next(error);
    }
  }

  static async createEventComment(req, res, next) {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.user.id;
      const comment = await EventPostService.createComment(postId, userId, content);
      return sendSuccess(res, comment, 'Comment created', 201);
    } catch (error) {
      next(error);
    }
  }

  static async deleteEventComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      await EventPostService.deleteComment(commentId, userId);
      return sendSuccess(res, null, 'Comment deleted');
    } catch (error) {
      next(error);
    }
  }

  static async togglePostLike(req, res, next) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      const post = await EventPostService.togglePostLike(postId, userId);
      return sendSuccess(res, post, 'Like toggled');
    } catch (error) {
      next(error);
    }
  }

  static async toggleCommentLike(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.user.id;
      const comment = await EventPostService.toggleCommentLike(commentId, userId);
      return sendSuccess(res, comment, 'Like toggled');
    } catch (error) {
      next(error);
    }
  }
}

export default EventPostController;
