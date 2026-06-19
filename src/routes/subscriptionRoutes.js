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
          unit_price: 10,
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
      notification_url: `${process.env.FRONTEND_URL || process.env.API_URL}/api/subscriptions/webhook`,
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
    const type = req.body?.type || req.query?.topic;
    const paymentId = req.body?.data?.id || req.query?.id;

    if (type === 'payment' && paymentId) {
       const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
       const { Payment } = await import('mercadopago');
       const payment = new Payment(client);
       
       const paymentInfo = await payment.get({ id: paymentId });
       
       if (paymentInfo.status === 'approved') {
         const externalRef = JSON.parse(paymentInfo.external_reference);
         
         if (externalRef.type === 'premium_subscription') {
           const { userId } = externalRef;
           
            const premiumUntil = new Date();
            premiumUntil.setDate(premiumUntil.getDate() + 30);
            
            try {
              const user = await prisma.user.findUnique({
                where: { id_user: userId },
                select: { is_premium: true, premium_until: true }
              });

              if (user && user.is_premium && user.premium_until && user.premium_until > new Date()) {
                console.log(`[SUBSCRIPTION] User ${userId} is already premium until ${user.premium_until}. Skipping update.`);
              } else {
                await prisma.user.update({
                  where: { id_user: userId },
                  data: {
                    is_premium: true,
                    premium_until: premiumUntil
                  }
                });
                console.log(`[SUBSCRIPTION] User ${userId} is now PREMIUM until ${premiumUntil}`);
              }
            } catch (updateError) {
              const verifyUser = await prisma.user.findUnique({
                where: { id_user: userId },
                select: { is_premium: true }
              });
              if (verifyUser && verifyUser.is_premium) {
                console.log(`[SUBSCRIPTION] Update failed due to conflict but user ${userId} is premium. Ignoring error.`);
              } else {
                throw updateError;
              }
            }
         }
       }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('[SUBSCRIPTION WEBHOOK ERROR]', error);
    res.sendStatus(200); // Always 200 for webhooks to avoid retries
  }
});

/**
 * @route   GET /api/subscriptions/verify-payment
 * @desc    Verify a payment explicitly via query params (avoids body-parser null byte issues)
 * @access  Private
 */
router.get('/verify-payment', authenticateToken, async (req, res, next) => {
  try {
    const { payment_id } = req.query;
    if (!payment_id) return sendError(res, 'ID de pago requerido', 400);

    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
    const { Payment } = await import('mercadopago');
    const payment = new Payment(client);
    
    const paymentInfo = await payment.get({ id: payment_id });
    
    if (paymentInfo.status === 'approved') {
      let externalRef;
      try {
        externalRef = typeof paymentInfo.external_reference === 'string'
          ? JSON.parse(paymentInfo.external_reference)
          : paymentInfo.external_reference;
      } catch {
        return sendError(res, 'Error al procesar referencia externa', 400);
      }
      
      if (externalRef?.type === 'premium_subscription') {
        const { userId } = externalRef;
        
        const currentUserId = req.user.id_user || req.user.id;
        if (userId !== currentUserId) {
           return sendError(res, 'El pago no corresponde a este usuario', 403);
        }
        
        const premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + 30);
        
        await prisma.user.update({
          where: { id_user: userId },
          data: {
            is_premium: true,
            premium_until: premiumUntil
          }
        });
        
        console.log(`[SUBSCRIPTION] User ${userId} activated PREMIUM via verify-payment`);
        return sendSuccess(res, { is_premium: true, premium_until: premiumUntil }, 'Suscripción premium activada');
      }
    }
    
    return sendError(res, 'El pago aún no está aprobado o no es válido', 400);
  } catch (error) {
    next(error);
  }
});

export default router;
