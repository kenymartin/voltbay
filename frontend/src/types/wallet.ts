export interface Wallet {
  id: string
  balance: number
  lockedBalance: number
  availableBalance: number
  createdAt: string
  updatedAt: string
}

export interface WalletTransaction {
  id: string
  type: TransactionType
  amount: number
  status: TransactionStatus
  description: string
  reference?: string
  createdAt: string
  updatedAt: string
}

export interface WalletStats {
  balance: number
  lockedBalance: number
  availableBalance: number
  totalDeposits: number
  totalPurchases: number
  transactionCount: number
}

export interface Escrow {
  id: string
  orderId: string
  amount: number
  status: TransactionStatus
  reason?: string
  createdAt: string
  releasedAt?: string
  userRole: 'buyer' | 'seller'
  order?: {
    id: string
    status: string
    product: {
      id: string
      title: string
    }
    buyer: {
      id: string
      email: string
      name: string
    }
    seller: {
      id: string
      email: string
      name: string
    }
  }
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PURCHASE = 'PURCHASE',
  REFUND = 'REFUND',
  AUCTION_HOLD = 'AUCTION_HOLD',
  AUCTION_RELEASE = 'AUCTION_RELEASE',
  SELLER_PAYOUT = 'SELLER_PAYOUT',
  PLATFORM_FEE = 'PLATFORM_FEE',
  ESCROW_HOLD = 'ESCROW_HOLD',
  ESCROW_RELEASE = 'ESCROW_RELEASE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface AddFundsData {
  amount: number
  paymentMethodId: string
  description?: string
}

export interface TransferFundsData {
  toUserId: string
  amount: number
  description: string
  reference?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
} 