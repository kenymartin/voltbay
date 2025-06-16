import { PrismaClient } from '@prisma/client'
import stripe, { STRIPE_CONFIG, handleStripeError, calculatePlatformFee } from '../config/stripe'
// import Stripe from 'stripe'

const prisma = new PrismaClient()

export interface CreatePaymentIntentData {
  productId: string
  buyerId: string
  amount: number
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface PaymentIntentResult {
  paymentIntentId: string
  clientSecret: string
  orderId: string
}

export class PaymentService {
  // Create or get Stripe customer
  static async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    try {
      // Check if user already has a Stripe customer ID
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true, email: true, firstName: true, lastName: true }
      })

      if (user?.stripeCustomerId) {
        return user.stripeCustomerId
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : undefined,
        metadata: {
          userId: userId
        }
      })

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id }
      })

      return customer.id
    } catch (error) {
      console.error('Error creating Stripe customer:', error)
      throw new Error('Failed to create customer')
    }
  }

  // Create payment intent for direct purchase
  static async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntentResult> {
    try {
      // Get product and validate
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
        include: { owner: true }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      if (product.ownerId === data.buyerId) {
        throw new Error('Cannot purchase your own product')
      }

      if (product.status !== 'ACTIVE') {
        throw new Error('Product is not available for purchase')
      }

      // Calculate amounts
      const amountInCents = Math.round(data.amount * 100)
      const platformFee = calculatePlatformFee(amountInCents)

      // Get or create Stripe customer
      const buyerUser = await prisma.user.findUnique({
        where: { id: data.buyerId },
        select: { email: true }
      })

      if (!buyerUser) {
        throw new Error('Buyer not found')
      }

      const customerId = await this.getOrCreateCustomer(data.buyerId, buyerUser.email)

      // Create order record
      const order = await prisma.order.create({
        data: {
          buyerId: data.buyerId,
          sellerId: product.ownerId,
          productId: data.productId,
          totalAmount: data.amount,
          shippingStreet: data.shippingAddress.street,
          shippingCity: data.shippingAddress.city,
          shippingState: data.shippingAddress.state,
          shippingZipCode: data.shippingAddress.zipCode,
          shippingCountry: data.shippingAddress.country,
          platformFee: platformFee / 100,
          sellerAmount: (amountInCents - platformFee) / 100,
          status: 'PENDING'
        }
      })

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: STRIPE_CONFIG.DEFAULT_CURRENCY,
        customer: customerId,
        metadata: {
          orderId: order.id,
          productId: data.productId,
          sellerId: product.ownerId,
          buyerId: data.buyerId,
          platformFee: platformFee.toString()
        },
        description: `Purchase: ${product.title}`,
        // Note: application_fee_amount and transfer_data will be added when Stripe Connect is implemented
        // application_fee_amount: platformFee,
        // transfer_data: {
        //   destination: product.owner.stripeAccountId || '',
        // }
      })

      // Update order with payment intent ID
      await prisma.order.update({
        where: { id: order.id },
        data: { stripePaymentIntentId: paymentIntent.id }
      })

      // Create payment record
      await prisma.payment.create({
        data: {
          userId: data.buyerId,
          orderId: order.id,
          stripePaymentIntentId: paymentIntent.id,
          amount: data.amount,
          currency: STRIPE_CONFIG.DEFAULT_CURRENCY,
          status: 'PENDING',
          description: `Purchase: ${product.title}`,
          platformFee: platformFee / 100,
          netAmount: (amountInCents - platformFee) / 100,
          metadata: {
            productTitle: product.title,
            sellerEmail: product.owner.email
          }
        }
      })

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        orderId: order.id
      }

    } catch (error) {
      console.error('Error creating payment intent:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error(handleStripeError(error))
    }
  }

  // Confirm payment after successful charge
  static async confirmPayment(paymentIntentId: string): Promise<void> {
    try {
      // Get payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful')
      }

      // Update payment record
      await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntentId },
        data: {
          status: 'SUCCEEDED',
          paidAt: new Date(),
          stripeChargeId: paymentIntent.latest_charge as string
        }
      })

      // Update order status
      const order = await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { product: true, buyer: true, seller: true }
      })

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'CONFIRMED' }
        })

        // Mark product as sold
        await prisma.product.update({
          where: { id: order.productId },
          data: { status: 'SOLD' }
        })

        // Create notifications
        await Promise.all([
          prisma.notification.create({
            data: {
              userId: order.buyerId,
              type: 'ORDER_CONFIRMED',
              title: 'Order Confirmed',
              message: `Your order for "${order.product.title}" has been confirmed`,
              data: { orderId: order.id }
            }
          }),
          prisma.notification.create({
            data: {
              userId: order.sellerId,
              type: 'PAYMENT_RECEIVED',
              title: 'Payment Received',
              message: `You received a payment for "${order.product.title}"`,
              data: { orderId: order.id, amount: order.totalAmount.toString() }
            }
          })
        ])
      }

    } catch (error) {
      console.error('Error confirming payment:', error)
      throw new Error('Failed to confirm payment')
    }
  }

  // Handle failed payment
  static async handleFailedPayment(paymentIntentId: string): Promise<void> {
    try {
      // Update payment record
      await prisma.payment.update({
        where: { stripePaymentIntentId: paymentIntentId },
        data: { status: 'FAILED' }
      })

      // Update order status
      const order = await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { buyer: true }
      })

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'CANCELLED' }
        })

        // Create notification
        await prisma.notification.create({
          data: {
            userId: order.buyerId,
            type: 'PAYMENT_FAILED',
            title: 'Payment Failed',
            message: 'Your payment could not be processed. Please try again.',
            data: { orderId: order.id }
          }
        })
      }

    } catch (error) {
      console.error('Error handling failed payment:', error)
    }
  }

  // Get payment status
  static async getPaymentStatus(paymentIntentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
        include: {
          order: {
            include: {
              product: true,
              buyer: true,
              seller: true
            }
          }
        }
      })

      if (!payment) {
        throw new Error('Payment not found')
      }

      return {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        description: payment.description,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        order: payment.order
      }

    } catch (error) {
      console.error('Error getting payment status:', error)
      throw new Error('Failed to get payment status')
    }
  }

  // Get user payment history
  static async getUserPaymentHistory(userId: string) {
    try {
      const payments = await prisma.payment.findMany({
        where: { userId },
        include: {
          order: {
            include: {
              product: {
                select: { id: true, title: true, imageUrls: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        description: payment.description,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        product: payment.order?.product,
        orderId: payment.orderId
      }))

    } catch (error) {
      console.error('Error getting payment history:', error)
      throw new Error('Failed to get payment history')
    }
  }
}

export default PaymentService 