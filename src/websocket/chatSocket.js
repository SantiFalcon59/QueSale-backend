import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/prisma.js';

const activeConnections = new Map(); // userId -> Set of socket ids
const eventRooms = new Map(); // eventId -> Set of user ids

const MESSAGES_PER_PAGE = 20;

function formatMessage(msg, currentUserId = null) {
  const formatted = {
    id: `db-${msg.id_event_chat_message}`,
    userId: msg.id_user,
    displayName: msg.user?.username || 'Usuario',
    photoURL: msg.user?.profile?.photo_url || null,
    message: msg.message,
    messageType: msg.message_type,
    timestamp: msg.created_at,
  };
  if (msg.replyToMessage) {
    formatted.replyTo = {
      id: `db-${msg.replyToMessage.id_event_chat_message}`,
      userId: msg.replyToMessage.id_user,
      displayName: msg.replyToMessage.user?.username || 'Usuario',
      message: msg.replyToMessage.message,
    };
  }
  if (msg.messageReactions) {
    const counts = {};
    for (const r of msg.messageReactions) {
      if (!counts[r.emoji]) counts[r.emoji] = { count: 0, reacted: false };
      counts[r.emoji].count++;
      if (currentUserId && r.id_user === currentUserId) counts[r.emoji].reacted = true;
    }
    formatted.reactions = counts;
  }
  return formatted;
}

/**
 * Initialize Socket.io
 */
export function initializeWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Invalid token'));
    }

    socket.userId = decoded.id;
    socket.email = decoded.email;
    next();
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected: ${socket.id}`);

    // Track active connections
    if (!activeConnections.has(socket.userId)) {
      activeConnections.set(socket.userId, new Set());
    }
    activeConnections.get(socket.userId).add(socket.id);

    /**
     * Join event chat room
     */
    socket.on('join-event', async (eventId) => {
      socket.join(`event-${eventId}`);

      if (!eventRooms.has(eventId)) {
        eventRooms.set(eventId, new Set());
      }
      eventRooms.get(eventId).add(socket.userId);

      // Notify others
      socket.to(`event-${eventId}`).emit('user-joined', {
        userId: socket.userId,
        totalUsers: eventRooms.get(eventId).size,
        timestamp: new Date(),
      });

      // Load recent messages from DB
      try {
        const messages = await prisma.eventChatMessage.findMany({
          where: { id_event: eventId },
          orderBy: { created_at: 'desc' },
          take: MESSAGES_PER_PAGE,
          include: {
            user: {
              select: {
                username: true,
                profile: { select: { photo_url: true } },
              },
            },
            replyToMessage: {
              select: {
                id_event_chat_message: true,
                message: true,
                id_user: true,
                user: { select: { username: true } },
              },
            },
            messageReactions: {
              select: { emoji: true, id_user: true },
            },
          },
        });

        const history = messages.reverse().map(msg => formatMessage(msg, socket.userId));

        socket.emit('chat-history', history);
      } catch (err) {
        console.error('Error loading chat history:', err);
        socket.emit('chat-history', []);
      }
    });

    /**
     * Load older messages (pagination)
     */
    socket.on('load-messages', async (data) => {
      const { eventId, before } = data;
      try {
        const messages = await prisma.eventChatMessage.findMany({
          where: {
            id_event: eventId,
            created_at: { lt: new Date(before) },
          },
          orderBy: { created_at: 'desc' },
          take: MESSAGES_PER_PAGE,
          include: {
            user: {
              select: {
                username: true,
                profile: { select: { photo_url: true } },
              },
            },
            replyToMessage: {
              select: {
                id_event_chat_message: true,
                message: true,
                id_user: true,
                user: { select: { username: true } },
              },
            },
            messageReactions: {
              select: { emoji: true, id_user: true },
            },
          },
        });

        const older = messages.reverse().map(msg => formatMessage(msg, socket.userId));

        socket.emit('older-messages', older);
      } catch (err) {
        console.error('Error loading older messages:', err);
      }
    });

    /**
     * Leave event chat room
     */
    socket.on('leave-event', (eventId) => {
      socket.leave(`event-${eventId}`);

      if (eventRooms.has(eventId)) {
        eventRooms.get(eventId).delete(socket.userId);
        const totalUsers = eventRooms.get(eventId).size;

        // Notify others
        io.to(`event-${eventId}`).emit('user-left', {
          userId: socket.userId,
          totalUsers,
          timestamp: new Date(),
        });

        // Clean up empty rooms
        if (totalUsers === 0) {
          eventRooms.delete(eventId);
        }
      }
    });

    /**
     * Send message to event room
     */
    socket.on('send-message', async (data) => {
      const { eventId, message, messageType = 'chat', replyTo } = data;

      if (!message || message.trim().length === 0) {
        return;
      }

      // Check if user is blocked from this event
      try {
        const blocked = await prisma.eventBlockedUser.findUnique({
          where: { id_event_id_user: { id_event: eventId, id_user: socket.userId } },
        });
        if (blocked) {
          socket.emit('blocked', { eventId, reason: blocked.reason || 'You are blocked from this event' });
          return;
        }
      } catch (err) {
        console.error('Error checking blocked user:', err);
      }

      // Fetch user display info
      let displayName = 'Usuario';
      let photoURL = null;
      try {
        const userData = await prisma.user.findUnique({
          where: { id_user: socket.userId },
          include: { profile: { select: { photo_url: true } } },
        });
        if (userData) {
          displayName = userData.username || displayName;
          photoURL = userData.profile?.photo_url || null;
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }

      // Save to DB
      let savedMessage = null;
      try {
        const createData = {
          id_event: eventId,
          id_user: socket.userId,
          message: message.trim(),
          message_type: messageType,
        };
        if (replyTo?.id) {
          const replyDbId = replyTo.id.replace('db-', '');
          createData.reply_to = BigInt(replyDbId);
        }
        savedMessage = await prisma.eventChatMessage.create({
          data: createData,
          include: {
            user: {
              select: {
                username: true,
                profile: { select: { photo_url: true } },
              },
            },
            replyToMessage: {
              select: {
                id_event_chat_message: true,
                message: true,
                id_user: true,
                user: { select: { username: true } },
              },
            },
            messageReactions: {
              select: { emoji: true, id_user: true },
            },
          },
        });
      } catch (err) {
        console.error('Error saving message to DB:', err);
      }

      const msgData = savedMessage ? formatMessage(savedMessage, socket.userId) : {
        id: `${socket.id}-${Date.now()}`,
        userId: socket.userId,
        displayName,
        photoURL,
        message: message.trim(),
        messageType,
        timestamp: new Date(),
        socketId: socket.id,
      };

      // Emit to room
      io.to(`event-${eventId}`).emit('new-message', msgData);

      console.log(`Message in event ${eventId} from ${socket.userId}:`, msgData);
    });

    /**
     * React to a message
     */
    socket.on('react-to-message', async (data) => {
      const { eventId, messageId, emoji } = data;
      if (!messageId || !emoji) return;

      const dbId = parseInt(messageId.replace('db-', ''));
      if (!dbId) return;

      try {
        const existing = await prisma.chatMessageReaction.findUnique({
          where: {
            id_message_id_user_emoji: {
              id_message: dbId,
              id_user: socket.userId,
              emoji,
            },
          },
        });

        if (existing) {
          await prisma.chatMessageReaction.delete({
            where: { id_chat_message_reaction: existing.id_chat_message_reaction },
          });
        } else {
          await prisma.chatMessageReaction.create({
            data: {
              id_message: dbId,
              id_user: socket.userId,
              emoji,
            },
          });
        }

        const msg = await prisma.eventChatMessage.findUnique({
          where: { id_event_chat_message: dbId },
          include: {
            user: { select: { username: true, profile: { select: { photo_url: true } } } },
            replyToMessage: {
              select: { id_event_chat_message: true, message: true, id_user: true, user: { select: { username: true } } },
            },
            messageReactions: { select: { emoji: true, id_user: true } },
          },
        });

        if (msg) {
          io.to(`event-${eventId}`).emit('message-reactions-updated', formatMessage(msg, socket.userId));
        }
      } catch (err) {
        console.error('Error toggling reaction:', err);
      }
    });

    /**
     * Typing indicator
     */
    socket.on('typing', (eventId) => {
      socket.to(`event-${eventId}`).emit('user-typing', {
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    /**
     * Stop typing indicator
     */
    socket.on('stop-typing', (eventId) => {
      socket.to(`event-${eventId}`).emit('user-stop-typing', {
        userId: socket.userId,
      });
    });

    /**
     * Get room info
     */
    socket.on('get-room-info', (eventId) => {
      const room = io.sockets.adapter.rooms.get(`event-${eventId}`);
      socket.emit('room-info', {
        eventId,
        userCount: room ? room.size : 0,
        users: Array.from(eventRooms.get(eventId) || new Set()),
      });
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected: ${socket.id}`);

      // Remove from active connections
      if (activeConnections.has(socket.userId)) {
        activeConnections.get(socket.userId).delete(socket.id);
        if (activeConnections.get(socket.userId).size === 0) {
          activeConnections.delete(socket.userId);
        }
      }

      // Remove from all event rooms
      for (const [eventId, users] of eventRooms) {
        users.delete(socket.userId);
        if (users.size === 0) {
          eventRooms.delete(eventId);
        } else {
          io.to(`event-${eventId}`).emit('user-left', {
            userId: socket.userId,
            totalUsers: users.size,
            timestamp: new Date(),
          });
        }
      }
    });

    /**
     * Error handler
     */
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  });

  return io;
}

/**
 * Get active users in event
 */
export function getEventActiveUsers(eventId) {
  return eventRooms.get(eventId) || new Set();
}

/**
 * Get user active connections
 */
export function getUserActiveConnections(userId) {
  return activeConnections.get(userId) || new Set();
}

/**
 * Send notification to specific user
 */
export function notifyUser(io, userId, eventName, data) {
  const userSockets = activeConnections.get(userId);
  if (userSockets) {
    userSockets.forEach(socketId => {
      io.to(socketId).emit(eventName, data);
    });
  }
}

/**
 * Broadcast to event room
 */
export function broadcastToEvent(io, eventId, eventName, data) {
  io.to(`event-${eventId}`).emit(eventName, data);
}

export default initializeWebSocket;
