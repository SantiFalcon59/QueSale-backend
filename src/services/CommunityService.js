import UserModel from '../models/User.js';
import OrganizerModel from '../models/Organizer.js';
import EventModel from '../models/Event.js';
import { NotificationService } from './NotificationService.js';

export class CommunityService {
  static async search(query, type = 'all', limit = 20, offset = 0) {
    const results = { users: [], organizers: [], events: [] };

    if (type === 'all' || type === 'users') {
      const users = await UserModel.searchUsers(query, limit, offset);
      results.users = users;
    }

    if (type === 'all' || type === 'organizers') {
      const organizers = await OrganizerModel.searchByName(query, limit, offset);
      results.organizers = organizers;
    }

    if (type === 'all' || type === 'events') {
      const events = await EventModel.searchEvents(query, limit, offset);
      results.events = events;
    }

    return results;
  }

  static async followUser(userId, targetUserId) {
    if (userId === targetUserId) {
      throw { statusCode: 400, message: 'No puedes seguirte a ti mismo' };
    }

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      throw { statusCode: 404, message: 'Usuario no encontrado' };
    }

    const result = await UserModel.followUser(targetUserId, userId);
    if (result === null) {
      throw { statusCode: 409, message: 'Ya sigues a este usuario' };
    }

    const { default: prisma } = await import('../config/prisma.js');
    const currentUser = await prisma.user.findUnique({
      where: { id_user: userId },
      select: { username: true, profile: { select: { photo_url: true } } },
    });
    if (currentUser) {
      NotificationService.notify(targetUserId, 'new_follower', currentUser.username,
        `${currentUser.username} empezó a seguirte`,
        { fromId: userId, fromPhoto: currentUser.profile?.photo_url,
          targetId: targetUserId, targetType: 'user',
          targetLink: `/@${currentUser.username}` }
      );
    }

    return { message: 'Usuario seguido exitosamente' };
  }

  static async unfollowUser(userId, targetUserId) {
    const result = await UserModel.unfollowUser(targetUserId, userId);
    if (result === null) {
      throw { statusCode: 404, message: 'No sigues a este usuario' };
    }

    return { message: 'Dejaste de seguir al usuario' };
  }

  static async getUserFollowers(userId, limit, offset) {
    return await UserModel.getFollowers(userId, limit, offset);
  }

  static async getUserFollowing(userId, limit, offset) {
    return await UserModel.getFollowing(userId, limit, offset);
  }

  static async getIsFollowing(userId, targetUserId) {
    return await UserModel.isFollowing(targetUserId, userId);
  }

  static async getRecommendations(userId, limit = 10, offset = 0) {
    const [users, organizers] = await Promise.all([
      UserModel.getAll(limit, offset),
      OrganizerModel.getAll(limit, offset),
    ]);

    return { users, organizers };
  }

  static async getSocialFeed(userId, limit = 20, offset = 0) {
    const { default: prisma } = await import('../config/prisma.js');
    try {
      const posts = await prisma.post.findMany({
        include: {
          postType: true,
          user: {
            select: {
              id_user: true,
              username: true,
              profile: { select: { photo_url: true } },
            },
          },
          event: {
            select: {
              id_event: true,
              title: true,
            },
          },
          reactions: {
            select: { id_user: true, type: true },
          },
          comments: {
            include: { user: { select: { id_user: true, username: true } } },
            orderBy: { created_at: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      });

      return posts.map(post => {
        const reactionCounts = {};
        let userReaction = null;
        for (const r of post.reactions) {
          reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
          if (userId && r.id_user === userId) userReaction = r.type;
        }

        const { reactions: _, ...postData } = post;
        return {
          ...postData,
          type: post.postType?.name || null,
          author: post.user?.username || 'Anónimo',
          author_photo_url: post.user?.profile?.photo_url || null,
          reactions: reactionCounts,
          user_reaction: userReaction,
          event: post.event ? { id_event: post.event.id_event, title: post.event.title } : null,
        };
      });
    } catch (error) {
      console.error('Error fetching social feed:', error);
      return [];
    }
  }
}

export default CommunityService;
