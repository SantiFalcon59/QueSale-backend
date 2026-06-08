import TicketService from '../services/TicketService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import prisma from '../config/prisma.js';

/**
 * Ticket Controller
 */
export class TicketController {
  /**
   * Purchase ticket
   */
  static async purchaseTicket(req, res, next) {
    try {
      const firebaseUid = req.user.id;
      const user = await prisma.user.findUnique({ where: { firebase_uid: firebaseUid } });
      if (!user) throw { statusCode: 404, message: 'User not found' };

      const { eventId } = req.body;
      const result = await TicketService.purchaseTicket(eventId, user.id_user);
      sendSuccess(res, result, result.message, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user tickets
   */
  static async getUserTickets(req, res, next) {
    try {
      const firebaseUid = req.user.id;
      const user = await prisma.user.findUnique({ where: { firebase_uid: firebaseUid } });
      if (!user) throw { statusCode: 404, message: 'User not found' };

      const result = await TicketService.getUserTickets(user.id_user, req.pagination);
      sendPaginated(res, result.tickets, req.pagination, 'User tickets retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get event attendees
   */
  static async getEventAttendees(req, res, next) {
    try {
      const { eventId } = req.params;
      const result = await TicketService.getEventAttendees(eventId, req.pagination);
      sendPaginated(res, result.attendees, req.pagination, 'Event attendees retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate ticket
   */
  static async validateTicket(req, res, next) {
    try {
      const { ticketUuid } = req.params;
      const firebaseUid = req.user.id;
      const user = await prisma.user.findUnique({ where: { firebase_uid: firebaseUid } });
      if (!user) throw { statusCode: 404, message: 'User not found' };

      const result = await TicketService.validateTicket(ticketUuid, user.id_user);
      sendSuccess(res, result, 'Ticket validated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get ticket details
   */
  static async getTicketDetails(req, res, next) {
    try {
      const { ticketUuid } = req.params;
      const result = await TicketService.getTicketDetails(ticketUuid);
      sendSuccess(res, result, 'Ticket details retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel ticket
   */
  static async cancelTicket(req, res, next) {
    try {
      const firebaseUid = req.user.id;
      const user = await prisma.user.findUnique({ where: { firebase_uid: firebaseUid } });
      if (!user) throw { statusCode: 404, message: 'User not found' };

      const { ticketId } = req.params;
      const result = await TicketService.cancelTicket(ticketId, user.id_user);
      sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export default TicketController;
