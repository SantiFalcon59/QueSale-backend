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
            is_premium: true,
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
      },
      orderBy: { created_at: 'desc' },
      take: pagination?.limit,
      skip: pagination?.offset,
    });

    const pollPostIds = posts.filter(p => p.postType?.name === 'poll').map(p => p.id_post);
    let pollDataMap = {};
    if (pollPostIds.length > 0) {
      try {
        const pollOptions = await prisma.pollOption.findMany({
          where: { id_post: { in: pollPostIds } },
          include: {
            _count: { select: { votes: true } },
            votes: currentUserId ? { where: { id_user: currentUserId }, select: { id_user: true } } : false,
          },
        });
        for (const opt of pollOptions) {
          if (!pollDataMap[opt.id_post]) {
            pollDataMap[opt.id_post] = { options: [], totalVotes: 0, userVote: null };
          }
          pollDataMap[opt.id_post].options.push({
            id: opt.id_poll_option,
            text: opt.option_text,
            votes: opt._count.votes,
          });
          pollDataMap[opt.id_post].totalVotes += opt._count.votes;
          if (opt.votes?.length > 0) {
            pollDataMap[opt.id_post].userVote = opt.id_poll_option;
          }
        }
      } catch {
        pollDataMap = {};
      }
    }

    return posts.map(post => {
      const reactionCounts = {};
      let userReaction = null;
      for (const r of post.reactions) {
        reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1;
        if (currentUserId && r.id_user === currentUserId) userReaction = r.type;
      }

      const { reactions: _, ...postData } = post;
      const pollInfo = pollDataMap[post.id_post];

      return {
        ...postData,
        type: post.postType?.name || null,
        author: post.user?.username || 'Anónimo',
        author_photo_url: post.user?.profile?.photo_url || null,
        reactions: reactionCounts,
        user_reaction: userReaction,
        pollOptions: pollInfo?.options?.length > 0 ? pollInfo.options : undefined,
        totalPollVotes: pollInfo?.totalVotes || 0,
        userVote: pollInfo?.userVote || null,
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
            is_premium: true,
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

    const dbUser = await prisma.user.findUnique({ where: { id_user: userId }, select: { global_role: true } });
    const isGlobalMod = dbUser && ['admin', 'moderator'].includes(dbUser.global_role);

    if (post.id_user !== userId && !isGlobalMod) {
      // If it's an event post, check if user is event moderator
      if (post.wall_type === 'event' && post.wall_id) {
        const { isEventModerator } = await import('../utils/organizerCheck.js');
        const isMod = await isEventModerator(userId, post.wall_id);
        if (!isMod) {
          throw { statusCode: 403, message: 'Not authorized to delete this post' };
        }
      } else {
        throw { statusCode: 403, message: 'Not authorized to delete this post' };
      }
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
      include: { post: { select: { id_user: true, wall_type: true, wall_id: true } } },
    });

    if (!comment) return false;

    const dbUser = await prisma.user.findUnique({ where: { id_user: userId }, select: { global_role: true } });
    const isGlobalMod = dbUser && ['admin', 'moderator'].includes(dbUser.global_role);
    const isPostOwner = comment.post?.id_user === userId;

    if (comment.id_user !== userId && !isPostOwner && !isGlobalMod) {
      if (comment.post?.wall_type === 'event' && comment.post?.wall_id) {
        const { isEventModerator } = await import('../utils/organizerCheck.js');
        const isMod = await isEventModerator(userId, comment.post.wall_id);
        if (!isMod) {
          throw { statusCode: 403, message: 'Not authorized to delete this comment' };
        }
      } else {
        throw { statusCode: 403, message: 'Not authorized to delete this comment' };
      }
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
