import EventModel from '../models/Event.js';
import { generateId } from '../utils/generators.js';

const getDateRange = (quickDate) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let dateFrom, dateTo;

  switch (quickDate) {
    case 'today':
      dateFrom = start;
      dateTo = new Date(start.getTime() + 86400000);
      break;
    case 'tomorrow':
      dateFrom = new Date(start.getTime() + 86400000);
      dateTo = new Date(dateFrom.getTime() + 86400000);
      break;
    case 'weekend': {
      const dayOfWeek = start.getDay();
      const daysToSaturday = dayOfWeek <= 6 ? (6 - dayOfWeek) : 6;
      const saturday = new Date(start.getTime() + daysToSaturday * 86400000);
      dateFrom = saturday;
      dateTo = new Date(saturday.getTime() + 2 * 86400000);
      break;
    }
    case 'next-week':
      dateFrom = new Date(start.getTime() + 7 * 86400000);
      dateTo = new Date(dateFrom.getTime() + 7 * 86400000);
      break;
    case 'next-month':
      dateFrom = new Date(start.getTime() + 30 * 86400000);
      dateTo = new Date(dateFrom.getTime() + 30 * 86400000);
      break;
    default:
      break;
  }

  return { dateFrom, dateTo };
};

export class EventService {
  static async createEvent(eventData, organizerId, userId) {
    const eventId = generateId();
    const event = await EventModel.create({
      id_event: eventId,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      ubication: eventData.location,
      id_organizer: organizerId,
      id_creator: userId,
      latitude: eventData.latitude,
      longitude: eventData.longitude,
      price: eventData.price,
      capacity: eventData.capacity,
      thumbnail_url: eventData.thumbnail_url,
      ticket_type: eventData.ticket_type || 'free',
      ticket_url: eventData.ticket_url,
      qr_enabled: eventData.qr_enabled,
    });

    if (eventData.interestIds) {
      await EventModel.setInterests(eventId, eventData.interestIds);
    }

    const hashtags = (eventData.description || '').match(/#(\w+)/g)?.map(h => h.slice(1).toLowerCase()) || [];
    const allTags = [...new Set([...(eventData.tags || []), ...hashtags])];
    if (allTags.length > 0) {
      await EventModel.setTags(eventId, allTags);
    }

    return event;
  }

  static async getEventDetails(eventId, userId = null) {
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw { statusCode: 404, message: 'Event not found' };
    }

    const interests = await EventModel.getInterests(eventId);
    const tags = await EventModel.getTags(eventId);
    const attendeesCount = await EventModel.getAttendeesCount(eventId);
    const isFavorited = userId ? await EventModel.isFavorited(eventId, userId) : false;

    return {
      ...event,
      attendeesCount,
      isFavorited,
      interests: interests.map(i => ({ id: i.id_interest, name: i.name })),
      tags,
    };
  }

  static async getEvents(pagination, filters = {}) {
    const dbFilters = { ...filters };

    if (filters.quickDate) {
      const { dateFrom, dateTo } = getDateRange(filters.quickDate);
      dbFilters.dateFrom = dateFrom?.toISOString();
      dbFilters.dateTo = dateTo?.toISOString();
      delete dbFilters.quickDate;
    }

    const events = await EventModel.getAll(pagination.limit, pagination.offset, dbFilters);
    const total = await EventModel.count(dbFilters);

    const enrichedEvents = await Promise.all(
      events.map(async (event) => ({
        ...event,
        attendeesCount: await EventModel.getAttendeesCount(event.id_event),
        interests: (await EventModel.getInterests(event.id_event)).map(i => ({ id: i.id_interest, name: i.name })),
        tags: await EventModel.getTags(event.id_event),
      }))
    );

    return {
      events: enrichedEvents,
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasMore: events.length === pagination.limit,
    };
  }

  static async getNearbyEvents(location, pagination) {
    const events = await EventModel.getNearby(location, pagination.limit, pagination.offset);

    const enrichedEvents = await Promise.all(
      events.map(async (event) => ({
        ...event,
        attendeesCount: await EventModel.getAttendeesCount(event.id_event),
        interests: (await EventModel.getInterests(event.id_event)).map(i => ({ id: i.id_interest, name: i.name })),
        tags: await EventModel.getTags(event.id_event),
      }))
    );

    return enrichedEvents;
  }

  static async updateEvent(eventId, updateData, userId) {
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw { statusCode: 404, message: 'Event not found' };
    }

    if (event.id_creator !== userId) {
      throw { statusCode: 403, message: 'Unauthorized to update this event' };
    }

    const updated = await EventModel.update(eventId, updateData);

    if (updateData.interestIds) {
      await EventModel.setInterests(eventId, updateData.interestIds);
    }

    const hashtags = (updateData.description || '').match(/#(\w+)/g)?.map(h => h.slice(1).toLowerCase()) || [];
    const allTags = [...new Set([...(updateData.tags || []), ...hashtags])];
    if (allTags.length > 0) {
      await EventModel.setTags(eventId, allTags);
    } else if (updateData.tags) {
      await EventModel.setTags(eventId, []);
    }

    return updated;
  }

  static async deleteEvent(eventId, reqUser) {
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw { statusCode: 404, message: 'Event not found' };
    }

    const { default: prisma } = await import('../config/prisma.js');
    const dbUser = await prisma.user.findUnique({ where: { firebase_uid: reqUser.id } });
    const isGlobalAdminOrMod = ['admin', 'moderator'].includes(reqUser.global_role) || (dbUser && ['admin', 'moderator'].includes(dbUser.global_role));

    if (event.id_creator !== reqUser.id && event.id_creator !== dbUser?.id_user && !isGlobalAdminOrMod) {
      throw { statusCode: 403, message: 'Unauthorized to delete this event' };
    }

    await EventModel.delete(eventId);
    return { message: 'Event deleted successfully' };
  }

  static async searchTags(q) {
    const { default: prisma } = await import('../config/prisma.js');
    const tags = await prisma.eventTag.findMany({
      where: { tag: { contains: q.toLowerCase() } },
      select: { tag: true },
      distinct: ['tag'],
      take: 20,
    });
    return [...new Set(tags.map(t => t.tag))];
  }

  static async searchEvents(query, pagination) {
    const filters = {
      category: query.category,
      location: query.location,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      search: query.search,
      price: query.price,
    };
    return this.getEvents(pagination, filters);
  }
}

export default EventService;
