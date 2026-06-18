import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import UserModel from '../models/User.js';
import OrganizerModel from '../models/Organizer.js';
import EventModel from '../models/Event.js';

const router = express.Router();

const profileDir = path.join(process.cwd(), 'uploads', 'profile-photos');
const organizerDir = path.join(process.cwd(), 'uploads', 'organizer-logos');
const eventDir = path.join(process.cwd(), 'uploads', 'event-media');
const postMediaDir = path.join(process.cwd(), 'uploads', 'post-media');
[profileDir, organizerDir, eventDir, postMediaDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const createStorage = (dir) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    if (file.mimetype === 'image/gif' && (!req.user?.is_premium && req.user?.global_role !== 'admin')) {
      return cb(new Error('GIFs are only allowed for Premium users'));
    }
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const organizerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    if (file.mimetype === 'image/gif') {
      return cb(new Error('No se permiten GIFs para el logo de la organización'));
    }
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'));
  }
};

const profileUpload = multer({ storage: createStorage(profileDir), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });
const organizerUpload = multer({ storage: createStorage(organizerDir), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: organizerFileFilter });
const eventUpload = multer({ storage: createStorage(eventDir), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });
const postMediaUpload = multer({ storage: createStorage(postMediaDir), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });

router.post('/', authenticateToken, profileUpload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);
    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    await UserModel.upsertProfile(req.user.id, { photo_url: photoUrl });
    sendSuccess(res, { photo_url: photoUrl }, 'Photo uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.post('/organizer-logo', authenticateToken, organizerUpload.single('logo'), async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);
    const { organizerId } = req.body;
    if (!organizerId) return sendError(res, 'organizerId is required', 400);

    const logoUrl = `/uploads/organizer-logos/${req.file.filename}`;
    await OrganizerModel.update(organizerId, { logo_url: logoUrl });
    sendSuccess(res, { logo_url: logoUrl }, 'Logo uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.post('/event-media', authenticateToken, eventUpload.array('media', 10), async (req, res, next) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return sendError(res, 'No files uploaded', 400);
    const { eventId } = req.body;
    if (!eventId) return sendError(res, 'eventId is required', 400);

    const mediaUrls = files.map(f => `/uploads/event-media/${f.filename}`);
    await EventModel.update(eventId, {
      thumbnail_url: mediaUrls[0],
      images: mediaUrls,
    });
    sendSuccess(res, { media_urls: mediaUrls }, 'Event media uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.post('/post-media', authenticateToken, postMediaUpload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'No file uploaded', 400);
    const mediaUrl = `/uploads/post-media/${req.file.filename}`;
    sendSuccess(res, { media_url: mediaUrl }, 'Post media uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
});

export default router;
