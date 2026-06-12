import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import prisma from '../config/prisma.js';

const router = express.Router();

/**
 * @route   POST /api/subscriptions/premium
 * @desc    Create Mercado Pago preference for Premium Subscription
 * @access  Private
 */
router.post('/premium', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id_user || req.user.id;
    const user = await prisma.user.findUnique({ where: { id_user: userId } });

    if (!user) return sendError(res, 'Usuario no encontrado', 404);

    // Platform credentials (our account)
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });
    const preference = new Preference(client);

    const body = {
      items: [
        {
          id: 'premium_30_days',
          title: 'QueSale Premium (30 Días)',
          quantity: 1,
          unit_price: 4999,
          currency_id: 'ARS',
          description: 'Acceso sin publicidad, insignias doradas, fotos GIF y más.',
        }
      ],
      payer: {
        email: user.email,
      },
      external_reference: JSON.stringify({
        userId: user.id_user,
        type: 'premium_subscription'
      }),
      notification_url: `${process.env.API_URL}/api/subscriptions/webhook`,
      back_urls: {
        success: `${process.env.FRONTEND_URL || 'http://localhost:5082'}/profile?premium_success=true`,
        failure: `${process.env.FRONTEND_URL || 'http://localhost:5082'}/profile?premium_error=true`,
      },
      auto_return: 'approved',
    };

    const response = await preference.create({ body });
    
    res.json({ 
      success: true, 
      id: response.id, 
      init_point: response.init_point 
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/subscriptions/webhook
 * @desc    Webhook for Premium Subscription payment
 * @access  Public
 */
router.post('/webhook', async (req, res, next) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment' && data && data.id) {
       // In a real app, verify payment status with MP API
       // For this implementation, we'll assume the simple flow
       // and fetch the payment info to get the user ID
       
       const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
       const { Payment } = await import('mercadopago');
       const payment = new Payment(client);
       
       const paymentInfo = await payment.get({ id: data.id });
       
       if (paymentInfo.status === 'approved') {
         const externalRef = JSON.parse(paymentInfo.external_reference);
         
         if (externalRef.type === 'premium_subscription') {
           const { userId } = externalRef;
           
           const premiumUntil = new Date();
           premiumUntil.setDate(premiumUntil.getDate() + 30);
           
           await prisma.user.update({
             where: { id_user: userId },
             data: {
               is_premium: true,
               premium_until: premiumUntil
             }
           });
           
           console.log(`[SUBSCRIPTION] User ${userId} is now PREMIUM until ${premiumUntil}`);
         }
       }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('[SUBSCRIPTION WEBHOOK ERROR]', error);
    res.sendStatus(200); // Always 200 for webhooks to avoid retries
  }
});

export default router;
