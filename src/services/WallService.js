import prisma from '../config/prisma.js';

export class WallService {
  static async getPosts(wallType, wallId, pagination, typeFilter, currentUserId = null) {
    const where = { wall_type: wallType, wall_id: wallId };

    if (typeFilter) {
      where.postType = { name: { in: typeFilter.split(',') } };
    }

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
        reactions: {
          select: { id_user: true, type: true },
        },
        comments: {
          include: { user: { select: { id_user: true, username: true } } },
          orderBy: { created_at: 'asc' },
        },
        pollOptions: {
          include: {
            _count: { select: { votes: true } },
            votes: currentUserId ? { where: { id_user: currentUserId } } : false,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: pagination?.limit,
      skip: pagination?.offset,
    });

    return posts.map(post => {
      const reactionCounts = {};
      let userReaction = null;
      for (const r of post.reactions) {
        reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
        if (currentUserId && r.id_user === currentUserId) userReaction = r.type;
      }

      const { reactions: _, pollOptions: rawOptions, ...postData } = post;
      let totalPollVotes = 0;
      let userVote = null;
      const pollOptions = rawOptions?.map(o => {
        totalPollVotes += o._count.votes;
        if (o.votes?.length > 0) userVote = o.id_poll_option;
        return {
          id: o.id_poll_option,
          text: o.option_text,
          votes: o._count.votes,
        };
      });

      return {
        ...postData,
        type: post.postType?.name || null,
        author: post.user?.username || 'Anónimo',
        author_photo_url: post.user?.profile?.photo_url || null,
        reactions: reactionCounts,
        user_reaction: userReaction,
        pollOptions: pollOptions?.length > 0 ? pollOptions : undefined,
        totalPollVotes,
        userVote,
        comments: post.comments.map(c => ({
          ...c,
          author: c.user?.username || 'Anónimo',
        })),
      };
    });
  }

  static async createPost(wallType, wallId, userId, content, type = 'comment', media = null, pollOptions = null) {
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

    if (typeName === 'poll' && pollOptions && pollOptions.length >= 2) {
      await prisma.pollOption.createMany({
        data: pollOptions.map((text) => ({
          id_post: post.id_post,
          option_text: text,
        })),
      });
    }

    const result = {
      ...post,
      type: post.postType?.name || null,
      author: post.user?.username || 'Anónimo',
      author_photo_url: post.user?.profile?.photo_url || null,
      reactions: {},
      user_reaction: null,
    };

    if (typeName === 'poll') {
      const options = await prisma.pollOption.findMany({
        where: { id_post: post.id_post },
        include: { _count: { select: { votes: true } } },
      });
      result.pollOptions = options.map(o => ({
        id: o.id_poll_option,
        text: o.option_text,
        votes: o._count.votes,
      }));
      result.totalPollVotes = 0;
      result.userVote = null;
    }

    return result;
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

  static async toggleReaction(postId, userId, type) {
    const existing = await prisma.postReaction.findUnique({
      where: { id_post_id_user: { id_post: postId, id_user: userId } },
    });

    return await prisma.$transaction(async (tx) => {
      if (existing) {
        if (existing.type === type) {
          await tx.postReaction.delete({
            where: { id_post_id_user: { id_post: postId, id_user: userId } },
          });
          return await tx.post.update({
            where: { id_post: postId },
            data: { likes_count: { decrement: 1 } },
          });
        } else {
          await tx.postReaction.update({
            where: { id_post_id_user: { id_post: postId, id_user: userId } },
            data: { type },
          });
          return await tx.post.findUnique({ where: { id_post: postId } });
        }
      } else {
        await tx.postReaction.create({
          data: { id_post: postId, id_user: userId, type },
        });
        return await tx.post.update({
          where: { id_post: postId },
          data: { likes_count: { increment: 1 } },
        });
      }
    });
  }

  static async votePoll(optionId, userId) {
    const option = await prisma.pollOption.findUnique({
      where: { id_poll_option: optionId },
      select: { id_post: true, id_poll_option: true },
    });
    if (!option) throw { statusCode: 404, message: 'Opción no encontrada' };

    const existingVotes = await prisma.pollVote.findMany({
      where: {
        poll_option: { id_post: option.id_post },
        id_user: userId,
      },
    });

    return await prisma.$transaction(async (tx) => {
      if (existingVotes.length > 0) {
        const sameVote = existingVotes.find(v => v.id_poll_option === optionId);
        if (sameVote) {
          await tx.pollVote.delete({ where: { id_poll_vote: sameVote.id_poll_vote } });
          return { action: 'removed', optionId };
        }
        await tx.pollVote.deleteMany({
          where: { id_poll_option: { in: existingVotes.map(v => v.id_poll_option) }, id_user: userId },
        });
      }
      await tx.pollVote.create({
        data: { id_poll_option: optionId, id_user: userId },
      });
      return { action: 'voted', optionId };
    });
  }

  static async getPostReactions(postId) {
    const reactions = await prisma.postReaction.findMany({
      where: { id_post: postId },
      select: { type: true },
    });
    const counts = {};
    reactions.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
    return counts;
  }
}

export default WallService;
