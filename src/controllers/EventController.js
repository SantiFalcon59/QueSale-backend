import EventService from '../services/EventService.js';
import RecommendationService, { InteractionType } from '../services/RecommendationService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { isEventOrganizer, isEventModerator } from '../utils/organizerCheck.js';
import prisma from '../config/prisma.js';

/**
 * Event Controller
 */
export class EventController {
  /**
   * Create new event
   */
  static async createEvent(req, res, next) {
    try {
      const userId = req.user.id_user || req.user.id;
      const { 
        title, description, date, location, interestIds, organizerId, is_external, 
        external_organizer_name, external_organizer_url,
        external_instagram, external_tiktok, external_twitter,
        latitude, longitude, price, capacity, thumbnail_url, ticket_type, ticket_url, qr_enabled, tags,
        city, state, country
      } = req.body;
      
      const event = await EventService.createEvent(
        { 
          title, description, date, location, interestIds, is_external, 
          external_organizer_name, external_organizer_url,
          external_instagram, external_tiktok, external_twitter,
          latitude, longitude, price, capacity, thumbnail_url, ticket_type, ticket_url, qr_enabled, tags,
          city, state, country
        },
        organizerId,
        userId
      );

      // Trigger embedding generation for AI recommendations
      RecommendationService.updateEventEmbedding(event.id_event).catch(err => console.error('BG Event Embedding Error:', err));

      sendSuccess(res, event, 'Event created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all events
   */
  static async getEvents(req, res, next) {
    try {
      const filters = {
        category: req.query.category,
        location: req.query.location,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        quickDate: req.query.quickDate,
        price: req.query.price,
        priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
        priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
        search: req.query.search,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        latitude: req.query.latitude ? Number(req.query.latitude) : undefined,
        longitude: req.query.longitude ? Number(req.query.longitude) : undefined,
        radius: req.query.radius ? Number(req.query.radius) : undefined,
      };

      // Log behavior signals
      const userId = req.user?.id_user || req.user?.id;
      if (userId) {
        if (filters.category && filters.category !== 'ALL') {
          RecommendationService.logInteraction(userId, InteractionType.CLICK_CATEGORY, { category: filters.category });
        }
        if (filters.search) {
          RecommendationService.logInteraction(userId, InteractionType.SEARCH_QUERY, { metadata: { query: filters.search } });
        }
      }

      const result = await EventService.getEvents(req.pagination, filters, userId);
      const pagination = { ...req.pagination, total: result.total };
      sendPaginated(res, result.events, pagination, 'Events retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event details
   */
  static async getEventDetails(req, res, next) {
    try {
      const { eventId } = req.params;
      const userId = req.user?.id_user || req.user?.id;
      const event = await EventService.getEventDetails(eventId, userId);

      // Log event view signal
      if (userId && event) {
        RecommendationService.logInteraction(userId, InteractionType.VIEW_EVENT, {
          eventId,
          organizerId: event.id_organizer,
          category: event.interests?.[0]?.name
        });
      }

      sendSuccess(res, event, 'Event retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get nearby events
   */
  static async getNearbyEvents(req, res, next) {
    try {
      const { location } = req.query;
      if (!location) {
        return sendError(res, 'Location is required', 400);
      }
      const userId = req.user?.id_user || req.user?.id;
      
      // We use a larger limit for the map but cap it at 100 later if AI sorting is applied
      const result = await EventService.getEvents({ limit: 500, offset: 0 }, { location }, userId);
      
      // Limit to top 100 for the map to avoid cluttering
      const mapEvents = result.events.slice(0, 100);

      sendPaginated(res, mapEvents, { 
        page: 1, 
        limit: 100, 
        total: result.total,
        totalActive: result.totalActive 
      }, 'Nearby events retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update event
   */
  static async updateEvent(req, res, next) {
    try {
      const userId = req.user.id_user || req.user.id;
      const { eventId } = req.params;
      const updateData = req.body;
      const event = await EventService.updateEvent(eventId, updateData, userId);

      // Trigger embedding generation for AI recommendations
      RecommendationService.updateEventEmbedding(eventId).catch(err => console.error('BG Event Embedding Error:', err));

      sendSuccess(res, event, 'Event updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete event
   */
  static async deleteEvent(req, res, next) {
    try {
      const { eventId } = req.params;
      const result = await EventService.deleteEvent(eventId, req.user);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search events
   */
  static async searchEvents(req, res, next) {
    try {
      const query = {
        category: req.query.category,
        location: req.query.location,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        search: req.query.search || req.query.q,
      };
      const result = await EventService.searchEvents(query, req.pagination);
      sendPaginated(res, result.events, req.pagination, 'Search results');
    } catch (error) {
      next(error);
    }
  }

  static async searchTags(req, res, next) {
    try {
      const q = req.query.q || '';
      const tags = await EventService.searchTags(q);
      sendSuccess(res, tags, 'Tags retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getModeratorStatus(req, res, next) {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;
      const isOrg = await isEventOrganizer(userId, eventId);
      const isMod = await isEventModerator(userId, eventId);

      // Check if user is actually staff of the organization (without global roles check)
      const event = await prisma.event.findUnique({
        where: { id_event: eventId },
        select: { id_organizer: true, id_creator: true },
      });
      let isActualStaff = false;
      if (event) {
        if (event.id_creator === userId) {
          isActualStaff = true;
        } else if (event.id_organizer) {
          const admin = await prisma.organizerAdmin.findUnique({
            where: { id_user_id_organizer: { id_user: userId, id_organizer: event.id_organizer } },
          });
          if (admin && ['admin', 'moderator'].includes(admin.role)) {
            isActualStaff = true;
          }
        }
      }

      return sendSuccess(res, { 
        isOrganizer: isOrg, 
        isModerator: isMod,
        isActualStaff
      });
    } catch (error) {
      next(error);
    }
  }
}

export default EventController;
