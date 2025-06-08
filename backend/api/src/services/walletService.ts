import { PrismaClient, TransactionType, TransactionStatus } from '@prisma/client';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export class WalletService {
  /**
   * Get or create wallet for user
   */
  async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          lockedBalance: 0,
        },
      });
    }

    return wallet;
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: Number(wallet.balance),
      lockedBalance: Number(wallet.lockedBalance),
      availableBalance: Number(wallet.balance) - Number(wallet.lockedBalance),
    };
  }

  /**
   * Add funds to wallet
   */
  async addFunds(userId: string, amount: number, description: string, reference?: string) {
    const wallet = await this.getOrCreateWallet(userId);

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.DEPOSIT,
          amount,
          status: TransactionStatus.COMPLETED,
          description,
          reference,
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

  /**
   * Make a payment from wallet
   */
  async makePayment(userId: string, amount: number, description: string, reference?: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const availableBalance = Number(wallet.balance) - Number(wallet.lockedBalance);

    if (availableBalance < amount) {
      throw new AppError('Insufficient funds in wallet', 400);
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.PURCHASE,
          amount: -amount, // Negative for debit
          status: TransactionStatus.COMPLETED,
          description,
          reference,
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

  /**
   * Hold funds in escrow
   */
  async holdFunds(userId: string, amount: number, description: string, reference?: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const availableBalance = Number(wallet.balance) - Number(wallet.lockedBalance);

    if (availableBalance < amount) {
      throw new AppError('Insufficient funds to hold in escrow', 400);
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update locked balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          lockedBalance: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.ESCROW_HOLD,
          amount: -amount, // Negative for hold
          status: TransactionStatus.COMPLETED,
          description,
          reference,
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

  /**
   * Release funds from escrow
   */
  async releaseFunds(userId: string, amount: number, description: string, reference?: string) {
    const wallet = await this.getOrCreateWallet(userId);

    if (Number(wallet.lockedBalance) < amount) {
      throw new AppError('Insufficient locked funds to release', 400);
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update locked balance and main balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
          lockedBalance: {
            decrement: amount,
          },
        },
      });

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: TransactionType.ESCROW_RELEASE,
          amount: -amount, // Negative for final debit
          status: TransactionStatus.COMPLETED,
          description,
          reference,
        },
      });

      return { wallet: updatedWallet, transaction };
    });

    return result;
  }

  /**
   * Get transaction history
   */
  async getTransactions(userId: string, page = 1, limit = 20) {
    const wallet = await this.getOrCreateWallet(userId);

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      items: transactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);

    const [totalDeposits, totalSpent, transactionCount] = await Promise.all([
      prisma.walletTransaction.aggregate({
        where: {
          walletId: wallet.id,
          type: TransactionType.DEPOSIT,
          status: TransactionStatus.COMPLETED,
        },
        _sum: { amount: true },
      }),
      prisma.walletTransaction.aggregate({
        where: {
          walletId: wallet.id,
          type: { in: [TransactionType.PURCHASE, TransactionType.ESCROW_RELEASE] },
          status: TransactionStatus.COMPLETED,
        },
        _sum: { amount: true },
      }),
      prisma.walletTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      totalDeposits: Number(totalDeposits._sum.amount || 0),
      totalSpent: Math.abs(Number(totalSpent._sum.amount || 0)),
      transactionCount,
      currentBalance: Number(wallet.balance),
      lockedBalance: Number(wallet.lockedBalance),
    };
  }
} 