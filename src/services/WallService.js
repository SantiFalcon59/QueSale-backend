import prisma from '../config/prisma.js';

export class WallService {
  static async getPosts(wallType, wallId, pagination) {
    const where = { wall_type: wallType, wall_id: wallId };

    const posts = await prisma.post.findMany({
      where,
      include: {
        postType: true,
        user: {
          select: {
            id_user: true,
            username: true,
            profile: { select: { photo_url: true } },
          },
        },
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
      author_photo_url: post.user?.profile?.photo_url || null,
      comments: post.comments.map(c => ({
        ...c,
        author: c.user?.username || 'Anónimo',
      })),
    }));
  }

  static async createPost(wallType, wallId, userId, content, type = 'comment', media = null) {
    const typeName = (type || 'comment').toLowerCase();

    let postType = await prisma.postType.findUnique({ where: { name: typeName } });
    if (!postType) {
      postType = await prisma.postType.create({ data: { name: typeName } });
    }

    const data = {
      wall_type: wallType,
      wall_id: wallId,
      content,
      id_user: userId,
      id_post_type: postType.id_post_type,
    };

    if (media) {
      data.media = media;
    }

    if (wallType === 'event') {
      data.id_event = wallId;
    }

    const post = await prisma.post.create({
      data,
      include: {
        postType: true,
        user: {
          select: {
            id_user: true,
            username: true,
            profile: { select: { photo_url: true } },
          },
        },
      },
    });

    return {
      ...post,
      type: post.postType?.name || null,
      author: post.user?.username || 'Anónimo',
      author_photo_url: post.user?.profile?.photo_url || null,
    };
  }

  static async deletePost(postId, userId) {
    const post = await prisma.post.findUnique({
      where: { id_post: postId },
      include: { event: true },
    });

    if (!post) return false;

    if (post.id_user !== userId) {
      throw { statusCode: 403, message: 'Not authorized to delete this post' };
    }

    await prisma.post.delete({ where: { id_post: postId } });
    return true;
  }

  static async createComment(postId, userId, content) {
    return await prisma.comment.create({
      data: { id_post: postId, id_user: userId, content },
    });
  }

  static async deleteComment(commentId, userId) {
    const comment = await prisma.comment.findUnique({
      where: { id_comment: commentId },
      include: { post: { select: { id_user: true } } },
    });

    if (!comment) return false;

    const isPostOwner = comment.post?.id_user === userId;
    if (comment.id_user !== userId && !isPostOwner) {
      throw { statusCode: 403, message: 'Not authorized to delete this comment' };
    }

    await prisma.comment.delete({ where: { id_comment: commentId } });
    return true;
  }

  static async toggleLike(postId, userId) {
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
}

export default WallService;
