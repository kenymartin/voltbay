import React, { useState } from 'react'
import WalletService from '../services/walletService'

interface TransferFundsModalProps {
  onClose: () => void
  onSuccess: () => void
  availableBalance: number
}

const TransferFundsModal: React.FC<TransferFundsModalProps> = ({
  onClose,
  onSuccess,
  availableBalance
}) => {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'form' | 'confirm' | 'processing'>('form')

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    
    if (!recipient.trim()) {
      setError('Please enter recipient email')
      return
    }
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (amountNum > availableBalance) {
      setError('Insufficient funds available')
      return
    }
    
    if (!description.trim()) {
      setError('Please enter a description')
      return
    }
    
    setError(null)
    setStep('confirm')
  }

  const handleConfirmTransfer = async () => {
    setLoading(true)
    setError(null)
    setStep('processing')

    try {
      // For demo purposes, we'll use a mock user ID
      // In real implementation, you'd need to find user by email first
      const mockUserId = 'mock-user-id'
      
      await WalletService.transferFunds({
        toUserId: mockUserId,
        amount: parseFloat(amount),
        description: description
      })
      
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed')
      setStep('confirm')
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (value: string) => {
    const num = parseFloat(value)
    return isNaN(num) ? '$0.00' : WalletService.formatCurrency(num)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Transfer Funds</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-blue-800">
                    <span className="text-lg mr-2">💰</span>
                    <span className="text-sm">
                      Available Balance: {WalletService.formatCurrency(availableBalance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={availableBalance}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500 text-lg">$</span>
                  </div>
                </div>
                {amount && (
                  <p className="mt-1 text-sm text-gray-600">
                    Transferring {formatAmount(amount)}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Payment for services"
                  maxLength={255}
                  required
                />
              </div>

              {/* Quick Amounts */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Quick Amounts</p>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => setAmount(quickAmount.toString())}
                      disabled={quickAmount > availableBalance}
                      className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ${quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                >
                  Review Transfer
                </button>
              </div>
            </form>
          )}

          {step === 'confirm' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Transfer</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">To:</span>
                    <span className="font-medium">{recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-lg">{formatAmount(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium">{description}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-gray-600">Remaining Balance:</span>
                    <span className="font-medium">
                      {WalletService.formatCurrency(availableBalance - parseFloat(amount))}
                    </span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <div className="flex">
                    <span className="text-yellow-600 mr-2">⚠️</span>
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Important</p>
                      <p className="text-sm text-yellow-700">
                        This transfer cannot be undone. Please verify the recipient email is correct.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmTransfer}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-medium"
                >
                  {loading ? 'Processing...' : 'Confirm Transfer'}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Transfer</h3>
              <p className="text-gray-600">Sending {formatAmount(amount)} to {recipient}...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransferFundsModal 