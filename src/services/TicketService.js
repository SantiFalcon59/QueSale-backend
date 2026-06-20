import TicketModel from '../models/Ticket.js';
import EventModel from '../models/Event.js';
import OrganizerModel from '../models/Organizer.js';
import UserModel from '../models/User.js';
import MercadoPagoService from './MercadoPagoService.js';
import RecommendationService, { InteractionType } from './RecommendationService.js';
import { NotificationService } from './NotificationService.js';
import { getOrganizerStaffMembers } from '../utils/organizerCheck.js';
import prisma from '../config/prisma.js';
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
      throw { statusCode: 409, message: 'Ya tienes una entrada para este evento' };
    }

    // If it's a paid event using MercadoPago integration
    if (event.ticket_type === 'mercadopago' && event.price && Number(event.price) > 0) {
      // Get organizer to check for MP credentials
      const organizer = await OrganizerModel.findById(event.id_organizer);
      if (organizer?.mp_access_token) {
        const user = await UserModel.findById(userId);
        const preference = await MercadoPagoService.createTicketPreference(event, user, organizer);
        return {
          payment_required: true,
          preference_id: preference.id,
          init_point: preference.init_point,
          message: 'Pago requerido',
        };
      } else {
        throw { statusCode: 400, message: 'El organizador no tiene configurado Mercado Pago correctamente' };
      }
    }
    
    if (event.ticket_type === 'mercadopago') {
      throw { statusCode: 400, message: 'El precio del evento debe ser mayor a 0 para usar Mercado Pago' };
    }

    // Create ticket (for free events or paid events where organizer doesn't have MP set up yet)
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

    // Log behavior signal
    RecommendationService.logInteraction(userId, InteractionType.PURCHASE_TICKET, { eventId });

    // Generate QR code data (just the UUID)
    const qrCode = await generateQRCode(uuid);

    // Notify organizer staff about ticket purchase
    const buyer = await prisma.user.findUnique({
      where: { id_user: userId },
      select: { username: true, profile: { select: { photo_url: true } } },
    });
    if (buyer && event.id_organizer) {
      const staffIds = await getOrganizerStaffMembers(event.id_organizer);
      for (const sid of staffIds) {
        if (sid !== userId) {
          NotificationService.notify(sid, 'ticket_purchase', buyer.username,
            `${buyer.username} compró una entrada para "${event.title}"`,
            { fromId: userId, fromPhoto: buyer.profile?.photo_url,
              targetId: eventId, targetType: 'event',
              targetLink: `/events/${eventId}` }
          );
        }
      }
    }

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
    
    // Log behavior signal for attendance
    RecommendationService.logInteraction(ticket.id_user, 'ATTEND_EVENT', { eventId: ticket.id_event });

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
