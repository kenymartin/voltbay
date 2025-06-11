import apiService from './api'
import { Wallet, WalletStats, WalletTransaction, TransactionType, TransactionStatus } from '../types/wallet'
import type { ApiResponse } from '../../../shared/types'

export interface AddFundsData {
  amount: number
  paymentMethodId: string
  description?: string
}

export interface TransferFundsData {
  toUserId: string
  amount: number
  description?: string
  reference?: string
}

export interface TransactionHistoryResponse {
  transactions: WalletTransaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class WalletService {
  // Get wallet balance and details
  async getWallet(): Promise<Wallet> {
    try {
      const response = await apiService.get<ApiResponse<Wallet>>('/api/wallet/balance')
      
      if (!response.success || !response.data) {
        throw new Error('Failed to get wallet')
      }
      
      return response.data
    } catch (error) {
      console.error('Error getting wallet:', error)
      throw error
    }
  }

  // Add funds to wallet
  async addFunds(data: AddFundsData): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    try {
      const response = await apiService.post<ApiResponse<{ wallet: Wallet; transaction: WalletTransaction }>>('/api/wallet/add-funds', data)
      
      if (!response.success || !response.data) {
        throw new Error('Failed to add funds')
      }
      
      return response.data
    } catch (error) {
      console.error('Error adding funds:', error)
      throw error
    }
  }

  // Get transaction history
  async getTransactionHistory(page = 1, limit = 20): Promise<TransactionHistoryResponse> {
    try {
      const response = await apiService.get<ApiResponse<TransactionHistoryResponse>>(
        `/api/wallet/transactions?page=${page}&limit=${limit}`
      )
      
      if (!response.success || !response.data) {
        throw new Error('Failed to get transaction history')
      }
      
      return response.data
    } catch (error) {
      console.error('Error getting transaction history:', error)
      throw error
    }
  }

  // Get wallet statistics
  async getWalletStats(): Promise<WalletStats> {
    try {
      const response = await apiService.get<ApiResponse<WalletStats>>('/api/wallet/stats')
      
      if (!response.success || !response.data) {
        throw new Error('Failed to get wallet stats')
      }
      
      return response.data
    } catch (error) {
      console.error('Error getting wallet stats:', error)
      throw error
    }
  }

  // Transfer funds to another user
  async transferFunds(data: TransferFundsData): Promise<{
    fromWallet: Wallet
    toWallet: Wallet
    transactions: {
      from: WalletTransaction
      to: WalletTransaction
    }
  }> {
    try {
      const response = await apiService.post<ApiResponse<{
        fromWallet: Wallet
        toWallet: Wallet
        transactions: {
          from: WalletTransaction
          to: WalletTransaction
        }
      }>>('/api/wallet/transfer', data)
      
      if (!response.success || !response.data) {
        throw new Error('Failed to transfer funds')
      }
      
      return response.data
    } catch (error) {
      console.error('Error transferring funds:', error)
      throw error
    }
  }

  // Hold funds for auction
  async holdFunds(data: { amount: number; reference: string; description?: string }): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    try {
      const response = await apiService.post<ApiResponse<{ wallet: Wallet; transaction: WalletTransaction }>>('/api/wallet/hold', data)
      
      if (!response.success || !response.data) {
        throw new Error('Failed to hold funds')
      }
      
      return response.data
    } catch (error) {
      console.error('Error holding funds:', error)
      throw error
    }
  }

  // Release held funds
  async releaseFunds(data: { amount: number; reference: string; description?: string }): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    try {
      const response = await apiService.post<ApiResponse<{ wallet: Wallet; transaction: WalletTransaction }>>('/api/wallet/release', data)
      
      if (!response.success || !response.data) {
        throw new Error('Failed to release funds')
      }
      
      return response.data
    } catch (error) {
      console.error('Error releasing funds:', error)
      throw error
    }
  }

  // Create escrow for order
  async createEscrow(orderId: string): Promise<any> {
    try {
      const response = await apiService.post<ApiResponse<any>>('/api/wallet/escrow/create', { orderId })
      
      if (!response.success || !response.data) {
        throw new Error('Failed to create escrow')
      }
      
      return response.data
    } catch (error) {
      console.error('Error creating escrow:', error)
      throw error
    }
  }

  // Release escrow
  async releaseEscrow(orderId: string): Promise<any> {
    try {
      const response = await apiService.post<ApiResponse<any>>('/api/wallet/escrow/release', { orderId })
      
      if (!response.success || !response.data) {
        throw new Error('Failed to release escrow')
      }
      
      return response.data
    } catch (error) {
      console.error('Error releasing escrow:', error)
      throw error
    }
  }

  // Refund escrow
  async refundEscrow(orderId: string, reason?: string): Promise<any> {
    try {
      const response = await apiService.post<ApiResponse<any>>('/api/wallet/escrow/refund', { orderId, reason })
      
      if (!response.success || !response.data) {
        throw new Error('Failed to refund escrow')
      }
      
      return response.data
    } catch (error) {
      console.error('Error refunding escrow:', error)
      throw error
    }
  }

  // Get escrow status
  async getEscrowStatus(orderId: string): Promise<any> {
    try {
      const response = await apiService.get<ApiResponse<any>>(`/api/wallet/escrow/${orderId}`)
      
      if (!response.success || !response.data) {
        throw new Error('Failed to get escrow status')
      }
      
      return response.data
    } catch (error) {
      console.error('Error getting escrow status:', error)
      throw error
    }
  }

  // Get user escrows
  async getUserEscrows(): Promise<any[]> {
    try {
      const response = await apiService.get<ApiResponse<any[]>>('/api/wallet/escrows')
      
      if (!response.success || !response.data) {
        throw new Error('Failed to get user escrows')
      }
      
      return response.data
    } catch (error) {
      console.error('Error getting user escrows:', error)
      throw error
    }
  }

  // Utility methods
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  static getTransactionIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.DEPOSIT:
        return '💰'
      case TransactionType.WITHDRAWAL:
        return '💸'
      case TransactionType.PURCHASE:
        return '🛒'
      case TransactionType.REFUND:
        return '💵'
      case TransactionType.AUCTION_HOLD:
        return '🔒'
      case TransactionType.AUCTION_RELEASE:
        return '🔓'
      case TransactionType.SELLER_PAYOUT:
        return '💳'
      case TransactionType.PLATFORM_FEE:
        return '🏢'
      default:
        return '💱'
    }
  }

  static formatTransactionType(type: TransactionType): string {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'Deposit'
      case TransactionType.WITHDRAWAL:
        return 'Withdrawal'
      case TransactionType.PURCHASE:
        return 'Purchase'
      case TransactionType.REFUND:
        return 'Refund'
      case TransactionType.AUCTION_HOLD:
        return 'Auction Hold'
      case TransactionType.AUCTION_RELEASE:
        return 'Auction Release'
      case TransactionType.SELLER_PAYOUT:
        return 'Seller Payout'
      case TransactionType.PLATFORM_FEE:
        return 'Platform Fee'
      default:
        return 'Transaction'
    }
  }

  static getTransactionColor(type: TransactionType): string {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.REFUND:
      case TransactionType.SELLER_PAYOUT:
        return 'text-green-600'
      case TransactionType.WITHDRAWAL:
      case TransactionType.PURCHASE:
      case TransactionType.PLATFORM_FEE:
        return 'text-red-600'
      case TransactionType.AUCTION_HOLD:
        return 'text-yellow-600'
      case TransactionType.AUCTION_RELEASE:
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }
}

export default WalletService
export { WalletService }

// Create and export instance for easy usage
const walletService = new WalletService()
export { walletService } 