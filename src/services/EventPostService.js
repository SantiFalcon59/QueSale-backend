import prisma from '../config/prisma.js';
import { isEventModerator, canCreateAnnouncement } from '../utils/organizerCheck.js';

/**
 * Event Post Service
 */
export class EventPostService {
  static async getPosts(eventId, type = null, pagination) {
    const where = { id_event: eventId };

    if (type) {
      where.postType = { name: type.toLowerCase() };
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        postType: true,
        user: { select: { id_user: true, username: true } },
        comments: {
          include: { user: { select: { id_user: true, username: true } } },
          orderBy: { created_at: 'asc' },
        },
      },
      orderBy: { created_at: 'desc' },
      take: pagination?.limit,
      skip: pagination?.offset,
    });

    return posts.map(post => ({
      ...post,
      type: post.postType?.name || null,
      author: post.user?.username || 'Anónimo',
      comments: post.comments.map(c => ({
        ...c,
        author: c.user?.username || 'Anónimo',
      })),
    }));
  }

  static async createPost(eventId, userId, content, type = 'comment') {
    const typeName = (type || 'comment').toLowerCase();

    if (typeName === 'announcement') {
      const canAnnounce = await canCreateAnnouncement(userId, eventId);
      if (!canAnnounce) {
        throw { statusCode: 403, message: 'Only organizers can create announcements' };
      }
    }

    let postType = await prisma.postType.findUnique({ where: { name: typeName } });
    if (!postType) {
      postType = await prisma.postType.create({ data: { name: typeName } });
    }

    const post = await prisma.post.create({
      data: {
        id_event: eventId,
        id_user: userId,
        content,
        id_post_type: postType.id_post_type,
      },
      include: { postType: true },
    });

    return {
      ...post,
      type: post.postType?.name || null,
    };
  }

  static async deletePost(postId, userId) {
    const post = await prisma.post.findUnique({
      where: { id_post: postId },
      include: { event: true },
    });

    if (!post) return false;

    const isMod = await isEventModerator(userId, post.id_event);
    if (post.id_user !== userId && !isMod) {
      throw { statusCode: 403, message: 'Not authorized to delete this post' };
    }

    await prisma.post.delete({ where: { id_post: postId } });
    return true;
  }

  static async createComment(postId, userId, content) {
    return await prisma.comment.create({
      data: {
        id_post: postId,
        id_user: userId,
        content,
      },
    });
  }

  static async deleteComment(commentId, userId) {
    const comment = await prisma.comment.findUnique({
      where: { id_comment: commentId },
      include: { post: { include: { event: true } } },
    });

    if (!comment) return false;

    const isMod = await isEventModerator(userId, comment.post.event.id_event);
    if (comment.id_user !== userId && !isMod) {
      throw { statusCode: 403, message: 'Not authorized to delete this comment' };
    }

    await prisma.comment.delete({ where: { id_comment: commentId } });
    return true;
  }

  static async togglePostLike(postId, userId) {
    const existing = await prisma.postLike.findUnique({
      where: { id_post_id_user: { id_post: postId, id_user: userId } },
    });

    return await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.postLike.delete({
          where: { id_post_id_user: { id_post: postId, id_user: userId } },
        });
        return await tx.post.update({
          where: { id_post: postId },
          data: { likes_count: { decrement: 1 } },
        });
      } else {
        await tx.postLike.create({
          data: { id_post: postId, id_user: userId },
        });
        return await tx.post.update({
          where: { id_post: postId },
          data: { likes_count: { increment: 1 } },
        });
      }
    });
  }

  static async toggleCommentLike(commentId, userId) {
    const existing = await prisma.commentLike.findUnique({
      where: { id_comment_id_user: { id_comment: commentId, id_user: userId } },
    });

    return await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.commentLike.delete({
          where: { id_comment_id_user: { id_comment: commentId, id_user: userId } },
        });
        return await tx.comment.update({
          where: { id_comment: commentId },
          data: { likes_count: { decrement: 1 } },
        });
      } else {
        await tx.commentLike.create({
          data: { id_comment: commentId, id_user: userId },
        });
        return await tx.comment.update({
          where: { id_comment: commentId },
          data: { likes_count: { increment: 1 } },
        });
      }
    });
  }
}

export default EventPostService;
