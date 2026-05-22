import EventService from '../services/EventService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';

/**
 * Event Controller
 */
export class EventController {
  /**
   * Create new event
   */
  static async createEvent(req, res, next) {
    try {
      const userId = req.user.id;
      const { title, description, date, location, interestIds, organizerId } = req.body;
      
      const event = await EventService.createEvent(
        { title, description, date, location, interestIds },
        organizerId,
        userId
      );
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
      };
      const result = await EventService.getEvents(req.pagination, filters);
      sendPaginated(res, result.events, req.pagination, 'Events retrieved');
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
      const userId = req.user?.id;
      const event = await EventService.getEventDetails(eventId, userId);
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
      const events = await EventService.getNearbyEvents(location, req.pagination);
      sendPaginated(res, events, req.pagination, 'Nearby events retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update event
   */
  static async updateEvent(req, res, next) {
    try {
      const userId = req.user.id;
      const { eventId } = req.params;
      const updateData = req.body;
      const event = await EventService.updateEvent(eventId, updateData, userId);
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
      const userId = req.user.id;
      const { eventId } = req.params;
      const result = await EventService.deleteEvent(eventId, userId);
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
      };
      const result = await EventService.searchEvents(query, req.pagination);
      sendPaginated(res, result.events, req.pagination, 'Search results');
    } catch (error) {
      next(error);
    }
  }
}

export default EventController;
