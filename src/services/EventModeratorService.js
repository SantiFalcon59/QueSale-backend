import prisma from '../config/prisma.js';
import { isEventModerator } from '../utils/organizerCheck.js';

export class EventModeratorService {
  static async blockUser(eventId, targetUserId, blockedByUserId, reason) {
    const isMod = await isEventModerator(blockedByUserId, eventId);
    if (!isMod) {
      throw { statusCode: 403, message: 'Not authorized to block users in this event' };
    }

    const existing = await prisma.eventBlockedUser.findUnique({
      where: { id_event_id_user: { id_event: eventId, id_user: targetUserId } },
    });
    if (existing) {
      throw { statusCode: 409, message: 'User is already blocked from this event' };
    }

    return await prisma.eventBlockedUser.create({
      data: {
        id_event: eventId,
        id_user: targetUserId,
        blocked_by: blockedByUserId,
        reason: reason || null,
      },
    });
  }

  static async unblockUser(eventId, targetUserId, blockedByUserId) {
    const isMod = await isEventModerator(blockedByUserId, eventId);
    if (!isMod) {
      throw { statusCode: 403, message: 'Not authorized to unblock users in this event' };
    }

    const existing = await prisma.eventBlockedUser.findUnique({
      where: { id_event_id_user: { id_event: eventId, id_user: targetUserId } },
    });
    if (!existing) {
      throw { statusCode: 404, message: 'User is not blocked from this event' };
    }

    await prisma.eventBlockedUser.delete({
      where: { id_event_id_user: { id_event: eventId, id_user: targetUserId } },
    });
    return true;
  }

  static async getBlockedUsers(eventId, userId) {
    const isMod = await isEventModerator(userId, eventId);
    if (!isMod) {
      throw { statusCode: 403, message: 'Not authorized to view blocked users' };
    }

    return await prisma.eventBlockedUser.findMany({
      where: { id_event: eventId },
      include: {
        user: { select: { id_user: true, username: true } },
        blocker: { select: { id_user: true, username: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}

export default EventModeratorService;
