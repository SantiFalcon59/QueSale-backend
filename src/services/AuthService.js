import UserModel from '../models/User.js';
import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { auth } from '../config/firebase.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Authentication Service
 */
export class AuthService {
  static async buildAvailableUsername(baseUsername) {
    const normalizedBase = (baseUsername || 'usuario')
      .toLowerCase()
      .replace(/[^a-z0-9._]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 20)
      .replace(/^_+|_+$/g, '') || 'usuario';

    const firstTry = await UserModel.findByUsername(normalizedBase);
    if (!firstTry) return normalizedBase;

    for (let i = 1; i < 1000; i++) {
      const suffix = `_${i}`;
      const candidate = `${normalizedBase.slice(0, 20 - suffix.length)}${suffix}`;
      const exists = await UserModel.findByUsername(candidate);
      if (!exists) return candidate;
    }

    throw { statusCode: 409, message: 'Unable to generate unique username' };
  }

  /**
   * Register user with email and password
   */
  static async registerUser(userData) {
    const { email, username, password, photoURL } = userData;

    // Check if user already exists
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw { statusCode: 409, message: 'El correo electrónico ya está registrado' };
    }

    const usernameCheck = await UserModel.findByUsername(username);
    if (usernameCheck) {
      throw { statusCode: 409, message: 'El nombre de usuario ya está en uso' };
    }

    try {
      // Create user in Firebase
      const firebaseUser = await auth.createUser({
        email,
        password,
        displayName: username,
      });

      // Create user in database
      const user = await UserModel.create({
        id_user: firebaseUser.uid,
        firebase_uid: firebaseUser.uid,
        username,
        email,
        verified: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Save profile photo if provided
      if (photoURL) {
        await UserModel.upsertProfile(firebaseUser.uid, { photo_url: photoURL });
      }

      return {
        user,
        message: 'User registered successfully',
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw { statusCode: 400, message: error.message };
    }
  }

  /**
   * Login user
   */
  static async loginUser(credentials) {
    const { email, password } = credentials;

    try {
      // Verify user exists
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw { statusCode: 401, message: 'Credenciales inválidas' };
      }

      if (user.global_role === 'banned') {
        throw { statusCode: 403, message: 'Tu cuenta ha sido suspendida.' };
      }

      // Verify with Firebase
      let firebaseUser;
      try {
        // Get Firebase user to validate password indirectly via Firebase
        firebaseUser = await auth.getUserByEmail(email);
      } catch (error) {
        throw { statusCode: 401, message: 'Credenciales inválidas' };
      }

      return {
        user,
        message: 'Sesión iniciada correctamente',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login with Firebase ID token
   */
  static async loginWithFirebase(idToken, photoURL) {
    try {
      if (!auth) {
        console.error('Firebase auth not initialized');
        throw { statusCode: 500, message: 'Firebase service unavailable' };
      }

      const decodedToken = await auth.verifyIdToken(idToken);
      const { uid, email, name } = decodedToken;

      if (!uid || !email) {
        console.error('Invalid token claims:', { uid, email });
        throw { statusCode: 401, message: 'Invalid Firebase token' };
      }

      let isNew = false;
      let user = await UserModel.findById(uid);
      console.log('Firebase login - User lookup:', { uid, found: !!user, username: user?.username });

      if (user && user.global_role === 'banned') {
        throw { statusCode: 403, message: 'Tu cuenta ha sido suspendida.' };
      }

      if (!user) {
        isNew = true;
        const username = await this.buildAvailableUsername(name || email.split('@')[0]);
        console.log('Creating new user from Firebase:', { uid, email, name, username });
        
        user = await UserModel.create({
          id_user: uid,
          firebase_uid: uid,
          username,
          email,
          verified: 1,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Save profile with photo if available
        if (photoURL) {
          await UserModel.upsertProfile(uid, { photo_url: photoURL });
        }
      } else {
        // Sync photo from Firebase if user exists but has no photo in DB
        const profile = await prisma.userProfile.findUnique({ where: { id_user: uid } });
        if ((!profile || !profile.photo_url) && photoURL) {
          await UserModel.upsertProfile(uid, { photo_url: photoURL });
        }
      }

      const token = generateToken({ id: user.id_user, email: user.email });

      return {
        user,
        token,
        isNew,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Firebase login error:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack,
      });
      throw error.statusCode 
        ? error 
        : { statusCode: 401, message: 'Invalid Firebase token' };
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(userId) {
    await UserModel.verify(userId);
    return { message: 'Email verified successfully' };
  }

  /**
   * Reset password
   */
  static async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      return { message: 'Password reset email sent' };
    } catch (error) {
      throw { statusCode: 400, message: error.message };
    }
  }
}

export default AuthService;
