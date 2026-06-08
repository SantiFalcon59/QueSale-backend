import TicketModel from '../models/Ticket.js';
import EventModel from '../models/Event.js';
import OrganizerModel from '../models/Organizer.js';
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

    // Check if QR is enabled (only if we are using this system for QR)
    // The user said: "Un evento puede tomar la decision de tener entregas por QR"
    if (!event.qr_enabled) {
      // If QR is not enabled, maybe they use an external ticket_url
      if (event.ticket_url) {
        return { ticket_url: event.ticket_url, message: 'Please use external ticket URL' };
      }
      // If it's a free event without QR enabled, what happens? 
      // Let's assume for now that if they want a ticket in our system, they should have QR enabled
      // or we just allow it but it won't be "QR delivery".
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

    // Generate QR code data (just the UUID)
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
  static async validateTicket(uuid, validatorUserId) {
    const ticket = await TicketModel.findByUuid(uuid);
    if (!ticket) {
      throw { statusCode: 404, message: 'Ticket not found' };
    }

    const event = await EventModel.findById(ticket.id_event);
    if (!event) {
      throw { statusCode: 404, message: 'Event associated with ticket not found' };
    }

    // Check permissions: creator or organizer admin
    const isAdmin = await OrganizerModel.isAdmin(event.id_organizer, validatorUserId);
    const isCreator = event.id_creator === validatorUserId;

    if (!isAdmin && !isCreator) {
      throw { statusCode: 403, message: 'No tienes permiso para validar entradas de este evento' };
    }

    if (ticket.state === 2) {
      throw { statusCode: 409, message: 'Esta entrada ya ha sido utilizada' };
    }

    const validated = await TicketModel.validate(uuid);
    return {
      ...validated,
      event_title: event.title,
      user_id: ticket.id_user,
      message: 'Entrada validada correctamente',
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
