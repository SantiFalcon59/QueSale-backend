import EventModel from '../models/Event.js';
import { generateId } from '../utils/generators.js';
import { NotificationService } from './NotificationService.js';
import { getOrganizerStaffMembers } from '../utils/organizerCheck.js';
import AllowedLocationService from './AllowedLocationService.js';

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
    const isAllowed = await AllowedLocationService.checkLocation({
      city: eventData.city,
      state: eventData.state,
      country: eventData.country
    });

    if (!isAllowed) {
      throw { statusCode: 400, message: 'La aplicación todavía no está disponible en esta ubicación.' };
    }

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
      is_external: eventData.is_external || false,
      external_organizer_name: eventData.external_organizer_name,
      external_organizer_url: eventData.external_organizer_url,
      external_instagram: eventData.external_instagram,
      external_tiktok: eventData.external_tiktok,
      external_twitter: eventData.external_twitter,
    });

    if (eventData.interestIds) {
      await EventModel.setInterests(eventId, eventData.interestIds);
    }

    const hashtags = (eventData.description || '').match(/#(\w+)/g)?.map(h => h.slice(1).toLowerCase()) || [];
    const allTags = [...new Set([...(eventData.tags || []), ...hashtags])];
    if (allTags.length > 0) {
      await EventModel.setTags(eventId, allTags);
    }

    // Notify organizer followers about the new event
    const { default: prisma } = await import('../config/prisma.js');
    const followers = await prisma.organizerFollower.findMany({
      where: { id_organizer: organizerId },
      select: { id_user: true },
    });
    if (followers.length > 0) {
      const organizerData = await prisma.organizer.findUnique({
        where: { id_organizer: organizerId },
        select: { name: true },
      });
      const organizerName = organizerData?.name || 'Una organización';
      await prisma.notification.createMany({
        data: followers.map(f => ({
          id_user: f.id_user,
          type: 'event_update',
          title: organizerName,
          message: `${organizerName} publicó un nuevo evento: "${eventData.title}"`,
          data: { targetId: eventId, targetType: 'event', targetLink: `/events/${eventId}` },
        })),
      });
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

  static async getEvents(pagination, filters = {}, userId = null) {
    const dbFilters = { ...filters };

    if (filters.quickDate) {
      const { dateFrom, dateTo } = getDateRange(filters.quickDate);
      dbFilters.dateFrom = dateFrom?.toISOString();
      dbFilters.dateTo = dateTo?.toISOString();
      delete dbFilters.quickDate;
    }

    const events = await EventModel.getAll(pagination.limit, pagination.offset, dbFilters);
    const total = await EventModel.count(dbFilters);
    
    const { default: prisma } = await import('../config/prisma.js');
    const totalActive = await prisma.event.count({ where: { status: 'active', date: { gte: new Date() } } });

    let enrichedEvents = await Promise.all(
      events.map(async (event) => ({
        ...event,
        attendeesCount: await EventModel.getAttendeesCount(event.id_event),
        interests: (await EventModel.getInterests(event.id_event)).map(i => ({ id: i.id_interest, name: i.name })),
        tags: await EventModel.getTags(event.id_event),
      }))
    );

    // AI recommendation sorting logic
    if (userId && enrichedEvents.length > 0) {
      try {
        const { default: RecommendationService } = await import('./RecommendationService.js');
        const user = await prisma.user.findUnique({
          where: { id_user: userId },
          select: { embedding: true }
        });

        if (user?.embedding && Array.isArray(user.embedding)) {
          const userVec = user.embedding;
          enrichedEvents = enrichedEvents.map(event => {
            let score = 0;
            if (event.embedding && Array.isArray(event.embedding)) {
              score = RecommendationService.cosineSimilarity(userVec, event.embedding) * 100;
            }
            if (event.featured_level > 0) score += (event.featured_level * 10);
            return { ...event, score };
          });

          // Re-sort by similarity score
          enrichedEvents.sort((a, b) => (b.score || 0) - (a.score || 0));
        }
      } catch (err) {
        console.error('AI Sorting Error:', err);
      }
    }

    return {
      events: enrichedEvents,
      total,
      totalActive,
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

    const { default: prisma } = await import('../config/prisma.js');
    const dbUser = await prisma.user.findUnique({ where: { id_user: userId }, select: { global_role: true } });
    const isGlobalAdminOrMod = dbUser && ['admin', 'moderator'].includes(dbUser.global_role);

    if (event.id_creator !== userId && !isGlobalAdminOrMod) {
      throw { statusCode: 403, message: 'Unauthorized to update this event' };
    }

    if (updateData.location !== undefined || updateData.latitude !== undefined) {
      const isAllowed = await AllowedLocationService.checkLocation({
        city: updateData.city,
        state: updateData.state,
        country: updateData.country
      });

      if (!isAllowed) {
        throw { statusCode: 400, message: 'La aplicación todavía no está disponible en esta ubicación.' };
      }
    }

    const updated = await EventModel.update(eventId, {
      title: updateData.title,
      description: updateData.description,
      date: updateData.date ? new Date(updateData.date) : undefined,
      ubication: updateData.location,
      latitude: updateData.latitude ? String(updateData.latitude) : undefined,
      longitude: updateData.longitude ? String(updateData.longitude) : undefined,
      price: updateData.price !== undefined ? String(updateData.price) : undefined,
      capacity: updateData.capacity,
      thumbnail_url: updateData.thumbnail_url,
      ticket_type: updateData.ticket_type,
      ticket_url: updateData.ticket_url,
      qr_enabled: updateData.qr_enabled,
      is_external: updateData.is_external,
      external_organizer_name: updateData.external_organizer_name,
      external_organizer_url: updateData.external_organizer_url,
      external_instagram: updateData.external_instagram,
      external_tiktok: updateData.external_tiktok,
      external_twitter: updateData.external_twitter,
    });

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

    // Notify organizer staff about event update
    if (event.id_organizer) {
      const staffIds = await getOrganizerStaffMembers(event.id_organizer);
      const updater = await prisma.user.findUnique({
        where: { id_user: userId },
        select: { username: true },
      });
      for (const sid of staffIds) {
        if (sid !== userId) {
          NotificationService.notify(sid, 'event_update', updater?.username || 'Alguien',
            `Se actualizó el evento "${updated.title || event.title}"`,
            { fromId: userId, targetId: eventId, targetType: 'event',
              targetLink: `/events/${eventId}` }
          );
        }
      }
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
