import React, { useState, useEffect } from 'react'
import { WalletTransaction, TransactionType, TransactionStatus } from '../types/wallet'
import { walletService, TransactionHistoryResponse } from '../services/walletService'
import WalletService from '../services/walletService'

interface TransactionHistoryProps {
  onClose: () => void
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onClose }) => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response: TransactionHistoryResponse = await walletService.getTransactionHistory(page, 20)
      
      let filteredTransactions = response.transactions
      
      // Apply filters
      if (filterType !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === filterType)
      }
      
      if (filterStatus !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.status === filterStatus)
      }
      
      setTransactions(filteredTransactions)
      setTotalPages(response.pagination.totalPages)
      setCurrentPage(response.pagination.page)
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions(1)
  }, [filterType, filterStatus])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchTransactions(page)
    }
  }

  const getStatusBadge = (status: TransactionStatus) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-90vh overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value={TransactionType.DEPOSIT}>Deposits</option>
                <option value={TransactionType.WITHDRAWAL}>Withdrawals</option>
                <option value={TransactionType.PURCHASE}>Purchases</option>
                <option value={TransactionType.REFUND}>Refunds</option>
                <option value={TransactionType.AUCTION_HOLD}>Auction Holds</option>
                <option value={TransactionType.AUCTION_RELEASE}>Auction Releases</option>
                <option value={TransactionType.SELLER_PAYOUT}>Seller Payouts</option>
                <option value={TransactionType.ESCROW_HOLD}>Escrow Holds</option>
                <option value={TransactionType.ESCROW_RELEASE}>Escrow Releases</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value={TransactionStatus.PENDING}>Pending</option>
                <option value={TransactionStatus.COMPLETED}>Completed</option>
                <option value={TransactionStatus.FAILED}>Failed</option>
                <option value={TransactionStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '60vh' }}>
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => fetchTransactions(currentPage)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Found</h3>
              <p className="text-gray-600">
                {filterType !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your filters to see more transactions.'
                  : 'Your transaction history will appear here.'}
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {transactions.map((transaction) => {
                  const { date, time } = formatDate(transaction.createdAt)
                  const isCredit = transaction.amount >= 0
                  
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {WalletService.getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {WalletService.formatTransactionType(transaction.type)}
                            </h4>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{transaction.description}</p>
                          <div className="text-xs text-gray-500">
                            {date} at {time}
                            {transaction.reference && (
                              <span className="ml-2">• Ref: {transaction.reference}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`font-bold text-lg ${WalletService.getTransactionColor(transaction.type)}`}>
                          {isCredit ? '+' : ''}
                          {WalletService.formatCurrency(Math.abs(transaction.amount))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && !error && transactions.length > 0 && totalPages > 1 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNumber = Math.max(1, currentPage - 2) + i
                    if (pageNumber <= totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-2 border rounded-lg text-sm ${
                            pageNumber === currentPage
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    }
                    return null
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionHistory 