import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Helper to build Database URL from individual components
 */
const buildDatabaseUrl = () => {
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;
  
  // If DATABASE_URL is already provided (e.g. in production), use it
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // Otherwise, construct it
  const password = DB_PASSWORD ? `:${DB_PASSWORD}` : '';
  return `mysql://${DB_USER}${password}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: buildDatabaseUrl(),
    },
  },
});

export default prisma;
