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
      include: { user: { select: { username: true, email: true } } },
    });

    return admins.map(item => ({
      ...item,
      username: item.user?.username || null,
      email: item.user?.email || null,
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
      include: { user: true },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return followers.map(item => item.user);
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
   * Get dashboard analytics
   */
  static async getDashboardAnalytics(organizerId) {
    const result = await prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT e.id_event) as total_events,
        COUNT(DISTINCT t.id_ticket) as total_tickets,
        SUM(CASE WHEN t.state = 1 THEN 1 ELSE 0 END) as active_tickets,
        COUNT(DISTINCT of.id_user) as followers,
        COUNT(DISTINCT r.id_review) as reviews,
        ROUND(AVG(r.rating), 2) as avg_rating
      FROM organizer o
      LEFT JOIN events e ON o.id_organizer = e.id_organizer
      LEFT JOIN tickets t ON e.id_event = t.id_event
      LEFT JOIN organizer_followers of ON o.id_organizer = of.id_organizer
      LEFT JOIN reviews r ON e.id_event = r.id_event
      WHERE o.id_organizer = ${organizerId}
    `;

    const row = result?.[0];
    return row || {
      total_events: 0,
      total_tickets: 0,
      active_tickets: 0,
      followers: 0,
      reviews: 0,
      avg_rating: 0,
    };
  }
}

export default OrganizerModel;
