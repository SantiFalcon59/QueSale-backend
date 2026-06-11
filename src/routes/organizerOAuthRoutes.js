import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import OrganizerModel from '../models/Organizer.js';
import { MercadoPagoConfig, OAuth } from 'mercadopago';
import config from '../config/index.js';

const router = express.Router();

/**
 * @route   GET /api/organizers/:organizerId/oauth/mercadopago
 * @desc    Get the URL to redirect the user for MP OAuth authorization
 * @access  Private (Organizer Admin only)
 */
router.get('/:organizerId/oauth/mercadopago', authenticateToken, async (req, res, next) => {
  try {
    const { organizerId } = req.params;
    const userId = req.user.id_user; // Assumes auth middleware populates this

    // Verify organizer exists and user is admin/creator
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ success: false, message: 'Organizer not found' });
    }

    const isAdmin = await OrganizerModel.isAdmin(organizerId, userId);
    const isCreator = organizer.id_creator === userId;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para configurar pagos en esta organización' });
    }

    const client = new MercadoPagoConfig({ accessToken: config.mercadopago.accessToken });
    const oauth = new OAuth(client);

    const authorizationUrl = oauth.getAuthorizationURL({
      client_id: config.mercadopago.clientId,
      redirect_uri: config.mercadopago.redirectUri,
      state: organizerId, // Pass organizer ID as state to link callback
    });

    res.json({ success: true, url: authorizationUrl });
  } catch (error) {
    console.error('Error generating MP OAuth URL:', error);
    next(error);
  }
});

/**
 * @route   GET /api/organizers/oauth/mercadopago/callback
 * @desc    Callback URL for MP OAuth to exchange code for token
 * @access  Public (Called by Mercado Pago)
 */
router.get('/oauth/mercadopago/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query; // state contains organizerId

    if (!code || !state) {
      return res.status(400).send('Missing code or state');
    }

    const organizerId = state;
    
    // Check if organizer exists before trying to fetch MP token
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      return res.status(404).send('Organizer not found');
    }

    const client = new MercadoPagoConfig({ accessToken: config.mercadopago.accessToken });
    const oauth = new OAuth(client);

    const response = await oauth.create({
      client_id: config.mercadopago.clientId,
      client_secret: config.mercadopago.clientSecret,
      code: code,
      redirect_uri: config.mercadopago.redirectUri,
    });

    // Save tokens securely
    const { access_token, refresh_token, public_key } = response;

    await OrganizerModel.update(organizerId, {
      mp_access_token: access_token,
      mp_refresh_token: refresh_token,
      mp_public_key: public_key,
    });

    // Redirect back to frontend dashboard with success flag
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5082'}/organizer?mp_connected=true`);
  } catch (error) {
    console.error('Error in MP OAuth Callback:', error);
    // Redirect with error
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5082'}/organizer?mp_error=true`);
  }
});

/**
 * @route   DELETE /api/organizers/:organizerId/oauth/mercadopago
 * @desc    Disconnect Mercado Pago
 * @access  Private
 */
router.delete('/:organizerId/oauth/mercadopago', authenticateToken, async (req, res, next) => {
  try {
    const { organizerId } = req.params;
    const userId = req.user.id_user; 

    // Verify organizer exists and user is admin/creator
    const organizer = await OrganizerModel.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ success: false, message: 'Organizer not found' });
    }

    const isAdmin = await OrganizerModel.isAdmin(organizerId, userId);
    const isCreator = organizer.id_creator === userId;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ success: false, message: 'No tienes permisos para desconectar pagos' });
    }

    await OrganizerModel.update(organizerId, {
      mp_access_token: null,
      mp_refresh_token: null,
      mp_public_key: null,
    });

    res.json({ success: true, message: 'Mercado Pago desconectado exitosamente' });
  } catch (error) {
    next(error);
  }
});

export default router;
