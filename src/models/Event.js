import prisma from '../config/prisma.js';

/**
 * Event Model
 */
export class EventModel {
  /**
   * Create new event
   */
  static async create(eventData) {
    const { 
      id_event, title, description, date, ubication, id_organizer, id_creator, 
      latitude, longitude, price, capacity, thumbnail_url, ticket_type, 
      ticket_url, qr_enabled, is_external, external_organizer_name, external_organizer_url,
      external_instagram, external_tiktok, external_twitter
    } = eventData;
    await prisma.event.create({
      data: {
        id_event,
        title,
        description,
        date: new Date(date),
        ubication,
        id_organizer,
        id_creator,
        latitude: latitude ? String(latitude) : null,
        longitude: longitude ? String(longitude) : null,
        price: price ? String(price) : null,
        capacity: capacity || null,
        thumbnail_url: thumbnail_url || null,
        ticket_type: ticket_type || 'free',
        ticket_url: ticket_url || null,
        qr_enabled: !!qr_enabled,
        is_external: !!is_external,
        external_organizer_name: external_organizer_name || null,
        external_organizer_url: external_organizer_url || null,
        external_instagram: external_instagram || null,
        external_tiktok: external_tiktok || null,
        external_twitter: external_twitter || null,
      },
    });
    return this.findById(id_event);
  }

  /**
   * Find event by ID
   */
  static async findById(id) {
    return await prisma.event.findUnique({
      where: { id_event: id },
    });
  }

  /**
   * Get all events with pagination
   */
  static async getAll(limit, offset, filters = {}) {
    const where = {};
    const andConditions = [];

    if (filters.category && filters.category !== 'ALL') {
      where.interests = {
        some: {
          interest: {
            name: { equals: filters.category },
          },
        },
      };
    }

    if (filters.search) {
      andConditions.push({
        OR: [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
          { ubication: { contains: filters.search } },
        ],
      });
    }

    if (filters.location) {
      where.ubication = { contains: filters.location };
    }

    if (filters.price === 'free') {
      andConditions.push({
        OR: [
          { price: null },
          { price: '0' },
        ],
      });
    } else if (filters.price === 'paid') {
      andConditions.push({
        price: { not: null },
        NOT: { price: '0' },
      });
    }

    if (filters.priceMin !== undefined) {
      andConditions.push({
        price: { gte: filters.priceMin },
      });
    }

    if (filters.priceMax !== undefined) {
      andConditions.push({
        price: { lte: filters.priceMax },
      });
    }

    if (filters.dateFrom || filters.dateTo) {
      const dateFilter = {};
      if (filters.dateFrom) dateFilter.gte = new Date(filters.dateFrom);
      if (filters.dateTo) dateFilter.lte = new Date(filters.dateTo);
      andConditions.push({ date: dateFilter });
    } else {
      // Default: only show future events
      andConditions.push({ date: { gte: new Date() } });
    }

    if (filters.tags && filters.tags.length > 0) {
      andConditions.push({
        tags: {
          some: {
            tag: { in: filters.tags },
          },
        },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return await prisma.event.findMany({
      where,
      orderBy: [
        { featured_level: 'desc' },
        { date: 'asc' }
      ],
      take: limit,
      skip: offset,
      include: {
        creator: {
          select: {
            username: true,
            is_premium: true,
            verified: true,
            profile: { select: { photo_url: true } }
          }
        },
        organizer: {
          select: {
            name: true,
            logo_url: true
          }
        }
      }
    });
  }

  /**
   * Count all events
   */
  static async count(filters = {}) {
    const where = {};
    const andConditions = [];

    if (filters.category && filters.category !== 'ALL') {
      where.interests = {
        some: {
          interest: {
            name: { equals: filters.category },
          },
        },
      };
    }

    if (filters.search) {
      andConditions.push({
        OR: [
          { title: { contains: filters.search } },
          { description: { contains: filters.search } },
        ],
      });
    }

    if (filters.location) {
      where.ubication = { contains: filters.location };
    }

    if (filters.price === 'free') {
      andConditions.push({
        OR: [{ price: null }, { price: '0' }],
      });
    } else if (filters.price === 'paid') {
      andConditions.push({
        price: { not: null },
        NOT: { price: '0' },
      });
    }

    if (filters.priceMin !== undefined) {
      andConditions.push({
        price: { gte: filters.priceMin, not: null },
      });
    }

    if (filters.priceMax !== undefined) {
      andConditions.push({
        price: { lte: filters.priceMax, not: null },
      });
    }

    if (filters.dateFrom || filters.dateTo) {
      const dateFilter = {};
      if (filters.dateFrom) dateFilter.gte = new Date(filters.dateFrom);
      if (filters.dateTo) dateFilter.lte = new Date(filters.dateTo);
      andConditions.push({ date: dateFilter });
    } else {
      // Default: only show future events
      andConditions.push({ date: { gte: new Date() } });
    }

    if (filters.tags && filters.tags.length > 0) {
      andConditions.push({
        tags: {
          some: {
            tag: { in: filters.tags },
          },
        },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return await prisma.event.count({ where });
  }

  /**
   * Update event
   */
  static async update(id, updateData) {
    const updated = await prisma.event.update({
      where: { id_event: id },
      data: updateData,
    });
    return updated;
  }

  /**
   * Get event interests
   */
  static async getInterests(eventId) {
    const result = await prisma.eventInterest.findMany({
      where: { id_event: eventId },
      include: { interest: true },
    });
    return result.map(item => item.interest);
  }

  /**
   * Set event interests
   */
  static async setInterests(eventId, interestIds) {
    await prisma.$transaction(async (tx) => {
      await tx.eventInterest.deleteMany({ where: { id_event: eventId } });

      if (interestIds && interestIds.length > 0) {
        await tx.eventInterest.createMany({
          data: interestIds.map(id => ({ id_event: eventId, id_interest: id })),
          skipDuplicates: true,
        });
      }
    });
  }

  static async getTags(eventId) {
    const result = await prisma.eventTag.findMany({
      where: { id_event: eventId },
      select: { tag: true },
    });
    return result.map(item => item.tag);
  }

  static async setTags(eventId, tags) {
    await prisma.$transaction(async (tx) => {
      await tx.eventTag.deleteMany({ where: { id_event: eventId } });

      if (tags && tags.length > 0) {
        await tx.eventTag.createMany({
          data: tags.map(tag => ({ id_event: eventId, tag })),
          skipDuplicates: true,
        });
      }
    });
  }

  /**
   * Get event attendees count
   */
  static async getAttendeesCount(eventId) {
    return await prisma.ticket.count({
      where: { id_event: eventId, state: 1 },
    });
  }

  /**
   * Check if event is favorited by user
   */
  static async isFavorited(eventId, userId) {
    if (!userId) return false;
    const result = await prisma.savedEvent.findUnique({
      where: {
        id_user_id_event: {
          id_user: userId,
          id_event: eventId,
        },
      },
    });
    return !!result;
  }

  /**
   * Get nearby events
   */
  static async getNearby(location, limit = 20, offset = 0) {
    return await prisma.event.findMany({
      where: {
        ubication: { contains: location },
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Delete event
   */
  static async delete(id) {
    await prisma.$transaction(async (tx) => {
      await tx.ticket.deleteMany({ where: { id_event: id } });
      await tx.savedEvent.deleteMany({ where: { id_event: id } });
      await tx.post.deleteMany({ where: { id_event: id } });
      await tx.eventInterest.deleteMany({ where: { id_event: id } });
      await tx.eventTag.deleteMany({ where: { id_event: id } });
      await tx.event.delete({ where: { id_event: id } });
    });
  }

  static async searchEvents(query, limit, offset) {
    return await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      take: limit,
      skip: offset,
    });
  }
}

export default EventModel;
