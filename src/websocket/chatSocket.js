import { Server } from 'socket.io';
import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/prisma.js';

const activeConnections = new Map(); // userId -> Set of socket ids
const eventRooms = new Map(); // eventId -> Set of user ids

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
    socket.on('join-event', (eventId) => {
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
      const { eventId, message, messageType = 'chat' } = data;

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

      const msgData = {
        userId: socket.userId,
        message: message.trim(),
        messageType, // 'chat', 'announcement', 'question'
        timestamp: new Date(),
        socketId: socket.id,
      };

      // Emit to room
      io.to(`event-${eventId}`).emit('new-message', msgData);

      console.log(`Message in event ${eventId} from ${socket.userId}:`, msgData);
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
