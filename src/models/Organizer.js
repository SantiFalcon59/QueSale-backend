import prisma from '../config/prisma.js';

/**
 * Organizer Model
 */
export class OrganizerModel {
  /**
   * Create new organizer
   */
  static async create(organizerData) {
    const { id_organizer, name, description, id_creator } = organizerData;
    await prisma.organizer.create({
      data: {
        id_organizer,
        name,
        description,
        id_creator,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
    return this.findById(id_organizer);
  }

  /**
   * Find organizer by ID
   */
  static async findById(id) {
    const organizer = await prisma.organizer.findUnique({
      where: { id_organizer: id },
      include: {
        _count: { select: { events: true, followers: true } },
      },
    });

    if (!organizer) return null;

    const { _count, ...rest } = organizer;
    return {
      ...rest,
      events_count: _count.events,
      followers_count: _count.followers,
    };
  }

  /**
   * Find organizer by name
   */
  static async findByName(name) {
    return await prisma.organizer.findUnique({ where: { name } });
  }

  /**
   * Get all organizers
   */
  static async getAll(limit, offset) {
    const organizers = await prisma.organizer.findMany({
      include: { _count: { select: { events: true, followers: true } } },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return organizers.map(item => {
      const { _count, ...rest } = item;
      return {
        ...rest,
        events_count: _count.events,
        followers_count: _count.followers,
      };
    });
  }

  /**
   * Search organizers by name
   */
  static async searchByName(query, limit = 20, offset = 0) {
    const organizers = await prisma.organizer.findMany({
      where: { name: { contains: query } },
      include: { _count: { select: { events: true, followers: true } } },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return organizers.map(item => {
      const { _count, ...rest } = item;
      return {
        ...rest,
        events_count: _count.events,
        followers_count: _count.followers,
      };
    });
  }

  /**
   * Count organizers matching search query
   */
  static async countSearchByName(query) {
    return await prisma.organizer.count({
      where: { name: { contains: query } },
    });
  }

  /**
   * Get organizers by creator
   */
  static async getByCreator(userId, limit, offset) {
    const organizers = await prisma.organizer.findMany({
      where: { id_creator: userId },
      include: { _count: { select: { events: true, followers: true } } },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return organizers.map(item => {
      const { _count, ...rest } = item;
      return {
        ...rest,
        events_count: _count.events,
        followers_count: _count.followers,
      };
    });
  }

  /**
   * Update organizer
   */
  static async update(id, updateData) {
    await prisma.organizer.update({
      where: { id_organizer: id },
      data: { ...updateData, updated_at: new Date() },
    });
    return this.findById(id);
  }

  /**
   * Delete organizer
   */
  static async delete(id) {
    await prisma.$transaction(async (tx) => {
      await tx.organizerAdmin.deleteMany({ where: { id_organizer: id } });
      await tx.organizerFollower.deleteMany({ where: { id_organizer: id } });
      await tx.organizer.delete({ where: { id_organizer: id } });
    });
  }

  /**
   * Add admin to organizer
   */
  static async addAdmin(organizerId, userId, role = 'admin') {
    await prisma.organizerAdmin.upsert({
      where: {
        id_user_id_organizer: { id_user: userId, id_organizer: organizerId },
      },
      update: { role },
      create: { id_user: userId, id_organizer: organizerId, role },
    });
  }

  /**
   * Remove admin from organizer
   */
  static async removeAdmin(organizerId, userId) {
    await prisma.organizerAdmin.deleteMany({
      where: { id_organizer: organizerId, id_user: userId },
    });
  }

  /**
   * Get organizer admins
   */
  static async getAdmins(organizerId) {
    const admins = await prisma.organizerAdmin.findMany({
      where: { id_organizer: organizerId },
      include: { user: { select: { username: true, email: true, profile: { select: { photo_url: true } } } } },
    });

    return admins.map(item => ({
      ...item,
      username: item.user?.username || null,
      email: item.user?.email || null,
      photo_url: item.user?.profile?.photo_url || null,
    }));
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(organizerId, userId) {
    const result = await prisma.organizerAdmin.findUnique({
      where: { id_user_id_organizer: { id_user: userId, id_organizer: organizerId } },
    });
    return !!result;
  }

  /**
   * Get user's admin organizers
   */
  static async getUserAdminOrganizers(userId) {
    return await prisma.organizer.findMany({
      where: { admins: { some: { id_user: userId } } },
    });
  }

  /**
   * Add follower
   */
  static async addFollower(organizerId, userId) {
    await prisma.organizerFollower.upsert({
      where: {
        id_user_id_organizer: { id_user: userId, id_organizer: organizerId },
      },
      update: {},
      create: { id_user: userId, id_organizer: organizerId },
    });
  }

  /**
   * Remove follower
   */
  static async removeFollower(organizerId, userId) {
    await prisma.organizerFollower.deleteMany({
      where: { id_organizer: organizerId, id_user: userId },
    });
  }

  /**
   * Get followers
   */
  static async getFollowers(organizerId, limit, offset) {
    const followers = await prisma.organizerFollower.findMany({
      where: { id_organizer: organizerId },
      include: {
        user: {
          include: { profile: { select: { photo_url: true } } },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return followers.map(item => ({
      id_user: item.user.id_user,
      username: item.user.username,
      photo_url: item.user.profile?.photo_url || null,
    }));
  }

  /**
   * Count followers
   */
  static async countFollowers(organizerId) {
    return await prisma.organizerFollower.count({
      where: { id_organizer: organizerId },
    });
  }

  /**
   * Is following
   */
  static async isFollowing(organizerId, userId) {
    const result = await prisma.organizerFollower.findUnique({
      where: { id_user_id_organizer: { id_user: userId, id_organizer: organizerId } },
    });
    return !!result;
  }

  /**
   * Get organizer events
   */
  static async getEvents(organizerId, limit, offset) {
    return await prisma.event.findMany({
      where: { id_organizer: organizerId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Count organizer events
   */
  static async countEvents(organizerId) {
    return await prisma.event.count({ where: { id_organizer: organizerId } });
  }

  /**
   * Get dashboard analytics — full metrics including views, revenue, engagement, per-event data
   */
  static async getDashboardAnalytics(organizerId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Check if any events exist
    const eventCount = await prisma.event.count({ where: { id_organizer: organizerId } });
    if (eventCount === 0) {
      return {
        total_events: 0, total_tickets: 0, active_tickets: 0,
        followers: 0, reviews: 0, avg_rating: 0, revenue: 0,
        total_event_views: 0, total_profile_views: 0, total_saves: 0,
        total_posts: 0, total_comments: 0, total_reactions: 0,
        total_chat_messages: 0, capacity_utilization: 0, validation_rate: 0,
        follower_growth_30d: 0, avg_rating_count: 0,
        rating_distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        per_event: [],
        trending: { top_by_views: null, top_by_tickets: null, top_by_engagement: null },
      };
    }

    // 1. Summary aggregate
    const summaryRaw = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT e.id_event) as total_events,
        COUNT(DISTINCT t.id_ticket) as total_tickets,
        SUM(CASE WHEN t.state = 1 THEN 1 ELSE 0 END) as active_tickets,
        COUNT(DISTINCT of.id_user) as followers,
        COUNT(DISTINCT r.id_review) as reviews,
        ROUND(AVG(r.rating), 2) as avg_rating,
        ROUND(SUM(CASE WHEN t.state IN (1,2) THEN COALESCE(e.price, 0) ELSE 0 END), 2) as revenue,
        COUNT(DISTINCT ui_ev.id_interaction) as total_event_views,
        COUNT(DISTINCT se.id_saved_event) as total_saves
      FROM organizer o
      LEFT JOIN events e ON o.id_organizer = e.id_organizer
      LEFT JOIN tickets t ON e.id_event = t.id_event
      LEFT JOIN organizer_followers of ON o.id_organizer = of.id_organizer
      LEFT JOIN reviews r ON e.id_event = r.id_event
      LEFT JOIN user_interactions ui_ev ON e.id_event = ui_ev.id_event AND ui_ev.type = 'VIEW_EVENT'
      LEFT JOIN saved_events se ON e.id_event = se.id_event
      WHERE o.id_organizer = ${organizerId}
    `;

    const s = summaryRaw?.[0] || {};

    // 2. Profile views
    const total_profile_views = await prisma.userInteraction.count({
      where: { type: 'VIEW_ORGANIZER_PROFILE', id_organizer: organizerId },
    });

    // 3. Follower growth
    const follower_growth_30d = await prisma.organizerFollower.count({
      where: { id_organizer: organizerId, created_at: { gte: thirtyDaysAgo } },
    });

    // 4. Per-event analytics
    const perEventRaw = await prisma.$queryRaw`
      SELECT 
        e.id_event,
        e.title,
        e.status,
        e.date,
        e.capacity,
        CAST(e.price AS CHAR) as price,
        COALESCE(ev_views.cnt, 0) as views,
        COALESCE(saves.cnt, 0) as saves,
        COALESCE(tickets.sold, 0) as tickets_sold,
        COALESCE(tickets.validated, 0) as tickets_validated,
        COALESCE(rv.avg_rating, 0) as avg_rating,
        COALESCE(rv.cnt, 0) as review_count,
        COALESCE(posts.cnt, 0) as post_count,
        COALESCE(cmts.cnt, 0) as comment_count,
        COALESCE(rxns.cnt, 0) as reaction_count,
        COALESCE(chat.cnt, 0) as chat_message_count
      FROM events e
      LEFT JOIN (SELECT id_event, COUNT(*) as cnt FROM user_interactions WHERE type = 'VIEW_EVENT' GROUP BY id_event) ev_views ON e.id_event = ev_views.id_event
      LEFT JOIN (SELECT id_event, COUNT(*) as cnt FROM saved_events GROUP BY id_event) saves ON e.id_event = saves.id_event
      LEFT JOIN (SELECT id_event, COUNT(*) as sold, SUM(CASE WHEN state = 2 THEN 1 ELSE 0 END) as validated FROM tickets WHERE state IN (1,2) GROUP BY id_event) tickets ON e.id_event = tickets.id_event
      LEFT JOIN (SELECT id_event, ROUND(AVG(rating), 2) as avg_rating, COUNT(*) as cnt FROM reviews GROUP BY id_event) rv ON e.id_event = rv.id_event
      LEFT JOIN (SELECT id_event, COUNT(*) as cnt FROM posts GROUP BY id_event) posts ON e.id_event = posts.id_event
      LEFT JOIN (SELECT p.id_event, COUNT(*) as cnt FROM comments c JOIN posts p ON c.id_post = p.id_post GROUP BY p.id_event) cmts ON e.id_event = cmts.id_event
      LEFT JOIN (SELECT p.id_event, COUNT(*) as cnt FROM post_reactions pr JOIN posts p ON pr.id_post = p.id_post GROUP BY p.id_event) rxns ON e.id_event = rxns.id_event
      LEFT JOIN (SELECT id_event, COUNT(*) as cnt FROM event_chat_messages GROUP BY id_event) chat ON e.id_event = chat.id_event
      WHERE e.id_organizer = ${organizerId}
      ORDER BY e.date DESC
    `;

    // 5. Rating distribution
    const ratingDistRaw = await prisma.$queryRaw`
      SELECT rating, COUNT(*) as cnt
      FROM reviews r
      JOIN events e ON r.id_event = e.id_event
      WHERE e.id_organizer = ${organizerId}
      GROUP BY rating
      ORDER BY rating
    `;

    const rating_distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    let avg_rating_count = 0;
    for (const row of ratingDistRaw) {
      rating_distribution[String(row.rating)] = Number(row.cnt);
      avg_rating_count += Number(row.cnt);
    }

    // 6. Engagement totals from per_event
    let total_posts = 0, total_comments = 0, total_reactions = 0, total_chat_messages = 0;
    let total_capacity = 0, total_tickets_sold = 0, total_validated = 0;

    const per_event = (perEventRaw || []).map((ev) => {
      total_posts += Number(ev.post_count);
      total_comments += Number(ev.comment_count);
      total_reactions += Number(ev.reaction_count);
      total_chat_messages += Number(ev.chat_message_count);
      const capacity = Number(ev.capacity) || 0;
      const sold = Number(ev.tickets_sold);
      total_capacity += capacity;
      total_tickets_sold += sold;
      total_validated += Number(ev.tickets_validated);
      return {
        id_event: ev.id_event,
        title: ev.title,
        status: ev.status,
        date: ev.date,
        views: Number(ev.views),
        saves: Number(ev.saves),
        tickets_sold: sold,
        tickets_validated: Number(ev.tickets_validated),
        capacity,
        fill_rate: capacity > 0 ? Math.round((sold / capacity) * 100) / 100 : 0,
        revenue: sold * Number(ev.price || 0),
        avg_rating: Number(ev.avg_rating),
        review_count: Number(ev.review_count),
        post_count: Number(ev.post_count),
        comment_count: Number(ev.comment_count),
        reaction_count: Number(ev.reaction_count),
        chat_message_count: Number(ev.chat_message_count),
      };
    });

    // 7. Trendings
    const sortedByViews = [...per_event].sort((a, b) => b.views - a.views);
    const sortedByTickets = [...per_event].sort((a, b) => b.tickets_sold - a.tickets_sold);
    const sortedByEngagement = [...per_event].sort(
      (a, b) => (b.post_count + b.comment_count + b.reaction_count) - (a.post_count + a.comment_count + a.reaction_count)
    );

    return {
      // Legacy fields
      total_events: Number(s.total_events) || 0,
      total_tickets: Number(s.total_tickets) || 0,
      active_tickets: Number(s.active_tickets) || 0,
      followers: Number(s.followers) || 0,
      reviews: Number(s.reviews) || 0,
      avg_rating: Number(s.avg_rating) || 0,

      // New summary
      revenue: Number(s.revenue) || 0,
      total_event_views: Number(s.total_event_views) || 0,
      total_profile_views,
      total_saves: Number(s.total_saves) || 0,
      total_posts,
      total_comments,
      total_reactions,
      total_chat_messages,
      capacity_utilization: total_capacity > 0 ? Math.round((total_tickets_sold / total_capacity) * 100) / 100 : 0,
      validation_rate: total_tickets_sold > 0 ? Math.round((total_validated / total_tickets_sold) * 100) / 100 : 0,
      follower_growth_30d,
      avg_rating_count,
      rating_distribution,

      // Per-event + trending
      per_event,
      trending: {
        top_by_views: sortedByViews[0]?.title || null,
        top_by_tickets: sortedByTickets[0]?.title || null,
        top_by_engagement: sortedByEngagement[0]?.title || null,
      },
    };
  }
}

export default OrganizerModel;
