import express from 'express'
import { body, param, query } from 'express-validator'
import { authenticateUser } from '../middleware/auth'
import { validateRequest } from '../middleware/validation'
import WalletService from '../services/walletService'
import EscrowService from '../services/escrowService'
import { AppError } from '../utils/errors'
import { ApiResponse } from '../types/api'

const router = express.Router()

// Get wallet balance and details
router.get(
  '/balance',
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const userId = req.user.id
      const wallet = await WalletService.getWallet(userId)
      const availableBalance = await WalletService.getAvailableBalance(userId)

      const response: ApiResponse<any> = {
        success: true,
        data: {
          wallet: {
            id: wallet.id,
            balance: Number(wallet.balance),
            lockedBalance: Number(wallet.lockedBalance),
            availableBalance,
            createdAt: wallet.createdAt,
            updatedAt: wallet.updatedAt
          }
        }
      }
      
      res.json(response)
    } catch (error) {
      console.error('Error getting wallet balance:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to get wallet balance'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Add funds to wallet
router.post(
  '/add-funds',
  authenticateUser,
  [
    body('amount')
      .isFloat({ min: 0.01, max: 10000 })
      .withMessage('Amount must be between $0.01 and $10,000'),
    body('paymentMethodId')
      .notEmpty()
      .withMessage('Payment method ID is required'),
    body('description')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Description must be less than 255 characters')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const userId = req.user.id
      const { amount, paymentMethodId, description } = req.body

      const result = await WalletService.addFunds({
        userId,
        amount: parseFloat(amount),
        paymentMethodId,
        description
      })

      const response: ApiResponse<any> = {
        success: true,
        message: 'Funds added successfully',
        data: {
          wallet: {
            id: result.wallet.id,
            balance: Number(result.wallet.balance),
            lockedBalance: Number(result.wallet.lockedBalance)
          },
          transaction: {
            id: result.transaction.id,
            type: result.transaction.type,
            amount: Number(result.transaction.amount),
            status: result.transaction.status,
            description: result.transaction.description,
            createdAt: result.transaction.createdAt
          }
        }
      }
      
      res.status(201).json(response)
    } catch (error) {
      console.error('Error adding funds:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to add funds'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Get transaction history
router.get(
  '/transactions',
  authenticateUser,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const userId = req.user.id
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20

      const result = await WalletService.getTransactionHistory(userId, page, limit)

      const response: ApiResponse<any> = {
        success: true,
        data: {
          transactions: result.transactions.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            status: t.status,
            description: t.description,
            reference: t.reference,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
          })),
          pagination: result.pagination
        }
      }
      
      res.json(response)
    } catch (error) {
      console.error('Error getting transaction history:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to get transaction history'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Get wallet statistics
router.get(
  '/stats',
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const userId = req.user.id
      const stats = await WalletService.getWalletStats(userId)

      const response: ApiResponse<any> = {
        success: true,
        data: { stats }
      }
      
      res.json(response)
    } catch (error) {
      console.error('Error getting wallet stats:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to get wallet statistics'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Transfer funds between users
router.post(
  '/transfer',
  authenticateUser,
  [
    body('toUserId')
      .notEmpty()
      .withMessage('Recipient user ID is required'),
    body('amount')
      .isFloat({ min: 0.01, max: 10000 })
      .withMessage('Amount must be between $0.01 and $10,000'),
    body('description')
      .notEmpty()
      .isLength({ min: 1, max: 255 })
      .withMessage('Description is required and must be less than 255 characters'),
    body('reference')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Reference must be less than 100 characters')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const fromUserId = req.user.id
      const { toUserId, amount, description, reference } = req.body

      const result = await WalletService.transferFunds({
        fromUserId,
        toUserId,
        amount: parseFloat(amount),
        description,
        reference
      })

      const response: ApiResponse<any> = {
        success: true,
        message: 'Funds transferred successfully',
        data: {
          fromWallet: {
            id: result.fromWallet.id,
            balance: Number(result.fromWallet.balance),
            lockedBalance: Number(result.fromWallet.lockedBalance)
          },
          toWallet: {
            id: result.toWallet.id,
            balance: Number(result.toWallet.balance),
            lockedBalance: Number(result.toWallet.lockedBalance)
          },
          transactions: {
            from: {
              id: result.fromTransaction.id,
              amount: Number(result.fromTransaction.amount),
              description: result.fromTransaction.description
            },
            to: {
              id: result.toTransaction.id,
              amount: Number(result.toTransaction.amount),
              description: result.toTransaction.description
            }
          }
        }
      }
      
      res.status(201).json(response)
    } catch (error) {
      console.error('Error transferring funds:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to transfer funds'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Hold funds for auction/order
router.post(
  '/hold',
  authenticateUser,
  [
    body('amount')
      .isFloat({ min: 0.01, max: 10000 })
      .withMessage('Amount must be between $0.01 and $10,000'),
    body('reference')
      .notEmpty()
      .withMessage('Reference is required'),
    body('description')
      .notEmpty()
      .isLength({ min: 1, max: 255 })
      .withMessage('Description is required and must be less than 255 characters')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const userId = req.user.id
      const { amount, reference, description } = req.body

      const result = await WalletService.holdFunds({
        userId,
        amount: parseFloat(amount),
        reference,
        description
      })

      const response: ApiResponse<any> = {
        success: true,
        message: 'Funds held successfully',
        data: {
          wallet: {
            id: result.wallet.id,
            balance: Number(result.wallet.balance),
            lockedBalance: Number(result.wallet.lockedBalance)
          },
          transaction: {
            id: result.transaction.id,
            type: result.transaction.type,
            amount: Number(result.transaction.amount),
            status: result.transaction.status,
            description: result.transaction.description,
            reference: result.transaction.reference
          }
        }
      }
      
      res.status(201).json(response)
    } catch (error) {
      console.error('Error holding funds:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to hold funds'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Release held funds
router.post(
  '/release',
  authenticateUser,
  [
    body('amount')
      .isFloat({ min: 0.01, max: 10000 })
      .withMessage('Amount must be between $0.01 and $10,000'),
    body('reference')
      .notEmpty()
      .withMessage('Reference is required'),
    body('description')
      .notEmpty()
      .isLength({ min: 1, max: 255 })
      .withMessage('Description is required and must be less than 255 characters')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const userId = req.user.id
      const { amount, reference, description } = req.body

      const result = await WalletService.releaseFunds(
        userId,
        parseFloat(amount),
        reference,
        description
      )

      const response: ApiResponse<any> = {
        success: true,
        message: 'Funds released successfully',
        data: {
          wallet: {
            id: result.wallet.id,
            balance: Number(result.wallet.balance),
            lockedBalance: Number(result.wallet.lockedBalance)
          },
          transaction: {
            id: result.transaction.id,
            type: result.transaction.type,
            amount: Number(result.transaction.amount),
            status: result.transaction.status,
            description: result.transaction.description,
            reference: result.transaction.reference
          }
        }
      }
      
      res.status(200).json(response)
    } catch (error) {
      console.error('Error releasing funds:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to release funds'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Escrow routes
router.post(
  '/escrow/create',
  authenticateUser,
  [
    body('orderId')
      .notEmpty()
      .withMessage('Order ID is required'),
    body('sellerId')
      .notEmpty()
      .withMessage('Seller ID is required'),
    body('amount')
      .isFloat({ min: 0.01, max: 50000 })
      .withMessage('Amount must be between $0.01 and $50,000')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const buyerId = req.user.id
      const { orderId, sellerId, amount } = req.body

      const result = await EscrowService.createEscrow({
        orderId,
        buyerId,
        sellerId,
        amount: parseFloat(amount)
      })

      const response: ApiResponse<any> = {
        success: true,
        message: 'Escrow created successfully',
        data: {
          escrow: {
            id: result.id,
            orderId: result.orderId,
            amount: Number(result.amount),
            status: result.status,
            createdAt: result.createdAt
          }
        }
      }
      
      res.status(201).json(response)
    } catch (error) {
      console.error('Error creating escrow:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to create escrow'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Release escrow
router.post(
  '/escrow/:orderId/release',
  authenticateUser,
  [
    param('orderId')
      .notEmpty()
      .withMessage('Order ID is required'),
    body('reason')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Reason must be less than 255 characters')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const { orderId } = req.params
      const { reason } = req.body

      const result = await EscrowService.releaseEscrow({
        orderId,
        reason
      })

      const response: ApiResponse<any> = {
        success: true,
        message: 'Escrow released successfully',
        data: {
          escrow: {
            id: result.id,
            orderId: result.orderId,
            amount: Number(result.amount),
            status: result.status,
            releasedAt: result.releasedAt
          }
        }
      }
      
      res.status(200).json(response)
    } catch (error) {
      console.error('Error releasing escrow:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to release escrow'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Refund escrow
router.post(
  '/escrow/:orderId/refund',
  authenticateUser,
  [
    param('orderId')
      .notEmpty()
      .withMessage('Order ID is required'),
    body('reason')
      .optional()
      .isLength({ max: 255 })
      .withMessage('Reason must be less than 255 characters')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const { orderId } = req.params
      const { reason } = req.body

      const result = await EscrowService.refundEscrow({
        orderId,
        reason
      })

      const response: ApiResponse<any> = {
        success: true,
        message: 'Escrow refunded successfully',
        data: {
          escrow: {
            id: result.updatedEscrow.id,
            orderId: result.updatedEscrow.orderId,
            amount: Number(result.updatedEscrow.amount),
            status: result.updatedEscrow.status,
            releasedAt: result.updatedEscrow.releasedAt
          }
        }
      }
      
      res.status(200).json(response)
    } catch (error) {
      console.error('Error refunding escrow:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to refund escrow'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Get escrow status
router.get(
  '/escrow/:orderId',
  authenticateUser,
  [
    param('orderId')
      .notEmpty()
      .withMessage('Order ID is required')
  ],
  validateRequest,
  async (req: any, res: any) => {
    try {
      const { orderId } = req.params

      const result = await EscrowService.getEscrowStatus(orderId)

      const response: ApiResponse<any> = {
        success: true,
        data: result
      }
      
      res.json(response)
    } catch (error) {
      console.error('Error getting escrow status:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to get escrow status'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

// Get user escrows
router.get(
  '/escrows',
  authenticateUser,
  async (req: any, res: any) => {
    try {
      const userId = req.user.id

      const escrows = await EscrowService.getUserEscrows(userId)

      const response: ApiResponse<any> = {
        success: true,
        data: { escrows }
      }
      
      res.json(response)
    } catch (error) {
      console.error('Error getting user escrows:', error)
      const response: ApiResponse<null> = {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to get user escrows'
      }
      res.status(error instanceof AppError ? error.statusCode : 500).json(response)
    }
  }
)

export default router 