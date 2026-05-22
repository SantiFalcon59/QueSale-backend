import TicketModel from '../models/Ticket.js';
import EventModel from '../models/Event.js';
import { generateId, generateTicketCode, generateQRCode } from '../utils/generators.js';

/**
 * Ticket Service
 */
export class TicketService {
  /**
   * Purchase ticket
   */
  static async purchaseTicket(eventId, userId) {
    // Verify event exists
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw { statusCode: 404, message: 'Event not found' };
    }

    // Check if user already has ticket
    const hasTicket = await TicketModel.hasTicket(userId, eventId);
    if (hasTicket) {
      throw { statusCode: 409, message: 'User already has a ticket for this event' };
    }

    // Create ticket
    const ticketId = generateId();
    const uuid = generateTicketCode();

    const ticket = await TicketModel.create({
      id_ticket: ticketId,
      uuid,
      id_event: eventId,
      id_user: userId,
      state: 1, // Active
      buy_date: new Date(),
    });

    // Generate QR code
    const qrCode = await generateQRCode(uuid);

    return {
      ...ticket,
      qrCode,
      message: 'Ticket purchased successfully',
    };
  }

  /**
   * Get user tickets
   */
  static async getUserTickets(userId, pagination) {
    const tickets = await TicketModel.getUserTickets(userId, pagination.limit, pagination.offset);
    return {
      tickets,
      page: pagination.page,
      limit: pagination.limit,
      total: tickets.length,
    };
  }

  /**
   * Get event attendees
   */
  static async getEventAttendees(eventId, pagination) {
    const tickets = await TicketModel.getEventTickets(eventId, pagination.limit, pagination.offset);
    return {
      attendees: tickets,
      page: pagination.page,
      limit: pagination.limit,
      total: tickets.length,
    };
  }

  /**
   * Validate ticket at event entrance
   */
  static async validateTicket(uuid) {
    const ticket = await TicketModel.findByUuid(uuid);
    if (!ticket) {
      throw { statusCode: 404, message: 'Ticket not found' };
    }

    if (ticket.state === 2) {
      throw { statusCode: 409, message: 'Ticket already validated' };
    }

    const validated = await TicketModel.validate(uuid);
    return {
      ...validated,
      message: 'Ticket validated successfully',
    };
  }

  /**
   * Get ticket details
   */
  static async getTicketDetails(uuid) {
    const ticket = await TicketModel.findByUuid(uuid);
    if (!ticket) {
      throw { statusCode: 404, message: 'Ticket not found' };
    }

    const event = await EventModel.findById(ticket.id_event);
    return {
      ticket,
      event,
    };
  }

  /**
   * Cancel ticket
   */
  static async cancelTicket(ticketId, userId) {
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) {
      throw { statusCode: 404, message: 'Ticket not found' };
    }

    if (ticket.id_user !== userId) {
      throw { statusCode: 403, message: 'Unauthorized' };
    }

    // TODO: Implement refund logic
    // For now, just update state to cancelled (state = 3)
    const updated = await TicketModel.update(ticketId, { state: 3 });
    return {
      ...updated,
      message: 'Ticket cancelled successfully',
    };
  }
}

export default TicketService;
