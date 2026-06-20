import TicketService from '../services/TicketService.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/response.js';
import { NotificationService } from '../services/NotificationService.js';
import { getOrganizerStaffMembers } from '../utils/organizerCheck.js';
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

      // Emit real-time notification to the ticket owner if socket.io is active
      if (req.io && result.user_id) {
        const { notifyUser } = await import('../websocket/chatSocket.js');
        notifyUser(req.io, result.user_id, 'ticket-validated', {
          ticketId: result.id_ticket,
          eventId: result.id_event,
          eventTitle: result.event_title,
          uuid: result.uuid,
        });
      }

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

  /**
   * Mercado Pago Webhook
   */
  static async mercadopagoWebhook(req, res, next) {
    try {
      const orgId = req.query.orgId;
      const type = req.body?.type || req.query?.topic;
      const paymentId = req.body?.data?.id || req.query?.id;

      if (type === 'payment' && paymentId && orgId) {
        console.log(`[WEBHOOK] Mercado Pago payment received: ${paymentId} for org: ${orgId}`);
        
        try {
          // Import required modules
          const OrganizerModel = (await import('../models/Organizer.js')).default;
          const TicketModel = (await import('../models/Ticket.js')).default;
          const MercadoPagoService = (await import('../services/MercadoPagoService.js')).default;
          const { generateId, generateTicketCode } = await import('../utils/generators.js');

          const organizer = await OrganizerModel.findById(orgId);
          if (organizer && organizer.mp_access_token) {
            const payment = await MercadoPagoService.verifyPayment(paymentId, organizer.mp_access_token);
            
            if (payment.status === 'approved') {
              const externalReference = JSON.parse(payment.external_reference);
              if (externalReference.type === 'ticket_purchase') {
                const { eventId, userId } = externalReference;
                
                // Check if ticket already exists
                const hasTicket = await TicketModel.hasTicket(userId, eventId);
                if (!hasTicket) {
                  const ticketId = generateId();
                  const uuid = generateTicketCode();

                  await TicketModel.create({
                    id_ticket: ticketId,
                    uuid,
                    id_event: eventId,
                    id_user: userId,
                    state: 1, // Active
                    buy_date: new Date(),
                  });

                  const buyer = await prisma.user.findUnique({
                    where: { id_user: userId },
                    select: { username: true, profile: { select: { photo_url: true } } },
                  });
                  const eventData = await prisma.event.findUnique({
                    where: { id_event: eventId },
                    select: { title: true, id_organizer: true },
                  });
                  if (buyer && eventData && eventData.id_organizer) {
                    const staffIds = await getOrganizerStaffMembers(eventData.id_organizer);
                    for (const sid of staffIds) {
                      if (sid !== userId) {
                        NotificationService.notify(sid, 'ticket_purchase', buyer.username,
                          `${buyer.username} compró una entrada para "${eventData.title}"`,
                          { fromId: userId, fromPhoto: buyer.profile?.photo_url,
                            targetId: eventId, targetType: 'event',
                            targetLink: `/events/${eventId}` }
                        );
                      }
                    }
                  }

                  console.log(`[WEBHOOK] Ticket created for user ${userId} in event ${eventId}`);
                }
              }
            }
          }
        } catch (innerError) {
          console.error('[WEBHOOK ERROR]', innerError);
        }
      }

      sendSuccess(res, null, 'Webhook received');
    } catch (error) {
      console.error('[WEBHOOK OUTER ERROR]', error);
      res.status(200).json({ success: false, error: error.message });
    }
  }
}

export default TicketController;
