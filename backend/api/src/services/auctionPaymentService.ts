import stripe, { STRIPE_CONFIG, handleStripeError, calculatePlatformFee } from '../config/stripe'
import { PrismaClient } from '@prisma/client'
import PaymentService from './paymentService'

const prisma = new PrismaClient()

export interface AuctionPaymentData {
  auctionId: string
  winnerId: string
  winningBid: number
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export class AuctionPaymentService {
  // Process payment for auction winner
  static async processAuctionPayment(data: AuctionPaymentData) {
    try {
      // Get auction product and validate
      const product = await prisma.product.findUnique({
        where: { id: data.auctionId },
        include: { 
          owner: true,
          bids: {
            where: { isWinning: true },
            include: { user: true }
          }
        }
      })

      if (!product) {
        throw new Error('Auction not found')
      }

      if (!product.isAuction) {
        throw new Error('Product is not an auction')
      }

      if (product.status !== 'ACTIVE') {
        throw new Error('Auction is not active')
      }

      // Verify auction has ended
      if (product.auctionEndDate && product.auctionEndDate > new Date()) {
        throw new Error('Auction has not ended yet')
      }

      // Verify winning bid
      const winningBid = product.bids.find(bid => bid.isWinning && bid.userId === data.winnerId)
      if (!winningBid) {
        throw new Error('No winning bid found for this user')
      }

      if (Number(winningBid.amount) !== data.winningBid) {
        throw new Error('Winning bid amount mismatch')
      }

      // Create payment intent for auction winner
      const paymentResult = await PaymentService.createPaymentIntent({
        productId: data.auctionId,
        buyerId: data.winnerId,
        amount: data.winningBid,
        shippingAddress: data.shippingAddress
      })

      // Update product status to indicate payment processing
      await prisma.product.update({
        where: { id: data.auctionId },
        data: { status: 'SOLD' }
      })

      // Create auction completion notification
      await prisma.notification.create({
        data: {
          userId: data.winnerId,
          type: 'AUCTION_WON',
          title: 'Auction Won!',
          message: `Congratulations! You won the auction for "${product.title}". Please complete your payment.`,
          data: { 
            productId: product.id,
            orderId: paymentResult.orderId,
            amount: data.winningBid
          }
        }
      })

      // Notify seller
      await prisma.notification.create({
        data: {
          userId: product.ownerId,
          type: 'AUCTION_ENDED',
          title: 'Auction Ended',
          message: `Your auction for "${product.title}" has ended. Payment processing initiated.`,
          data: { 
            productId: product.id,
            orderId: paymentResult.orderId,
            winnerEmail: winningBid.user.email
          }
        }
      })

      return paymentResult

    } catch (error) {
      console.error('Error processing auction payment:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to process auction payment')
    }
  }

  // Automatically charge auction winner (for future escrow implementation)
  static async autoChargeAuctionWinner(auctionId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            where: { isWinning: true },
            include: { user: true }
          },
          orders: {
            where: { status: 'PENDING' },
            include: { buyer: true }
          }
        }
      })

      if (!product || !product.isAuction) {
        throw new Error('Invalid auction')
      }

      const winningBid = product.bids.find(bid => bid.isWinning)
      const pendingOrder = product.orders[0]

      if (!winningBid || !pendingOrder) {
        throw new Error('No winning bid or pending order found')
      }

      // Get or create Stripe customer for winner
      const customerId = await PaymentService.getOrCreateCustomer(
        winningBid.userId, 
        winningBid.user.email
      )

      // Create payment intent with automatic confirmation
      const amountInCents = Math.round(Number(winningBid.amount) * 100)
      const platformFee = calculatePlatformFee(amountInCents)

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: STRIPE_CONFIG.DEFAULT_CURRENCY,
        customer: customerId,
        confirm: true,
        payment_method: 'pm_card_visa', // This would be the saved payment method
        metadata: {
          orderId: pendingOrder.id,
          productId: auctionId,
          auctionWinner: 'true'
        },
        description: `Auction payment: ${product.title}`,
        application_fee_amount: platformFee
      })

      if (paymentIntent.status === 'succeeded') {
        await PaymentService.confirmPayment(paymentIntent.id)
      }

      return paymentIntent

    } catch (error) {
      console.error('Error auto-charging auction winner:', error)
      throw new Error('Failed to auto-charge auction winner')
    }
  }

  // Handle auction expiration without winner
  static async handleExpiredAuction(auctionId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: auctionId },
        include: { 
          owner: true,
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
            include: { user: true }
          }
        }
      })

      if (!product) {
        throw new Error('Auction not found')
      }

      // Check if auction has ended
      if (product.auctionEndDate && product.auctionEndDate <= new Date()) {
        const highestBid = product.bids[0]

        if (highestBid && Number(highestBid.amount) >= Number(product.minimumBid || 0)) {
          // Mark highest bid as winning
          await prisma.bid.update({
            where: { id: highestBid.id },
            data: { isWinning: true }
          })

          // Update product current bid
          await prisma.product.update({
            where: { id: auctionId },
            data: { currentBid: highestBid.amount }
          })

          // Notify winner
          await prisma.notification.create({
            data: {
              userId: highestBid.userId,
              type: 'AUCTION_WON',
              title: 'Auction Won!',
              message: `You won the auction for "${product.title}" with a bid of $${highestBid.amount}`,
              data: { productId: product.id, amount: highestBid.amount.toString() }
            }
          })

          return { winner: highestBid.user, amount: highestBid.amount }
        } else {
          // No valid bids, mark as expired
          await prisma.product.update({
            where: { id: auctionId },
            data: { status: 'EXPIRED' }
          })

          // Notify seller
          await prisma.notification.create({
            data: {
              userId: product.ownerId,
              type: 'AUCTION_ENDED',
              title: 'Auction Expired',
              message: `Your auction for "${product.title}" has expired without meeting the minimum bid.`,
              data: { productId: product.id }
            }
          })

          return { winner: null, amount: 0 }
        }
      }

      throw new Error('Auction has not expired yet')

    } catch (error) {
      console.error('Error handling expired auction:', error)
      throw new Error('Failed to handle expired auction')
    }
  }

  // Get auction payment status
  static async getAuctionPaymentStatus(auctionId: string) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            where: { isWinning: true },
            include: { user: true }
          },
          orders: {
            include: {
              payments: true,
              buyer: true
            }
          }
        }
      })

      if (!product) {
        throw new Error('Auction not found')
      }

      const winningBid = product.bids.find(bid => bid.isWinning)
      const order = product.orders[0]
      const payment = order?.payments[0]

      return {
        auctionId: product.id,
        title: product.title,
        status: product.status,
        auctionEndDate: product.auctionEndDate,
        winningBid: winningBid ? {
          amount: winningBid.amount,
          winner: {
            id: winningBid.user.id,
            email: winningBid.user.email,
            name: `${winningBid.user.firstName} ${winningBid.user.lastName}`
          }
        } : null,
        order: order ? {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount
        } : null,
        payment: payment ? {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          paidAt: payment.paidAt
        } : null
      }

    } catch (error) {
      console.error('Error getting auction payment status:', error)
      throw new Error('Failed to get auction payment status')
    }
  }

  static async createAuctionPaymentIntent(auctionId: string, winnerId: string) {
    throw new Error('This method is deprecated - use processAuctionPayment instead')
  }

  static async confirmAuctionPayment(paymentIntentId: string) {
    return PaymentService.confirmPayment(paymentIntentId)
  }

  static async handleFailedAuctionPayment(paymentIntentId: string) {
    return PaymentService.handleFailedPayment(paymentIntentId)
  }
}

export default AuctionPaymentService 