import EventModel from '../models/Event.js';
import { generateId } from '../utils/generators.js';

/**
 * Event Service
 */
export class EventService {
  /**
   * Create new event
   */
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
    });

    // Set interests if provided
    if (eventData.interestIds) {
      await EventModel.setInterests(eventId, eventData.interestIds);
    }

    return event;
  }

  /**
   * Get event details
   */
  static async getEventDetails(eventId, userId = null) {
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw { statusCode: 404, message: 'Event not found' };
    }

    const interests = await EventModel.getInterests(eventId);
    const attendeesCount = await EventModel.getAttendeesCount(eventId);
    const isFavorited = userId ? await EventModel.isFavorited(eventId, userId) : false;

    return {
      ...event,
      attendeesCount,
      isFavorited,
      interests: interests.map(i => ({ id: i.id_interest, name: i.name })),
    };
  }

  /**
   * Get all events with filters
   */
  static async getEvents(pagination, filters = {}) {
    const events = await EventModel.getAll(pagination.limit, pagination.offset, filters);
    const total = await EventModel.count(filters);

    const enrichedEvents = await Promise.all(
      events.map(async (event) => ({
        ...event,
        attendeesCount: await EventModel.getAttendeesCount(event.id_event),
        interests: (await EventModel.getInterests(event.id_event)).map(i => ({ id: i.id_interest, name: i.name })),
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

  /**
   * Get nearby events
   */
  static async getNearbyEvents(location, pagination) {
    const events = await EventModel.getNearby(location, pagination.limit, pagination.offset);

    const enrichedEvents = await Promise.all(
      events.map(async (event) => ({
        ...event,
        attendeesCount: await EventModel.getAttendeesCount(event.id_event),
        interests: (await EventModel.getInterests(event.id_event)).map(i => ({ id: i.id_interest, name: i.name })),
      }))
    );

    return enrichedEvents;
  }

  /**
   * Update event
   */
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

    return updated;
  }

  /**
   * Delete event
   */
  static async deleteEvent(eventId, userId) {
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw { statusCode: 404, message: 'Event not found' };
    }

    if (event.id_creator !== userId) {
      throw { statusCode: 403, message: 'Unauthorized to delete this event' };
    }

    await EventModel.delete(eventId);
    return { message: 'Event deleted successfully' };
  }

  /**
   * Search events
   */
  static async searchEvents(query, pagination) {
    // Simple search - can be enhanced with full-text search later
    const filters = {
      category: query.category,
      location: query.location,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    };
    return this.getEvents(pagination, filters);
  }
}

export default EventService;
