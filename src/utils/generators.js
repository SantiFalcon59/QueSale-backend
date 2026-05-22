import { v4 as uuidv4 } from 'uuid';
import qrcode from 'qrcode';

/**
 * Generate unique ID
 */
export const generateId = () => {
  return uuidv4();
};

/**
 * Generate short UUID
 */
export const generateShortId = () => {
  return uuidv4().split('-')[0];
};

/**
 * Generate QR Code as DataURL
 */
export const generateQRCode = async (text) => {
  try {
    return await qrcode.toDataURL(text);
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

/**
 * Generate QR Code as Buffer
 */
export const generateQRCodeBuffer = async (text) => {
  try {
    return await qrcode.toBuffer(text);
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

/**
 * Generate ticket code
 */
export const generateTicketCode = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `${timestamp}${random}`;
};
