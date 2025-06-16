import { PrismaClient, TransactionType, TransactionStatus } from '@prisma/client'
import stripe from '../config/stripe'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

export interface CreateWalletData {
  userId: string
}

export interface AddFundsData {
  userId: string
  amount: number
  paymentMethodId: string
  description?: string
}

export interface TransferFundsData {
  fromUserId: string
  toUserId: string
  amount: number
  description: string
  reference?: string
}

export interface HoldFundsData {
  userId: string
  amount: number
  reference: string
  description: string
}

export class WalletService {
  // Create wallet for new user
  async createWallet(data: CreateWalletData) {
    try {
      const existingWallet = await prisma.wallet.findUnique({
        where: { userId: data.userId }
      })

      if (existingWallet) {
        return existingWallet
      }

      const wallet = await prisma.wallet.create({
        data: {
          userId: data.userId,
          balance: 0,
          lockedBalance: 0
        }
      })

      logger.info(`Wallet created for user: ${data.userId}`)
      return wallet

    } catch (error) {
      logger.error('Error creating wallet:', error)
      throw new AppError('Failed to create wallet', 500)
    }
  }

  // Get wallet balance and details
  async getWallet(userId: string) {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })

      if (!wallet) {
        // Auto-create wallet if it doesn't exist
        return await this.createWallet({ userId })
      }

      return wallet

    } catch (error) {
      logger.error('Error getting wallet:', error)
      throw new AppError('Failed to get wallet', 500)
    }
  }

  // Get available balance (total - locked)
  async getAvailableBalance(userId: string) {
    try {
      const wallet = await this.getWallet(userId)
      const availableBalance = Number(wallet.balance) - Number(wallet.lockedBalance)
      return Math.max(0, availableBalance)

    } catch (error) {
      logger.error('Error getting available balance:', error)
      throw new AppError('Failed to get available balance', 500)
    }
  }

  // Add funds to wallet via Stripe
  async addFunds(data: AddFundsData) {
    try {
      const { userId, amount, paymentMethodId, description = 'Wallet top-up' } = data

      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400)
      }

      // Get user for Stripe customer
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new AppError('User not found', 404)
      }

      // Create payment intent with Stripe
      const amountInCents = Math.round(amount * 100)
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        payment_method: paymentMethodId,
        customer: user.stripeCustomerId || undefined,
        confirm: true,
        description: `Wallet deposit: ${description}`,
        metadata: {
          type: 'wallet_deposit',
          userId: userId,
          amount: amount.toString()
        }
      })

      if (paymentIntent.status !== 'succeeded') {
        throw new AppError('Payment failed', 400)
      }

      // Add funds to wallet in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Get or create wallet
        let wallet = await tx.wallet.findUnique({
          where: { userId }
        })

        if (!wallet) {
          wallet = await tx.wallet.create({
            data: { userId, balance: 0, lockedBalance: 0 }
          })
        }

        // Update wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { userId },
          data: {
            balance: {
              increment: amount
            }
          }
        })

        // Create transaction record
        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: TransactionType.DEPOSIT,
            amount: amount,
            status: TransactionStatus.COMPLETED,
            description: description,
            reference: paymentIntent.id,
            metadata: {
              stripePaymentIntentId: paymentIntent.id,
              paymentMethodId: paymentMethodId
            }
          }
        })

        return { wallet: updatedWallet, transaction }
      })

      logger.info(`Funds added to wallet: ${userId} - $${amount}`)
      return result

    } catch (error) {
      logger.error('Error adding funds to wallet:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to add funds to wallet', 500)
    }
  }

  // Hold funds for auction bidding
  async holdFunds(data: HoldFundsData) {
    try {
      const { userId, amount, reference, description } = data

      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400)
      }

      const availableBalance = await this.getAvailableBalance(userId)
      
      if (availableBalance < amount) {
        throw new AppError('Insufficient available balance', 400)
      }

      const result = await prisma.$transaction(async (tx) => {
        // Update wallet to lock funds
        const wallet = await tx.wallet.update({
          where: { userId },
          data: {
            lockedBalance: {
              increment: amount
            }
          }
        })

        // Create hold transaction
        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: TransactionType.AUCTION_HOLD,
            amount: amount,
            status: TransactionStatus.COMPLETED,
            description: description,
            reference: reference
          }
        })

        return { wallet, transaction }
      })

      logger.info(`Funds held: ${userId} - $${amount} for ${reference}`)
      return result

    } catch (error) {
      logger.error('Error holding funds:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to hold funds', 500)
    }
  }

  // Release held funds
  async releaseFunds(userId: string, amount: number, reference: string, description: string) {
    try {
      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400)
      }

      const wallet = await this.getWallet(userId)
      
      if (Number(wallet.lockedBalance) < amount) {
        throw new AppError('Insufficient locked balance', 400)
      }

      const result = await prisma.$transaction(async (tx) => {
        // Update wallet to release funds
        const updatedWallet = await tx.wallet.update({
          where: { userId },
          data: {
            lockedBalance: {
              decrement: amount
            }
          }
        })

        // Create release transaction
        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: TransactionType.AUCTION_RELEASE,
            amount: amount,
            status: TransactionStatus.COMPLETED,
            description: description,
            reference: reference
          }
        })

        return { wallet: updatedWallet, transaction }
      })

      logger.info(`Funds released: ${userId} - $${amount} for ${reference}`)
      return result

    } catch (error) {
      logger.error('Error releasing funds:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to release funds', 500)
    }
  }

  // Deduct funds from wallet (for purchases)
  async deductFunds(userId: string, amount: number, description: string, reference?: string) {
    try {
      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400)
      }

      const availableBalance = await this.getAvailableBalance(userId)
      
      if (availableBalance < amount) {
        throw new AppError('Insufficient available balance', 400)
      }

      const result = await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({
          where: { userId }
        })

        if (!wallet) {
          throw new AppError('Wallet not found', 404)
        }

        // Update wallet balance
        const updatedWallet = await tx.wallet.update({
          where: { userId },
          data: {
            balance: {
              decrement: amount
            }
          }
        })

        // Create deduction transaction
        const transaction = await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: TransactionType.PURCHASE,
            amount: -amount, // Negative for deduction
            status: TransactionStatus.COMPLETED,
            description: description,
            reference: reference
          }
        })

        return { wallet: updatedWallet, transaction }
      })

      logger.info(`Funds deducted: ${userId} - $${amount} for ${description}`)
      return result

    } catch (error) {
      logger.error('Error deducting funds:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to deduct funds', 500)
    }
  }

  // Transfer funds between users
  async transferFunds(data: TransferFundsData) {
    try {
      const { fromUserId, toUserId, amount, description, reference } = data

      if (amount <= 0) {
        throw new AppError('Amount must be greater than 0', 400)
      }

      if (fromUserId === toUserId) {
        throw new AppError('Cannot transfer to same user', 400)
      }

      const availableBalance = await this.getAvailableBalance(fromUserId)
      
      if (availableBalance < amount) {
        throw new AppError('Insufficient available balance', 400)
      }

      const result = await prisma.$transaction(async (tx) => {
        // Get both wallets
        const fromWallet = await tx.wallet.findUnique({
          where: { userId: fromUserId }
        })

        let toWallet = await tx.wallet.findUnique({
          where: { userId: toUserId }
        })

        if (!fromWallet) {
          throw new AppError('Source wallet not found', 404)
        }

        // Create destination wallet if it doesn't exist
        if (!toWallet) {
          toWallet = await tx.wallet.create({
            data: { userId: toUserId, balance: 0, lockedBalance: 0 }
          })
        }

        // Update balances
        const updatedFromWallet = await tx.wallet.update({
          where: { userId: fromUserId },
          data: {
            balance: {
              decrement: amount
            }
          }
        })

        const updatedToWallet = await tx.wallet.update({
          where: { userId: toUserId },
          data: {
            balance: {
              increment: amount
            }
          }
        })

        // Create transactions for both wallets
        const fromTransaction = await tx.walletTransaction.create({
          data: {
            walletId: fromWallet.id,
            type: TransactionType.PURCHASE,
            amount: -amount,
            status: TransactionStatus.COMPLETED,
            description: `Transfer to user: ${description}`,
            reference: reference
          }
        })

        const toTransaction = await tx.walletTransaction.create({
          data: {
            walletId: toWallet.id,
            type: TransactionType.SELLER_PAYOUT,
            amount: amount,
            status: TransactionStatus.COMPLETED,
            description: `Transfer from user: ${description}`,
            reference: reference
          }
        })

        return {
          fromWallet: updatedFromWallet,
          toWallet: updatedToWallet,
          fromTransaction,
          toTransaction
        }
      })

      logger.info(`Funds transferred: ${fromUserId} -> ${toUserId} - $${amount}`)
      return result

    } catch (error) {
      logger.error('Error transferring funds:', error)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError('Failed to transfer funds', 500)
    }
  }

  // Get transaction history
  async getTransactionHistory(userId: string, page = 1, limit = 20) {
    try {
      const wallet = await this.getWallet(userId)
      
      const transactions = await prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })

      const total = await prisma.walletTransaction.count({
        where: { walletId: wallet.id }
      })

      return {
        transactions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }

    } catch (error) {
      logger.error('Error getting transaction history:', error)
      throw new AppError('Failed to get transaction history', 500)
    }
  }

  // Get wallet statistics
  async getWalletStats(userId: string) {
    try {
      const wallet = await this.getWallet(userId)
      
      const stats = await prisma.walletTransaction.groupBy({
        by: ['type'],
        where: { 
          walletId: wallet.id,
          status: TransactionStatus.COMPLETED
        },
        _sum: {
          amount: true
        },
        _count: {
          id: true
        }
      })

      const totalDeposits = stats
        .filter(s => s.type === TransactionType.DEPOSIT)
        .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0)

      const totalPurchases = Math.abs(stats
        .filter(s => s.type === TransactionType.PURCHASE)
        .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0))

      return {
        balance: Number(wallet.balance),
        lockedBalance: Number(wallet.lockedBalance),
        availableBalance: await this.getAvailableBalance(userId),
        totalDeposits,
        totalPurchases,
        transactionCount: stats.reduce((sum, s) => sum + s._count.id, 0)
      }

    } catch (error) {
      logger.error('Error getting wallet stats:', error)
      throw new AppError('Failed to get wallet statistics', 500)
    }
  }
}

export default new WalletService() 