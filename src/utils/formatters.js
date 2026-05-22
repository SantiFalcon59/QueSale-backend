/**
 * Format date to ISO string
 */
export const formatDate = (date) => {
  return new Date(date).toISOString();
};

/**
 * Format event data for response
 */
export const formatEvent = (event) => {
  return {
    id: event.id_event,
    title: event.title,
    description: event.description,
    date: formatDate(event.date),
    location: event.ubication,
    organizerId: event.id_organizer,
    creatorId: event.id_creator,
    totalAttendees: event.total_attendees || 0,
    interests: event.interests || [],
    thumbnail: event.thumbnail || null,
    status: event.status || 'active',
  };
};

/**
 * Format user data for response
 */
export const formatUser = (user) => {
  return {
    id: user.id_user,
    username: user.username,
    email: user.email,
    verified: !!user.verified,
    createdAt: formatDate(user.created_at),
    interests: user.interests || [],
  };
};

/**
 * Format organizer data for response
 */
export const formatOrganizer = (organizer) => {
  return {
    id: organizer.id_organizer,
    name: organizer.name,
    description: organizer.description,
    creatorId: organizer.id_creator,
    followers: organizer.followers || 0,
    events: organizer.events || 0,
  };
};

/**
 * Format ticket data for response
 */
export const formatTicket = (ticket) => {
  return {
    id: ticket.id_ticket,
    uuid: ticket.uuid,
    eventId: ticket.id_event,
    userId: ticket.id_user,
    status: ticket.state,
    purchaseDate: formatDate(ticket.buy_date),
    qrCode: ticket.qr_code || null,
  };
};
