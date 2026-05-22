import prisma from '../config/prisma.js';

/**
 * Featured Event Model
 */
export class FeaturedEventModel {
  /**
   * Create featured event
   */
  static async create(featuredData) {
    const {
      id_featured_event,
      id_event,
      id_organizer,
      level,
      price,
      payment_id,
      start_date,
      end_date,
      status,
    } = featuredData;

    await prisma.featuredEvent.create({
      data: {
        id_featured_event,
        id_event,
        id_organizer,
        level,
        price,
        payment_id,
        start_date,
        end_date,
        status: status || 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return this.findById(id_featured_event);
  }

  /**
   * Find featured event by ID
   */
  static async findById(id) {
    const featured = await prisma.featuredEvent.findUnique({
      where: { id_featured_event: id },
      include: { event: { select: { title: true } } },
    });

    if (!featured) return null;

    return {
      ...featured,
      event_title: featured.event?.title || null,
    };
  }

  /**
   * Find active featured events
   */
  static async getActiveFeatured(level = null) {
    const where = {
      status: 'active',
      end_date: { gte: new Date() },
      start_date: { lte: new Date() },
    };

    if (level) {
      where.level = level;
    }

    const featured = await prisma.featuredEvent.findMany({
      where,
      include: {
        event: { select: { title: true, date: true, ubication: true } },
        organizer: { select: { name: true } },
      },
      orderBy: [{ level: 'desc' }, { created_at: 'desc' }],
    });

    return featured.map(item => ({
      ...item,
      event_title: item.event?.title || null,
      date: item.event?.date || null,
      ubication: item.event?.ubication || null,
      organizer_name: item.organizer?.name || null,
    }));
  }

  /**
   * Get featured events by organizer
   */
  static async getByOrganizer(organizerId, limit, offset) {
    const featured = await prisma.featuredEvent.findMany({
      where: { id_organizer: organizerId },
      include: { event: { select: { title: true } } },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return featured.map(item => ({
      ...item,
      event_title: item.event?.title || null,
    }));
  }

  /**
   * Get featured events by event
   */
  static async getByEvent(eventId) {
    return await prisma.featuredEvent.findMany({
      where: {
        id_event: eventId,
        status: 'active',
        end_date: { gte: new Date() },
      },
      orderBy: { level: 'desc' },
    });
  }

  /**
   * Update featured event
   */
  static async update(id, updateData) {
    await prisma.featuredEvent.update({
      where: { id_featured_event: id },
      data: { ...updateData, updated_at: new Date() },
    });
    return this.findById(id);
  }

  /**
   * Delete featured event
   */
  static async delete(id) {
    await prisma.featuredEvent.delete({ where: { id_featured_event: id } });
  }

  /**
   * Get featured events with pagination
   */
  static async getAll(limit, offset) {
    const featured = await prisma.featuredEvent.findMany({
      include: {
        event: { select: { title: true } },
        organizer: { select: { name: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return featured.map(item => ({
      ...item,
      event_title: item.event?.title || null,
      organizer_name: item.organizer?.name || null,
    }));
  }

  /**
   * Count featured events by organizer
   */
  static async countByOrganizer(organizerId) {
    return await prisma.featuredEvent.count({ where: { id_organizer: organizerId } });
  }

  /**
   * Get featured event pricing
   */
  static async getPricing() {
    return await prisma.$queryRaw`SELECT * FROM featured_pricing`;
  }

  /**
   * Get revenue analytics
   */
  static async getRevenueAnalytics(startDate = null, endDate = null) {
    let query = `
      SELECT 
        COUNT(*) as total_featured,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_featured,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_featured,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_featured,
        SUM(price) as total_revenue,
        ROUND(AVG(price), 2) as avg_price,
        COUNT(DISTINCT id_organizer) as unique_organizers
      FROM featured_events
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    const result = await prisma.$queryRawUnsafe(query, ...params);
    return result?.[0] || {
      total_featured: 0,
      active_featured: 0,
      pending_featured: 0,
      completed_featured: 0,
      total_revenue: 0,
      avg_price: 0,
      unique_organizers: 0,
    };
  }

  /**
   * Get featured events by level
   */
  static async getByLevel(level) {
    const featured = await prisma.featuredEvent.findMany({
      where: { level },
      include: { event: { select: { title: true } } },
      orderBy: { created_at: 'desc' },
    });

    return featured.map(item => ({
      ...item,
      event_title: item.event?.title || null,
    }));
  }

  /**
   * Update status (called by scheduler)
   */
  static async updateExpiredStatus() {
    return await prisma.featuredEvent.updateMany({
      where: { status: 'active', end_date: { lt: new Date() } },
      data: { status: 'completed' },
    });
  }
}

export default FeaturedEventModel;
