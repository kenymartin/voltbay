import express from 'express'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PaymentService } from '../services/paymentService'
import { AuctionPaymentService } from '../services/auctionPaymentService'
import { authenticateUser } from '../middleware/auth'
import stripe, { STRIPE_CONFIG } from '../config/stripe'

const router = express.Router()
const prisma = new PrismaClient()

// Validation schemas
const createPaymentIntentSchema = z.object({
  productId: z.string().cuid(),
  amount: z.number().positive(),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1)
  })
})

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string()
})

const auctionPaymentSchema = z.object({
  auctionId: z.string().cuid(),
  winnerId: z.string().cuid(),
  winningBid: z.number().positive(),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1)
  })
})

// Create payment intent for direct purchase
router.post('/create-payment-intent', authenticateUser, async (req, res) => {
  try {
    const validatedData = createPaymentIntentSchema.parse(req.body)
    const userId = req.user?.id!

    // Validate minimum amount
    const amountInCents = Math.round(validatedData.amount * 100)
    if (amountInCents < STRIPE_CONFIG.MINIMUM_CHARGE_AMOUNT) {
      return res.status(400).json({
        success: false,
        error: `Minimum charge amount is $${STRIPE_CONFIG.MINIMUM_CHARGE_AMOUNT / 100}`
      })
    }

    const result = await PaymentService.createPaymentIntent({
      ...validatedData,
      buyerId: userId
    })

    res.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      })
    }

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Process auction payment
router.post('/auction-payment', authenticateUser, async (req, res) => {
  try {
    const validatedData = auctionPaymentSchema.parse(req.body)
    const userId = req.user?.id!

    // Verify user is the auction winner
    if (validatedData.winnerId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to pay for this auction'
      })
    }

    const result = await AuctionPaymentService.processAuctionPayment(validatedData)

    res.json({
      success: true,
      data: result,
      message: 'Auction payment initiated successfully'
    })

  } catch (error) {
    console.error('Error processing auction payment:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      })
    }

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Get auction payment status
router.get('/auction/:auctionId/status', authenticateUser, async (req, res) => {
  try {
    const { auctionId } = req.params

    const status = await AuctionPaymentService.getAuctionPaymentStatus(auctionId)

    res.json({
      success: true,
      data: status
    })

  } catch (error) {
    console.error('Error getting auction payment status:', error)
    
    if (error instanceof Error) {
      return res.status(404).json({
        success: false,
        error: error.message
      })
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Handle expired auctions (admin only)
router.post('/auction/:auctionId/expire', authenticateUser, async (req, res) => {
  try {
    const { auctionId } = req.params
    const userId = req.user?.id!

    // Check if user is admin (you might want to add admin middleware)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      })
    }

    const result = await AuctionPaymentService.handleExpiredAuction(auctionId)

    res.json({
      success: true,
      data: result,
      message: 'Auction expiration handled successfully'
    })

  } catch (error) {
    console.error('Error handling expired auction:', error)
    
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Confirm payment after successful client-side processing
router.post('/confirm-payment', authenticateUser, async (req, res) => {
  try {
    const { paymentIntentId } = confirmPaymentSchema.parse(req.body)

    await PaymentService.confirmPayment(paymentIntentId)

    res.json({
      success: true,
      message: 'Payment confirmed successfully'
    })

  } catch (error) {
    console.error('Error confirming payment:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      })
    }

    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message
      })
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Get payment status
router.get('/status/:paymentIntentId', authenticateUser, async (req, res) => {
  try {
    const { paymentIntentId } = req.params

    const payment = await PaymentService.getPaymentStatus(paymentIntentId)

    res.json({
      success: true,
      data: payment
    })

  } catch (error) {
    console.error('Error getting payment status:', error)
    
    if (error instanceof Error) {
      return res.status(404).json({
        success: false,
        error: error.message
      })
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Get user's payment history
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const userId = req.user?.id!

    const payments = await PaymentService.getUserPaymentHistory(userId)

    res.json({
      success: true,
      data: payments
    })

  } catch (error) {
    console.error('Error getting payment history:', error)
    
    res.status(500).json({
      success: false,
      error: 'Failed to get payment history'
    })
  }
})

// Stripe webhook endpoint for handling payment events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']

  if (!sig || !STRIPE_CONFIG.WEBHOOK_SECRET) {
    return res.status(400).send('Missing signature or webhook secret')
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_CONFIG.WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return res.status(400).send('Webhook signature verification failed')
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as { id: string }
        await PaymentService.confirmPayment(paymentIntent.id)
        console.log('Payment succeeded:', paymentIntent.id)
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as { id: string }
        await PaymentService.handleFailedPayment(failedPayment.id)
        console.log('Payment failed:', failedPayment.id)
        break

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object as { id: string }
        await PaymentService.handleFailedPayment(canceledPayment.id)
        console.log('Payment canceled:', canceledPayment.id)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    res.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(400).send('Webhook processing failed')
  }
})

// Get Stripe public key for frontend
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      publicKey: STRIPE_CONFIG.PUBLISHABLE_KEY,
      minimumAmount: STRIPE_CONFIG.MINIMUM_CHARGE_AMOUNT / 100,
      currency: STRIPE_CONFIG.DEFAULT_CURRENCY,
      platformFeePercentage: STRIPE_CONFIG.PLATFORM_FEE_PERCENTAGE
    }
  })
})

export default router 