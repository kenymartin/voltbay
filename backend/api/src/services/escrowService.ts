import { PrismaClient, TransactionStatus, TransactionType } from '@prisma/client'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'
import WalletService from './walletService'

const prisma = new PrismaClient()

export interface CreateEscrowData {
  orderId: string
  buyerId: string
  sellerId: string
  amount: number
}

export interface ReleaseEscrowData {
  orderId: string
  reason?: string
}

export interface RefundEscrowData {
  orderId: string
  reason?: string
}

export class EscrowService {
  // Create escrow for an order
  async createEscrow(data: CreateEscrowData) {
    try {
      const { orderId, buyerId, sellerId, amount } = data

      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400)
      }

      // Check if escrow already exists
      const existingEscrow = await prisma.escrow.findUnique({
        where: { orderId }
      })

      if (existingEscrow) {
        throw new AppError('Escrow already exists for this order', 400)
      }

      // Verify order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          buyer: true,
          seller: true,
          product: true
        }
      })

      if (!order) {
        throw new AppError('Order not found', 404)
      }

      if (order.buyerId !== buyerId || order.sellerId !== sellerId) {
        throw new AppError('Order participants do not match', 400)
      }

      // Get buyer's wallet
      const buyerWallet = await WalletService.getWallet(buyerId)

      // Check if buyer has sufficient available balance
      const availableBalance = await WalletService.getAvailableBalance(buyerId)
      if (availableBalance < amount) {
        throw new AppError('Insufficient wallet balance for escrow', 400)
      }

      const result = await prisma.$transaction(async (tx) => {
        // Deduct funds from buyer's wallet
        await WalletService.deductFunds(
          buyerId,
          amount,
          `Escrow payment for order ${orderId}`,
          orderId
        )

        // Create escrow record
        const escrow = await tx.escrow.create({
          data: {
            orderId,
            buyerWalletId: buyerWallet.id,
            sellerId,
            amount,
            status: TransactionStatus.PENDING,
            reason: 'Payment held in escrow for order completion'
          }
        })

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' }
        })

        // Create notification for seller
        await tx.notification.create({
          data: {
            userId: sellerId,
            type: 'ORDER_CONFIRMED',
            title: 'Order Payment Confirmed',
            message: `Payment for "${order.product.title}" has been secured in escrow. Please ship the item.`,
            data: { orderId, amount: amount.toString() }
          }
        })

        // Create notification for buyer
        await tx.notification.create({
          data: {
            userId: buyerId,
            type: 'ORDER_CONFIRMED',
            title: 'Payment Secured',
            message: `Your payment for "${order.product.title}" has been secured. Seller will ship your item soon.`,
            data: { orderId, amount: amount.toString() }
          }
        })

        return escrow
      })

      logger.info(`Escrow created for order: ${orderId} - $${amount}`)
      return result

    } catch (error) {
      logger.error('Error creating escrow:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to create escrow', 500)
    }
  }

  // Release escrow to seller (when order is completed)
  async releaseEscrow(data: ReleaseEscrowData) {
    try {
      const { orderId, reason = 'Order completed successfully' } = data

      const escrow = await prisma.escrow.findUnique({
        where: { orderId },
        include: {
          buyerWallet: {
            include: { user: true }
          }
        }
      })

      if (!escrow) {
        throw new AppError('Escrow not found', 404)
      }

      if (escrow.status !== TransactionStatus.PENDING) {
        throw new AppError('Escrow is not in pending status', 400)
      }

      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: true,
          buyer: true,
          seller: true
        }
      })

      if (!order) {
        throw new AppError('Order not found', 404)
      }

      const result = await prisma.$transaction(async (tx) => {
        // Transfer funds to seller's wallet
        await WalletService.transferFunds({
          fromUserId: escrow.buyerWallet.userId,
          toUserId: escrow.sellerId,
          amount: Number(escrow.amount),
          description: `Payment for order ${orderId}`,
          reference: orderId
        })

        // Update escrow status
        const updatedEscrow = await tx.escrow.update({
          where: { orderId },
          data: {
            status: TransactionStatus.COMPLETED,
            reason,
            releasedAt: new Date()
          }
        })

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'DELIVERED' }
        })

        // Create notifications
        await tx.notification.create({
          data: {
            userId: escrow.sellerId,
            type: 'PAYMENT_RECEIVED',
            title: 'Payment Released',
            message: `Payment for "${order.product.title}" has been released to your wallet.`,
            data: { 
              orderId, 
              amount: escrow.amount.toString(),
              reason 
            }
          }
        })

        await tx.notification.create({
          data: {
            userId: escrow.buyerWallet.userId,
            type: 'ORDER_DELIVERED',
            title: 'Order Completed',
            message: `Your order for "${order.product.title}" has been completed. Payment released to seller.`,
            data: { 
              orderId, 
              amount: escrow.amount.toString(),
              reason 
            }
          }
        })

        return updatedEscrow
      })

      logger.info(`Escrow released for order: ${orderId} - $${escrow.amount}`)
      return result

    } catch (error) {
      logger.error('Error releasing escrow:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to release escrow', 500)
    }
  }

  // Refund escrow to buyer (when order is cancelled/disputed)
  async refundEscrow(data: RefundEscrowData) {
    try {
      const { orderId, reason = 'Order refunded' } = data

      const escrow = await prisma.escrow.findUnique({
        where: { orderId },
        include: {
          buyerWallet: {
            include: { user: true }
          }
        }
      })

      if (!escrow) {
        throw new AppError('Escrow not found', 404)
      }

      if (escrow.status !== TransactionStatus.PENDING) {
        throw new AppError('Escrow is not in pending status', 400)
      }

      // Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: true,
          buyer: true,
          seller: true
        }
      })

      if (!order) {
        throw new AppError('Order not found', 404)
      }

      const result = await prisma.$transaction(async (tx) => {
        // Return funds to buyer's wallet
        const refundWallet = await tx.wallet.update({
          where: { id: escrow.buyerWalletId },
          data: {
            balance: {
              increment: escrow.amount
            }
          }
        })

        // Create refund transaction
        await tx.walletTransaction.create({
          data: {
            walletId: escrow.buyerWalletId,
            type: TransactionType.REFUND,
            amount: escrow.amount,
            status: TransactionStatus.COMPLETED,
            description: `Refund for order ${orderId}: ${reason}`,
            reference: orderId
          }
        })

        // Update escrow status
        const updatedEscrow = await tx.escrow.update({
          where: { orderId },
          data: {
            status: TransactionStatus.CANCELLED,
            reason,
            releasedAt: new Date()
          }
        })

        // Update order status
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'REFUNDED' }
        })

        // Create notifications
        await tx.notification.create({
          data: {
            userId: escrow.buyerWallet.userId,
            type: 'PAYMENT_RECEIVED',
            title: 'Refund Processed',
            message: `Your refund for "${order.product.title}" has been processed and added to your wallet.`,
            data: { 
              orderId, 
              amount: escrow.amount.toString(),
              reason 
            }
          }
        })

        await tx.notification.create({
          data: {
            userId: escrow.sellerId,
            type: 'ORDER_CANCELLED',
            title: 'Order Refunded',
            message: `Order for "${order.product.title}" has been refunded to the buyer.`,
            data: { 
              orderId, 
              amount: escrow.amount.toString(),
              reason 
            }
          }
        })

        return { updatedEscrow, refundWallet }
      })

      logger.info(`Escrow refunded for order: ${orderId} - $${escrow.amount}`)
      return result

    } catch (error) {
      logger.error('Error refunding escrow:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to refund escrow', 500)
    }
  }

  // Get escrow status
  async getEscrowStatus(orderId: string) {
    try {
      const escrow = await prisma.escrow.findUnique({
        where: { orderId },
        include: {
          buyerWallet: {
            include: { user: true }
          }
        }
      })

      if (!escrow) {
        throw new AppError('Escrow not found', 404)
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          product: true,
          buyer: true,
          seller: true
        }
      })

      return {
        escrow: {
          id: escrow.id,
          orderId: escrow.orderId,
          amount: escrow.amount,
          status: escrow.status,
          reason: escrow.reason,
          createdAt: escrow.createdAt,
          releasedAt: escrow.releasedAt
        },
        order: order ? {
          id: order.id,
          status: order.status,
          product: {
            id: order.product.id,
            title: order.product.title
          },
          buyer: {
            id: order.buyer.id,
            email: order.buyer.email,
            name: `${order.buyer.firstName} ${order.buyer.lastName}`
          },
          seller: {
            id: order.seller.id,
            email: order.seller.email,
            name: `${order.seller.firstName} ${order.seller.lastName}`
          }
        } : null
      }

    } catch (error) {
      logger.error('Error getting escrow status:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to get escrow status', 500)
    }
  }

  // Get all escrows for a user (as buyer or seller)
  async getUserEscrows(userId: string) {
    try {
      const escrows = await prisma.escrow.findMany({
        where: {
          OR: [
            {
              buyerWallet: {
                userId: userId
              }
            },
            {
              sellerId: userId
            }
          ]
        },
        include: {
          buyerWallet: {
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const escrowsWithOrderDetails = await Promise.all(
        escrows.map(async (escrow) => {
          const order = await prisma.order.findUnique({
            where: { id: escrow.orderId },
            include: {
              product: true,
              buyer: true,
              seller: true
            }
          })

          return {
            ...escrow,
            order,
            userRole: escrow.buyerWallet.userId === userId ? 'buyer' : 'seller'
          }
        })
      )

      return escrowsWithOrderDetails

    } catch (error) {
      logger.error('Error getting user escrows:', error)
      throw new AppError('Failed to get user escrows', 500)
    }
  }
}

export default new EscrowService() 