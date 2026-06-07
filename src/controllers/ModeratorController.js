import EventModeratorService from '../services/EventModeratorService.js';
import { sendSuccess } from '../utils/response.js';

export class ModeratorController {
  static async blockUser(req, res, next) {
    try {
      const { eventId } = req.params;
      const { userId: targetUserId, reason } = req.body;
      const blockedByUserId = req.user.id;
      const result = await EventModeratorService.blockUser(eventId, targetUserId, blockedByUserId, reason);
      return sendSuccess(res, result, 'User blocked from event');
    } catch (error) {
      next(error);
    }
  }

  static async unblockUser(req, res, next) {
    try {
      const { eventId, userId: targetUserId } = req.params;
      const blockedByUserId = req.user.id;
      await EventModeratorService.unblockUser(eventId, targetUserId, blockedByUserId);
      return sendSuccess(res, null, 'User unblocked');
    } catch (error) {
      next(error);
    }
  }

  static async getBlockedUsers(req, res, next) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const blocked = await EventModeratorService.getBlockedUsers(eventId, userId);
      return sendSuccess(res, blocked, 'Blocked users retrieved');
    } catch (error) {
      next(error);
    }
  }
}

export default ModeratorController;
