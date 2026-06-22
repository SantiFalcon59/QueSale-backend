import { auth as firebaseAuth } from '../config/firebase.js';
import prisma from '../config/prisma.js';

/**
 * Verify JWT token from Authorization header
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Access token required' },
    });
  }

  if (!firebaseAuth) {
    return res.status(500).json({
      success: false,
      error: { message: 'Firebase auth not configured' },
    });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(token);
    req.user = {
      id: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email,
    };
    
    // Fetch DB user to get roles and id_user
    try {
      const dbUser = await prisma.user.findUnique({
        where: { firebase_uid: decoded.uid }
      });
      
      if (dbUser) {
        if (dbUser.global_role === 'banned') {
          return res.status(403).json({
            success: false,
            error: { message: 'Tu cuenta ha sido suspendida.' },
          });
        }
        req.user.id_user = dbUser.id_user;
        req.user.global_role = dbUser.global_role || 'user';
        req.user.is_premium = !!dbUser.is_premium;
      }
    } catch (dbError) {
      console.error('Error fetching user from DB in auth middleware:', dbError);
    }
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { message: 'Invalid or expired token' },
    });
  }
};

/**
 * Optional authentication - doesn't fail if token is missing
 */
export const optionalAuthenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    if (!firebaseAuth) {
      return next();
    }
    try {
      const decoded = await firebaseAuth.verifyIdToken(token);
      req.user = {
        id: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email,
      };
      
      const dbUser = await prisma.user.findUnique({
        where: { firebase_uid: decoded.uid }
      });
      
      if (dbUser) {
        if (dbUser.global_role === 'banned') {
          return next();
        }
        req.user.id_user = dbUser.id_user;
        req.user.global_role = dbUser.global_role || 'user';
        req.user.is_premium = !!dbUser.is_premium;
      }
    } catch (error) {
      return next();
    }
  }

  next();
};

/**
 * Verify user has specific role
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    if (!allowedRoles.includes(req.user.global_role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Insufficient permissions' },
      });
    }

    next();
  };
};

/**
 * Middleware shortcuts
 */
export const requireAdmin = authorizeRole('admin');
export const requireModerator = authorizeRole('admin', 'moderator');
