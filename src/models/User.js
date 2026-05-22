import prisma from '../config/prisma.js';

/**
 * User Model
 */
export class UserModel {
  /**
   * Create new user
   */
  static async create(userData) {
    const {
      id_user,
      firebase_uid,
      username,
      email,
      verified,
      created_at,
      updated_at,
    } = userData;
    const user = await prisma.user.create({
      data: {
        id_user,
        firebase_uid,
        username,
        email,
        verified: !!verified,
        created_at: created_at || new Date(),
        updated_at: updated_at || new Date(),
      },
    });
    return user;
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    return await prisma.user.findUnique({ where: { id_user: id } });
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    return await prisma.user.findUnique({ where: { username } });
  }

  /**
   * Get all users
   */
  static async getAll(limit, offset) {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return users.map(user => ({
      ...user,
      photo_url: user.profile?.photo_url || null,
      description: user.profile?.description || null,
    }));
  }

  /**
   * Update user
   */
  static async update(id, updateData) {
    return await prisma.user.update({
      where: { id_user: id },
      data: { ...updateData, updated_at: new Date() },
    });
  }

  /**
   * Get user profile (base + profile fields)
   */
  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id_user: userId },
      include: { profile: true },
    });

    if (!user) return null;

    const { profile, ...rest } = user;
    return {
      ...rest,
      photo_url: profile?.photo_url || null,
      description: profile?.description || null,
      instagram: profile?.instagram || null,
      instagram_verified: profile?.instagram_verified || 0,
      instagram_verification_code: profile?.instagram_verification_code || null,
      instagram_verified_at: profile?.instagram_verified_at || null,
    };
  }

  /**
   * Upsert user profile fields
   */
  static async upsertProfile(userId, profileData) {
    const { description = null, photo_url = null } = profileData;
    await prisma.userProfile.upsert({
      where: { id_user: userId },
      update: { description, photo_url },
      create: { id_user: userId, description, photo_url },
    });
    return this.getProfile(userId);
  }

  /**
   * Start Instagram link flow
   */
  static async startInstagramLink(userId, instagram, code) {
    await prisma.userProfile.upsert({
      where: { id_user: userId },
      update: {
        instagram,
        instagram_verified: false,
        instagram_verification_code: code,
        instagram_verified_at: null,
      },
      create: {
        id_user: userId,
        instagram,
        instagram_verified: false,
        instagram_verification_code: code,
      },
    });
  }

  /**
   * Verify Instagram link with code
   */
  static async verifyInstagramLink(userId, code) {
    const result = await prisma.userProfile.updateMany({
      where: { id_user: userId, instagram_verification_code: code },
      data: {
        instagram_verified: true,
        instagram_verified_at: new Date(),
        instagram_verification_code: null,
      },
    });
    return result.count || 0;
  }

  /**
   * Verify user email
   */
  static async verify(id) {
    await prisma.user.update({
      where: { id_user: id },
      data: { verified: true, updated_at: new Date() },
    });
  }

  /**
   * Get user interests
   */
  static async getInterests(userId) {
    const result = await prisma.userInterest.findMany({
      where: { id_user: userId },
      include: { interest: true },
    });
    return result.map(item => item.interest);
  }

  /**
   * Set user interests
   */
  static async setInterests(userId, interestIds) {
    await prisma.$transaction(async (tx) => {
      await tx.userInterest.deleteMany({ where: { id_user: userId } });

      if (interestIds && interestIds.length > 0) {
        await tx.userInterest.createMany({
          data: interestIds.map(id => ({ id_user: userId, id_interest: id })),
          skipDuplicates: true,
        });
      }
    });
  }

  /**
   * Get saved events
   */
  static async getSavedEvents(userId, limit, offset) {
    const saved = await prisma.savedEvent.findMany({
      where: { id_user: userId },
      include: { event: true },
      take: limit,
      skip: offset,
    });
    return saved.map(item => item.event);
  }

  /**
   * Save an event
   */
  static async saveEvent(userId, eventId) {
    return await prisma.savedEvent.upsert({
      where: {
        id_user_id_event: {
          id_user: userId,
          id_event: eventId,
        },
      },
      update: {},
      create: {
        id_user: userId,
        id_event: eventId,
      },
    });
  }

  /**
   * Unsave an event
   */
  static async unsaveEvent(userId, eventId) {
    try {
      return await prisma.savedEvent.delete({
        where: {
          id_user_id_event: {
            id_user: userId,
            id_event: eventId,
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null; // Record not found
      }
      throw error;
    }
  }

  /**
   * Count saved events
   */
  static async countSavedEvents(userId) {
    return await prisma.savedEvent.count({ where: { id_user: userId } });
  }

  /**
   * Get recent events attended by user (public)
   */
  static async getRecentEvents(userId, limit = 5) {
    const tickets = await prisma.ticket.findMany({
      where: {
        id_user: userId,
        event: { date: { lte: new Date() } },
      },
      include: {
        event: {
          include: { organizer: true },
        },
      },
      orderBy: { event: { date: 'desc' } },
      take: limit,
    });

    return tickets.map(item => ({
      id_event: item.event.id_event,
      title: item.event.title,
      date: item.event.date,
      ubication: item.event.ubication,
      thumbnail_url: item.event.thumbnail_url,
      id_organizer: item.event.organizer?.id_organizer || null,
      organizer_name: item.event.organizer?.name || null,
    }));
  }

  /**
   * Get organizations where user is admin
   */
  static async getAdminOrganizations(userId) {
    const admins = await prisma.organizerAdmin.findMany({
      where: { id_user: userId },
      include: { organizer: true },
      orderBy: { created_at: 'desc' },
    });

    return admins.map(item => ({
      id_organizer: item.organizer.id_organizer,
      name: item.organizer.name,
      description: item.organizer.description,
      logo_url: item.organizer.logo_url,
      role: item.role,
    }));
  }

  /**
   * Get organizations where user is a frequent member
   */
  static async getFrequentOrganizations(userId) {
    const follows = await prisma.organizerFollower.findMany({
      where: { id_user: userId },
      include: { organizer: true },
      orderBy: { created_at: 'desc' },
    });

    return follows.map(item => ({
      id_organizer: item.organizer.id_organizer,
      name: item.organizer.name,
      description: item.organizer.description,
      logo_url: item.organizer.logo_url,
    }));
  }

  /**
   * Get wall posts for a profile
   */
  static async getWallPosts(profileUserId, limit, offset) {
    const posts = await prisma.userWallPost.findMany({
      where: { id_profile_user: profileUserId },
      include: {
        authorUser: { select: { username: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return posts.map(post => ({
      ...post,
      author_username: post.authorUser?.username || null,
      author_email: post.authorUser?.email || null,
    }));
  }

  /**
   * Get wall comments by post ids
   */
  static async getWallComments(postIds) {
    if (!postIds || postIds.length === 0) {
      return [];
    }

    const comments = await prisma.userWallComment.findMany({
      where: { id_post: { in: postIds } },
      include: {
        authorUser: { select: { username: true, email: true } },
      },
      orderBy: { created_at: 'asc' },
    });

    return comments.map(comment => ({
      ...comment,
      author_username: comment.authorUser?.username || null,
      author_email: comment.authorUser?.email || null,
    }));
  }

  /**
   * Create a wall post
   */
  static async createWallPost(profileUserId, authorUserId, content) {
    await prisma.userWallPost.create({
      data: {
        id_profile_user: profileUserId,
        id_author_user: authorUserId,
        content,
      },
    });
  }

  /**
   * Create a wall comment
   */
  static async createWallComment(postId, authorUserId, content) {
    await prisma.userWallComment.create({
      data: {
        id_post: postId,
        id_author_user: authorUserId,
        content,
      },
    });
  }

  /**
   * Delete a wall post
   */
  static async deleteWallPost(postId, userId) {
    // Only author or profile owner can delete
    const post = await prisma.userWallPost.findUnique({
      where: { id_post: postId },
    });

    if (!post) return false;

    if (post.id_author_user !== userId && post.id_profile_user !== userId) {
      throw { statusCode: 403, message: 'Not authorized to delete this post' };
    }

    await prisma.userWallPost.delete({ where: { id_post: postId } });
    return true;
  }

  /**
   * Delete a wall comment
   */
  static async deleteWallComment(commentId, userId) {
    const comment = await prisma.userWallComment.findUnique({
      where: { id_comment: commentId },
      include: { post: true },
    });

    if (!comment) return false;

    if (
      comment.id_author_user !== userId &&
      comment.post.id_profile_user !== userId
    ) {
      throw { statusCode: 403, message: 'Not authorized to delete this comment' };
    }

    await prisma.userWallComment.delete({ where: { id_comment: commentId } });
    return true;
  }

  /**
   * Toggle like on a wall post
   */
  static async toggleWallPostLike(postId, userId) {
    const existing = await prisma.userWallPostLike.findUnique({
      where: { id_post_id_user: { id_post: postId, id_user: userId } },
    });

    return await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.userWallPostLike.delete({
          where: { id_post_id_user: { id_post: postId, id_user: userId } },
        });
        return await tx.userWallPost.update({
          where: { id_post: postId },
          data: { likes_count: { decrement: 1 } },
        });
      } else {
        await tx.userWallPostLike.create({
          data: { id_post: postId, id_user: userId },
        });
        return await tx.userWallPost.update({
          where: { id_post: postId },
          data: { likes_count: { increment: 1 } },
        });
      }
    });
  }

  /**
   * Toggle like on a wall comment
   */
  static async toggleWallCommentLike(commentId, userId) {
    const existing = await prisma.userWallCommentLike.findUnique({
      where: { id_comment_id_user: { id_comment: commentId, id_user: userId } },
    });

    return await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.userWallCommentLike.delete({
          where: { id_comment_id_user: { id_comment: commentId, id_user: userId } },
        });
        return await tx.userWallComment.update({
          where: { id_comment: commentId },
          data: { likes_count: { decrement: 1 } },
        });
      } else {
        await tx.userWallCommentLike.create({
          data: { id_comment: commentId, id_user: userId },
        });
        return await tx.userWallComment.update({
          where: { id_comment: commentId },
          data: { likes_count: { increment: 1 } },
        });
      }
    });
  }
}

export default UserModel;
