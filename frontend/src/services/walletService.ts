import apiService from './api'
import { 
  Wallet, 
  WalletTransaction, 
  WalletStats, 
  Escrow, 
  AddFundsData, 
  TransferFundsData,
  PaginationInfo 
} from '../types/wallet'

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface TransactionHistoryResponse {
  transactions: WalletTransaction[]
  pagination: PaginationInfo
}

class WalletService {
  // Get wallet balance and details
  async getWallet(): Promise<Wallet> {
    try {
      const response = await apiService.get<ApiResponse<{ wallet: Wallet }>>('/api/wallet/balance')
      
      if (!response.data?.success || !response.data.data?.wallet) {
        throw new Error(response.data?.error || 'Failed to get wallet')
      }
      
      return response.data.data.wallet
    } catch (error) {
      console.error('Error getting wallet:', error)
      throw error
    }
  }

  // Add funds to wallet
  async addFunds(data: AddFundsData): Promise<{ wallet: Wallet; transaction: WalletTransaction }> {
    try {
      const response = await apiService.post<ApiResponse<{
        wallet: Wallet
        transaction: WalletTransaction
      }>>('/api/wallet/add-funds', data)
      
      if (!response.data?.success || !response.data.data) {
        throw new Error(response.data?.error || 'Failed to add funds')
      }
      
      return response.data.data
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
      
      if (!response.data?.success || !response.data.data) {
        throw new Error(response.data?.error || 'Failed to get transaction history')
      }
      
      return response.data.data
    } catch (error) {
      console.error('Error getting transaction history:', error)
      throw error
    }
  }

  // Get wallet statistics
  async getWalletStats(): Promise<WalletStats> {
    try {
      const response = await apiService.get<ApiResponse<{ stats: WalletStats }>>('/api/wallet/stats')
      
      if (!response.data?.success || !response.data.data?.stats) {
        throw new Error(response.data?.error || 'Failed to get wallet stats')
      }
      
      return response.data.data.stats
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
      
      if (!response.data?.success || !response.data.data) {
        throw new Error(response.data?.error || 'Failed to transfer funds')
      }
      
      return response.data.data
    } catch (error) {
      console.error('Error transferring funds:', error)
      throw error
    }
  }

  // Hold funds for auction/order
  async holdFunds(amount: number, reference: string, description: string): Promise<{
    wallet: Wallet
    transaction: WalletTransaction
  }> {
    try {
      const response = await apiService.post<ApiResponse<{
        wallet: Wallet
        transaction: WalletTransaction
      }>>('/api/wallet/hold', {
        amount,
        reference,
        description
      })
      
      if (!response.data?.success || !response.data.data) {
        throw new Error(response.data?.error || 'Failed to hold funds')
      }
      
      return response.data.data
    } catch (error) {
      console.error('Error holding funds:', error)
      throw error
    }
  }

  // Release held funds
  async releaseFunds(amount: number, reference: string, description: string): Promise<{
    wallet: Wallet
    transaction: WalletTransaction
  }> {
    try {
      const response = await apiService.post<ApiResponse<{
        wallet: Wallet
        transaction: WalletTransaction
      }>>('/api/wallet/release', {
        amount,
        reference,
        description
      })
      
      if (!response.data?.success || !response.data.data) {
        throw new Error(response.data?.error || 'Failed to release funds')
      }
      
      return response.data.data
    } catch (error) {
      console.error('Error releasing funds:', error)
      throw error
    }
  }

  // Create escrow for an order
  async createEscrow(orderId: string, sellerId: string, amount: number): Promise<Escrow> {
    try {
      const response = await apiService.post<ApiResponse<{ escrow: Escrow }>>('/api/wallet/escrow/create', {
        orderId,
        sellerId,
        amount
      })
      
      if (!response.data?.success || !response.data.data?.escrow) {
        throw new Error(response.data?.error || 'Failed to create escrow')
      }
      
      return response.data.data.escrow
    } catch (error) {
      console.error('Error creating escrow:', error)
      throw error
    }
  }

  // Release escrow to seller
  async releaseEscrow(orderId: string, reason?: string): Promise<Escrow> {
    try {
      const response = await apiService.post<ApiResponse<{ escrow: Escrow }>>(
        `/api/wallet/escrow/${orderId}/release`,
        { reason }
      )
      
      if (!response.data?.success || !response.data.data?.escrow) {
        throw new Error(response.data?.error || 'Failed to release escrow')
      }
      
      return response.data.data.escrow
    } catch (error) {
      console.error('Error releasing escrow:', error)
      throw error
    }
  }

  // Refund escrow to buyer
  async refundEscrow(orderId: string, reason?: string): Promise<Escrow> {
    try {
      const response = await apiService.post<ApiResponse<{ escrow: Escrow }>>(
        `/api/wallet/escrow/${orderId}/refund`,
        { reason }
      )
      
      if (!response.data?.success || !response.data.data?.escrow) {
        throw new Error(response.data?.error || 'Failed to refund escrow')
      }
      
      return response.data.data.escrow
    } catch (error) {
      console.error('Error refunding escrow:', error)
      throw error
    }
  }

  // Get escrow status
  async getEscrowStatus(orderId: string): Promise<{
    escrow: Escrow
    order: any
  }> {
    try {
      const response = await apiService.get<ApiResponse<{
        escrow: Escrow
        order: any
      }>>(`/api/wallet/escrow/${orderId}`)
      
      if (!response.data?.success || !response.data.data) {
        throw new Error(response.data?.error || 'Failed to get escrow status')
      }
      
      return response.data.data
    } catch (error) {
      console.error('Error getting escrow status:', error)
      throw error
    }
  }

  // Get user's escrows
  async getUserEscrows(): Promise<Escrow[]> {
    try {
      const response = await apiService.get<ApiResponse<{ escrows: Escrow[] }>>('/api/wallet/escrows')
      
      if (!response.data?.success || !response.data.data?.escrows) {
        throw new Error(response.data?.error || 'Failed to get user escrows')
      }
      
      return response.data.data.escrows
    } catch (error) {
      console.error('Error getting user escrows:', error)
      throw error
    }
  }

  // Utility functions
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  formatTransactionType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'DEPOSIT': 'Deposit',
      'WITHDRAWAL': 'Withdrawal',
      'PURCHASE': 'Purchase',
      'REFUND': 'Refund',
      'AUCTION_HOLD': 'Auction Hold',
      'AUCTION_RELEASE': 'Auction Release',
      'SELLER_PAYOUT': 'Seller Payout',
      'PLATFORM_FEE': 'Platform Fee',
      'ESCROW_HOLD': 'Escrow Hold',
      'ESCROW_RELEASE': 'Escrow Release'
    }
    return typeMap[type] || type
  }

  getTransactionIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'DEPOSIT': '💳',
      'WITHDRAWAL': '🏦',
      'PURCHASE': '🛒',
      'REFUND': '↩️',
      'AUCTION_HOLD': '⏳',
      'AUCTION_RELEASE': '✅',
      'SELLER_PAYOUT': '💰',
      'PLATFORM_FEE': '🏢',
      'ESCROW_HOLD': '🔒',
      'ESCROW_RELEASE': '🔓'
    }
    return iconMap[type] || '💳'
  }

  getTransactionColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      'DEPOSIT': 'text-green-600',
      'SELLER_PAYOUT': 'text-green-600',
      'REFUND': 'text-green-600',
      'AUCTION_RELEASE': 'text-green-600',
      'ESCROW_RELEASE': 'text-green-600',
      'PURCHASE': 'text-red-600',
      'WITHDRAWAL': 'text-red-600',
      'AUCTION_HOLD': 'text-yellow-600',
      'PLATFORM_FEE': 'text-gray-600',
      'ESCROW_HOLD': 'text-blue-600'
    }
    return colorMap[type] || 'text-gray-600'
  }
}

export default new WalletService() 