import prisma from '../config/prisma.js';

export async function isEventOrganizer(userId, eventId) {
  // Check if global admin or moderator first
  const dbUser = await prisma.user.findUnique({
    where: { id_user: userId },
    select: { global_role: true }
  });
  if (dbUser && ['admin', 'moderator'].includes(dbUser.global_role)) {
    return true;
  }

  const event = await prisma.event.findUnique({
    where: { id_event: eventId },
    select: { id_organizer: true, id_creator: true },
  });
  if (!event) return false;
  if (event.id_creator === userId) return true;
  
  if (!event.id_organizer) return false;

  const admin = await prisma.organizerAdmin.findUnique({
    where: { id_user_id_organizer: { id_user: userId, id_organizer: event.id_organizer } },
  });
  return !!admin;
}

export async function isEventModerator(userId, eventId) {
  // Check if global admin or moderator first
  const dbUser = await prisma.user.findUnique({
    where: { id_user: userId },
    select: { global_role: true }
  });
  if (dbUser && ['admin', 'moderator'].includes(dbUser.global_role)) {
    return true;
  }

  const event = await prisma.event.findUnique({
    where: { id_event: eventId },
    select: { id_organizer: true, id_creator: true },
  });
  if (!event) return false;
  if (event.id_creator === userId) return true;
  
  if (!event.id_organizer) return false;

  const admin = await prisma.organizerAdmin.findUnique({
    where: { id_user_id_organizer: { id_user: userId, id_organizer: event.id_organizer } },
  });
  if (!admin) return false;
  return ['admin', 'editor'].includes(admin.role);
}

export async function canCreateAnnouncement(userId, eventId) {
  return isEventOrganizer(userId, eventId);
}

export async function isUserBlockedFromEvent(userId, eventId) {
  const blocked = await prisma.eventBlockedUser.findUnique({
    where: { id_event_id_user: { id_event: eventId, id_user: userId } },
  });
  return !!blocked;
}
