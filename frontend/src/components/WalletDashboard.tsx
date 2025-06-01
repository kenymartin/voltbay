import React, { useState, useEffect } from 'react'
import { Wallet, WalletStats, WalletTransaction } from '../types/wallet'
import WalletService from '../services/walletService'
import AddFundsModal from './AddFundsModal'
import TransferFundsModal from './TransferFundsModal'
import TransactionHistory from './TransactionHistory'

interface WalletDashboardProps {
  className?: string
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ className = '' }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showTransactions, setShowTransactions] = useState(false)

  const fetchWalletData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [walletData, statsData, transactionsData] = await Promise.all([
        WalletService.getWallet(),
        WalletService.getWalletStats(),
        WalletService.getTransactionHistory(1, 5)
      ])

      setWallet(walletData)
      setStats(statsData)
      setRecentTransactions(transactionsData.transactions)
    } catch (err) {
      console.error('Error fetching wallet data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  const handleAddFunds = () => {
    setShowAddFunds(true)
  }

  const handleTransfer = () => {
    setShowTransfer(true)
  }

  const handleFundsAdded = () => {
    setShowAddFunds(false)
    fetchWalletData() // Refresh wallet data
  }

  const handleTransferComplete = () => {
    setShowTransfer(false)
    fetchWalletData() // Refresh wallet data
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Wallet</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchWalletData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!wallet || !stats) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          No wallet data available
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Wallet</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleAddFunds}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            💳 Add Funds
          </button>
          <button
            onClick={handleTransfer}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            💸 Transfer
          </button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Balance</p>
              <p className="text-2xl font-bold">{WalletService.formatCurrency(wallet.balance)}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available</p>
              <p className="text-2xl font-bold">{WalletService.formatCurrency(wallet.availableBalance)}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        {/* Locked Balance */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Locked (Auctions)</p>
              <p className="text-2xl font-bold">{WalletService.formatCurrency(wallet.lockedBalance)}</p>
            </div>
            <div className="text-3xl">🔒</div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Wallet Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {WalletService.formatCurrency(stats.totalDeposits)}
            </p>
            <p className="text-sm text-gray-600">Total Deposited</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {WalletService.formatCurrency(stats.totalPurchases)}
            </p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.transactionCount}</p>
            <p className="text-sm text-gray-600">Transactions</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button
            onClick={() => setShowTransactions(true)}
            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
          >
            View All →
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💳</div>
            <p>No transactions yet</p>
            <p className="text-sm">Add funds to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {WalletService.getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {WalletService.formatTransactionType(transaction.type)}
                    </p>
                    <p className="text-sm text-gray-600">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className={`font-bold ${WalletService.getTransactionColor(transaction.type)}`}>
                  {transaction.amount >= 0 ? '+' : ''}
                  {WalletService.formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddFunds && (
        <AddFundsModal
          onClose={() => setShowAddFunds(false)}
          onSuccess={handleFundsAdded}
        />
      )}

      {showTransfer && (
        <TransferFundsModal
          onClose={() => setShowTransfer(false)}
          onSuccess={handleTransferComplete}
          availableBalance={wallet.availableBalance}
        />
      )}

      {showTransactions && (
        <TransactionHistory
          onClose={() => setShowTransactions(false)}
        />
      )}
    </div>
  )
}

export default WalletDashboard 