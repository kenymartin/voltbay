import express from 'express'
import { authenticateUser } from '../middleware/auth'
import WalletService from '../services/walletService'
import EscrowService from '../services/escrowService'
import { AppError } from '../utils/errors'
import { ApiResponse } from '../types/api'

const router = express.Router()

// Get wallet balance and details
router.get('/balance', authenticateUser, async (req: any, res: any) => {
  try {
    const response: ApiResponse<any> = {
      success: true,
      data: {
        wallet: {
          id: 'mock-wallet-id',
          balance: 0,
          lockedBalance: 0,
          availableBalance: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }
    
    res.json(response)
  } catch (error) {
    console.error('Error getting wallet balance:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to get wallet balance'
    }
    res.status(500).json(response)
  }
})

// Add funds to wallet
router.post('/add-funds', authenticateUser, async (req: any, res: any) => {
  try {
    const { amount, paymentMethodId, description } = req.body

    const response: ApiResponse<any> = {
      success: true,
      message: 'Funds added successfully',
      data: {
        wallet: {
          id: 'mock-wallet-id',
          balance: parseFloat(amount) || 0,
          lockedBalance: 0
        },
        transaction: {
          id: 'mock-transaction-id',
          type: 'DEPOSIT',
          amount: parseFloat(amount) || 0,
          status: 'COMPLETED',
          description: description || 'Wallet top-up',
          createdAt: new Date()
        }
      }
    }
    
    res.status(201).json(response)
  } catch (error) {
    console.error('Error adding funds:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to add funds'
    }
    res.status(500).json(response)
  }
})

// Get transaction history
router.get('/transactions', authenticateUser, async (req: any, res: any) => {
  try {
    const response: ApiResponse<any> = {
      success: true,
      data: {
        transactions: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      }
    }
    
    res.json(response)
  } catch (error) {
    console.error('Error getting transaction history:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to get transaction history'
    }
    res.status(500).json(response)
  }
})

// Get wallet statistics
router.get('/stats', authenticateUser, async (req: any, res: any) => {
  try {
    const response: ApiResponse<any> = {
      success: true,
      data: { 
        stats: {
          balance: 0,
          lockedBalance: 0,
          availableBalance: 0,
          totalDeposits: 0,
          totalPurchases: 0,
          transactionCount: 0
        }
      }
    }
    
    res.json(response)
  } catch (error) {
    console.error('Error getting wallet stats:', error)
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to get wallet statistics'
    }
    res.status(500).json(response)
  }
})

// Transfer funds between users
router.post('/transfer', authenticateUser, async (req: any, res: any) => {
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
})

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