import { Router } from 'express';
import { body, query } from 'express-validator';
import { AuthMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { WalletService } from '../services/walletService';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const authMiddleware = new AuthMiddleware();
const walletService = new WalletService();

// Apply authentication to all wallet routes
router.use(authMiddleware.authenticate.bind(authMiddleware));

/**
 * GET /api/wallet/balance
 * Get user's wallet balance
 */
router.get('/balance', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const balance = await walletService.getBalance(userId);
  
  res.json({
    success: true,
    data: balance,
  });
}));

/**
 * POST /api/wallet/add-funds
 * Add funds to wallet
 */
router.post('/add-funds', [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Description is required'),
  body('reference')
    .optional()
    .isString()
    .isLength({ max: 255 }),
  validateRequest,
], asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { amount, description, reference } = req.body;

  const result = await walletService.addFunds(userId, amount, description, reference);
  
  res.json({
    success: true,
    data: {
      balance: Number(result.wallet.balance),
      transaction: {
        ...result.transaction,
        amount: Number(result.transaction.amount),
      },
    },
    message: 'Funds added successfully',
  });
}));

/**
 * POST /api/wallet/pay
 * Make a payment from wallet
 */
router.post('/pay', [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Description is required'),
  body('reference')
    .optional()
    .isString()
    .isLength({ max: 255 }),
  validateRequest,
], asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { amount, description, reference } = req.body;

  const result = await walletService.makePayment(userId, amount, description, reference);
  
  res.json({
    success: true,
    data: {
      balance: Number(result.wallet.balance),
      transaction: {
        ...result.transaction,
        amount: Number(result.transaction.amount),
      },
    },
    message: 'Payment processed successfully',
  });
}));

/**
 * GET /api/wallet/transactions
 * Get transaction history
 */
router.get('/transactions', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validateRequest,
], asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const transactions = await walletService.getTransactions(userId, page, limit);
  
  res.json({
    success: true,
    data: transactions,
  });
}));

/**
 * GET /api/wallet/stats
 * Get wallet statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const stats = await walletService.getWalletStats(userId);
  
  res.json({
    success: true,
    data: stats,
  });
}));

export default router; 