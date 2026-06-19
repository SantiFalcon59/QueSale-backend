import UserModel from '../models/User.js';
import prisma from '../config/prisma.js';

/**
 * User Service
 */
export class UserService {
  /**
   * Get user profile
   */
  static async getUserProfile(userId) {
    const user = await UserModel.getProfile(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const interests = await UserModel.getInterests(userId);
    const recentEvents = await UserModel.getRecentEvents(userId, 5);
    const adminOrganizations = await UserModel.getAdminOrganizations(userId);
    const frequentOrganizations = await UserModel.getFrequentOrganizations(userId);
    return {
      ...user,
      is_premium: !!user.is_premium,
      premium_until: user.premium_until,
      description: user.description || '',
      instagram: user.instagram || '',
      instagramVerified: !!user.instagram_verified,
      instagramVerifiedAt: user.instagram_verified_at,
      usernameLastChangedAt: user.username_last_changed_at,
      interests: interests.map(i => ({ id: i.id_interest, name: i.name })),
      recentEvents,
      organizations: {
        admin: adminOrganizations,
        frequent: frequentOrganizations,
      },
    };
  }

  /**
   * Get organizations where user is admin
   */
  static async getAdminOrganizations(userId) {
    return await UserModel.getAdminOrganizations(userId);
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId, updateData) {
    const { description, photo_url, ...userFields } = updateData;
    let user = await UserModel.findById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (userFields.username && userFields.username !== user.username) {
      const existing = await UserModel.findByUsername(userFields.username);
      if (existing && existing.id_user !== userId) {
        throw { statusCode: 409, message: 'Username already taken' };
      }

      const lastChanged = user.username_last_changed_at ? new Date(user.username_last_changed_at) : null;
      if (lastChanged) {
        const nextAllowed = new Date(lastChanged.getTime());
        nextAllowed.setDate(nextAllowed.getDate() + 7);
        if (new Date() < nextAllowed) {
          throw {
            statusCode: 400,
            message: `Username can be changed again on ${nextAllowed.toISOString()}`,
          };
        }
      }

      userFields.username_last_changed_at = new Date();
    }

    if (Object.keys(userFields).length > 0) {
      user = await UserModel.update(userId, userFields);
    }
    if (description !== undefined || photo_url !== undefined) {
      user = await UserModel.upsertProfile(userId, { description, photo_url });
    }
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }
    return user;
  }

  /**
   * Set user interests
   */
  static async setInterests(userId, interestIds) {
    await UserModel.setInterests(userId, interestIds);
    const interests = await UserModel.getInterests(userId);
    return interests;
  }

  /**
   * Get saved events
   */
  static async getSavedEvents(userId, pagination) {
    const events = await UserModel.getSavedEvents(userId, pagination.limit, pagination.offset);
    const total = await UserModel.countSavedEvents(userId);
    return {
      events,
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: events.length === pagination.limit,
    };
  }

  /**
   * Save an event
   */
  static async saveEvent(userId, eventId) {
    return await UserModel.saveEvent(userId, eventId);
  }

  /**
   * Unsave an event
   */
  static async unsaveEvent(userId, eventId) {
    return await UserModel.unsaveEvent(userId, eventId);
  }

  /**
   * Get users list (admin)
   */
  static async getUsers(pagination, searchQuery = null) {
    let users, total;
    
    if (searchQuery) {
      users = await UserModel.searchUsers(searchQuery, pagination.limit, pagination.offset);
      total = await UserModel.countSearchUsers(searchQuery);
    } else {
      users = await UserModel.getAll(pagination.limit, pagination.offset);
      total = await prisma.user.count();
    }

    return {
      users,
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: users.length === pagination.limit,
    };
  }

  /**
   * Get user public profile
   */
  static async getPublicProfile(userId, currentUserId = null) {
    const user = await UserModel.getProfile(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    const recentEvents = await UserModel.getRecentEvents(userId, 5);
    const adminOrganizations = await UserModel.getAdminOrganizations(userId);
    const frequentOrganizations = await UserModel.getFrequentOrganizations(userId);

    const eventsCount = await prisma.event.count({ where: { id_creator: userId } });
    const followersCount = await prisma.organizerFollower.count({
      where: { organizer: { id_creator: userId } },
    });
    const followingCount = await prisma.organizerFollower.count({
      where: { id_user: userId },
    });

    let is_followed = false;
    if (currentUserId && currentUserId !== userId) {
      const followRecord = await prisma.userFollower.findUnique({
        where: { id_user_id_follower: { id_user: userId, id_follower: currentUserId } },
      });
      is_followed = !!followRecord;
    }

    return {
      id: user.id_user,
      username: user.username,
      photo_url: user.photo_url || null,
      description: user.description || '',
      instagram: user.instagram || '',
      instagramVerified: !!user.instagram_verified,
      instagramVerifiedAt: user.instagram_verified_at,
      usernameLastChangedAt: user.username_last_changed_at,
      verified: !!user.verified,
      is_premium: !!user.is_premium,
      premium_until: user.premium_until,
      createdAt: user.created_at,
      is_followed,
      stats: {
        events: eventsCount,
        followers: followersCount,
        following: followingCount,
        vibeScore: 0,
      },
      recentEvents,
      organizations: {
        admin: adminOrganizations,
        frequent: frequentOrganizations,
      },
    };
  }

  static async getPublicProfileByUsername(username, currentUserId = null) {
    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }
    return this.getPublicProfile(user.id_user, currentUserId);
  }

  /**
   * Start Instagram linking
   */
  static async startInstagramLink(userId, instagram) {
    const normalized = instagram.replace(/^@/, '').trim();
    const code = `QS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await UserModel.startInstagramLink(userId, normalized, code);
    return { instagram: normalized, code };
  }

  /**
   * Verify Instagram link
   */
  static async verifyInstagramLink(userId, code) {
    const normalizedCode = code.trim().toUpperCase();
    const updated = await UserModel.verifyInstagramLink(userId, normalizedCode);
    if (!updated) {
      throw { statusCode: 400, message: 'Invalid verification code' };
    }
    return { verified: true };
  }

  /**
   * Get wall posts for a user profile
   */
  static async getWall(profileUserId, pagination) {
    const posts = await UserModel.getWallPosts(profileUserId, pagination.limit, pagination.offset);
    const postIds = posts.map(post => post.id_post);
    const comments = await UserModel.getWallComments(postIds);
    const commentsByPost = comments.reduce((acc, comment) => {
      acc[comment.id_post] = acc[comment.id_post] || [];
      acc[comment.id_post].push(comment);
      return acc;
    }, {});

    const postsWithComments = posts.map(post => ({
      ...post,
      comments: commentsByPost[post.id_post] || [],
    }));

    return {
      posts: postsWithComments,
      total: postsWithComments.length,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: postsWithComments.length === pagination.limit,
    };
  }

  /**
   * Create wall post
   */
  static async createWallPost(profileUserId, authorUserId, content) {
    await UserModel.createWallPost(profileUserId, authorUserId, content);
    const posts = await UserModel.getWallPosts(profileUserId, 1, 0);
    return posts[0] || null;
  }

  /**
   * Create wall comment
   */
  static async createWallComment(postId, authorUserId, content) {
    await UserModel.createWallComment(postId, authorUserId, content);
    const comments = await UserModel.getWallComments([postId]);
    return comments[comments.length - 1] || null;
  }

  /**
   * Delete wall post
   */
  static async deleteWallPost(postId, userId) {
    return await UserModel.deleteWallPost(postId, userId);
  }

  /**
   * Delete wall comment
   */
  static async deleteWallComment(commentId, userId) {
    return await UserModel.deleteWallComment(commentId, userId);
  }

  /**
   * Toggle wall post like
   */
  static async toggleWallPostLike(postId, userId) {
    return await UserModel.toggleWallPostLike(postId, userId);
  }

  /**
   * Toggle wall comment like
   */
  static async toggleWallCommentLike(commentId, userId) {
    return await UserModel.toggleWallCommentLike(commentId, userId);
  }
}

export default UserService;
