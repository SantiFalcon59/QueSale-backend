import UserModel from '../models/User.js';
import OrganizerModel from '../models/Organizer.js';

export class CommunityService {
  static async search(query, type = 'all', limit = 20, offset = 0) {
    const results = { users: [], organizers: [] };

    if (type === 'all' || type === 'users') {
      const users = await UserModel.searchUsers(query, limit, offset);
      results.users = users;
    }

    if (type === 'all' || type === 'organizations') {
      const organizers = await OrganizerModel.searchByName(query, limit, offset);
      results.organizers = organizers;
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
}

export default CommunityService;
