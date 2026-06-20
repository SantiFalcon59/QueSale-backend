import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5082',

  // Database
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_secret_key',
    expiry: process.env.JWT_EXPIRY || '7d',
  },

  // CORS
  cors: {
    origin: [
      'http://localhost:5082',
      'https://quesale.splindux.com',
      'https://localhost',
      'http://localhost',
      'capacitor://localhost',
      ...(process.env.CORS_ORIGIN?.split(',') || []),
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  // Storage
  storage: {
    path: process.env.STORAGE_PATH || './public/uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },

  // Pagination
  pagination: {
    itemsPerPage: parseInt(process.env.ITEMS_PER_PAGE || '20'),
  },

  // Firebase
  firebase: {
    enabled: !!process.env.FIREBASE_PROJECT_ID,
  },

  // Mercado Pago
  mercadopago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
    clientId: process.env.MERCADOPAGO_CLIENT_ID,
    clientSecret: process.env.MERCADOPAGO_CLIENT_SECRET,
    redirectUri: process.env.MERCADOPAGO_REDIRECT_URI,
    webhookUrl: process.env.WEBHOOK_URL || 'http://localhost:3000/api/featured/webhook/payment',
    notificationUrl: process.env.NOTIFICATION_URL || 'http://localhost:3000/api/featured/webhook/payment',
  },
};

export default config;
