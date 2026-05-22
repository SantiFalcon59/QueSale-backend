import prisma from '../config/prisma.js';

/**
 * Event Model
 */
export class EventModel {
  /**
   * Create new event
   */
  static async create(eventData) {
    const { id_event, title, description, date, ubication, id_organizer, id_creator } = eventData;
    await prisma.event.create({
      data: {
        id_event,
        title,
        description,
        date: new Date(date),
        ubication,
        id_organizer,
        id_creator,
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

    if (filters.category) {
      where.interests = {
        some: {
          interest: {
            name: filters.category,
          },
        },
      };
    }

    if (filters.location) {
      where.ubication = { contains: filters.location };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.date.lte = new Date(filters.dateTo);
      }
    }

    return await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Count all events
   */
  static async count(filters = {}) {
    const where = {};

    if (filters.category) {
      where.interests = {
        some: {
          interest: {
            name: filters.category,
          },
        },
      };
    }

    if (filters.location) {
      where.ubication = { contains: filters.location };
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
      await tx.event.delete({ where: { id_event: id } });
    });
  }
}

export default EventModel;
