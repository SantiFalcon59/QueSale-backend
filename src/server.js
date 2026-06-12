import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import config
import { config } from './config/index.js';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';
import { requestLogger, paginationMiddleware } from './middleware/validators.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import organizerRoutes from './routes/organizerRoutes.js';
import organizerOAuthRoutes from './routes/organizerOAuthRoutes.js';
import featuredRoutes from './routes/featuredRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import interestRoutes from './routes/interestRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import wallRoutes from './routes/wallRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

// Import WebSocket
import { initializeWebSocket } from './websocket/chatSocket.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket
const io = initializeWebSocket(server);


// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
})); // Security headers

console.log("CORS CONFIG:", config.cors);

app.use(cors(config.cors)); // CORS
app.use(
  express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
      req.rawBody = buf?.toString('utf8') || '';
    },
  })
); // JSON parser + raw body capture for webhook signature validation
app.use(
  express.urlencoded({
    limit: '50mb',
    extended: true,
    verify: (req, res, buf) => {
      req.rawBody = buf?.toString('utf8') || '';
    },
  })
); // URL encoded parser + raw body capture
app.use(express.static(path.join(__dirname, '../public'))); // Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'))); // Uploads
app.use(requestLogger); // Request logging
app.use(paginationMiddleware); // Pagination

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/featured', featuredRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/organizers', organizerOAuthRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', interestRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/wall', wallRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// API Documentation
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'QueSale API',
    version: '1.0.0',
    documentation: 'See README.md for API documentation',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      events: '/api/events',
      tickets: '/api/tickets',
      organizers: '/api/organizers',
      websocket: 'ws://localhost:3000/socket.io/',
    },
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 API URL: ${config.apiUrl}`);
  console.log('');
  console.log('📚 Available endpoints:');
  console.log(`  - GET  /health`);
  console.log(`  - GET  /api`);
  console.log(`  - POST /api/auth/register`);
  console.log(`  - POST /api/auth/login`);
  console.log(`  - POST /api/auth/login-firebase`);
  console.log(`  - GET  /api/users/profile`);
  console.log(`  - GET  /api/events`);
  console.log(`  - POST /api/events`);
  console.log(`  - GET  /api/tickets/my-tickets`);
  console.log(`  - POST /api/tickets/purchase`);
  console.log('');
  console.log('🔌 WebSocket connection available at:');
  console.log(`  - ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
