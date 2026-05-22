import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Generate JWT token
 */
export const generateToken = (payload, expiresIn = config.jwt.expiry) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

/**
 * Decode JWT token without verification
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
