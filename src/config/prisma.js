import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

BigInt.prototype.toJSON = function() { return this.toString(); };

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    },
  },
  log: ['error'],
});

export default prisma;

export const toSafeJSON = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj?.toNumber === 'function') return obj.toNumber();
  if (Array.isArray(obj)) return obj.map(toSafeJSON);
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = toSafeJSON(value);
    }
    return result;
  }
  return obj;
};
