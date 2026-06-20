import prisma from '../config/prisma.js';

/**
 * Ticket Model
 */
export class TicketModel {
  /**
   * Create new ticket
   */
  static async create(ticketData) {
    const { id_ticket, uuid, id_event, id_user, state, buy_date } = ticketData;
    await prisma.ticket.create({
      data: {
        id_ticket,
        uuid,
        id_event,
        id_user,
        state: state || 1,
        buy_date: buy_date || new Date(),
      },
    });
    return this.findById(id_ticket);
  }

  /**
   * Find ticket by ID
   */
  static async findById(id) {
    return await prisma.ticket.findUnique({ where: { id_ticket: id } });
  }

  /**
   * Find ticket by UUID
   */
  static async findByUuid(uuid) {
    return await prisma.ticket.findUnique({ where: { uuid } });
  }

  /**
   * Get user tickets
   */
  static async getUserTickets(userId, limit, offset) {
    const tickets = await prisma.ticket.findMany({
      where: { id_user: userId },
      include: { event: true },
      orderBy: [
        { state: 'asc' },
        { event: { date: 'asc' } }
      ],
      take: limit,
      skip: offset,
    });

    return tickets.map(ticket => ({
      ...ticket,
      title: ticket.event?.title,
      date: ticket.event?.date,
      ubication: ticket.event?.ubication,
      thumbnail_url: ticket.event?.thumbnail_url || null,
    }));
  }

  /**
   * Get event tickets
   */
  static async getEventTickets(eventId, limit, offset) {
    const tickets = await prisma.ticket.findMany({
      where: { id_event: eventId },
      include: { user: { select: { username: true, email: true } } },
      orderBy: { buy_date: 'desc' },
      take: limit,
      skip: offset,
    });

    return tickets.map(ticket => ({
      ...ticket,
      username: ticket.user?.username || null,
      email: ticket.user?.email || null,
    }));
  }

  /**
   * Validate ticket
   */
  static async validate(uuid) {
    await prisma.ticket.update({
      where: { uuid },
      data: { state: 2, validated_at: new Date() },
    });
    return this.findByUuid(uuid);
  }

  /**
   * Check if user has ticket for event
   */
  static async hasTicket(userId, eventId) {
    const result = await prisma.ticket.findFirst({
      where: { id_user: userId, id_event: eventId },
    });
    return !!result;
  }

  /**
   * Count event tickets
   */
  static async countEventTickets(eventId) {
    return await prisma.ticket.count({ where: { id_event: eventId } });
  }

  /**
   * Update ticket
   */
  static async update(id, updateData) {
    return await prisma.ticket.update({
      where: { id_ticket: id },
      data: updateData,
    });
  }
}

export default TicketModel;
