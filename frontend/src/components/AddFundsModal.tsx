import React, { useState } from 'react'
import { walletService } from '../services/walletService'
import WalletService from '../services/walletService'

interface AddFundsModalProps {
  onClose: () => void
  onSuccess: () => void
}

const AddFundsModal: React.FC<AddFundsModalProps> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'amount' | 'payment' | 'processing'>('amount')

  // Mock payment methods for demo
  const mockPaymentMethods = [
    { id: 'pm_1234', brand: 'visa', last4: '4242', expiry: '12/25' },
    { id: 'pm_5678', brand: 'mastercard', last4: '1234', expiry: '06/24' }
  ]

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amountNum = parseFloat(amount)
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (amountNum > 10000) {
      setError('Maximum deposit amount is $10,000')
      return
    }
    
    setError(null)
    setStep('payment')
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentMethod) {
      setError('Please select a payment method')
      return
    }

    setLoading(true)
    setError(null)
    setStep('processing')

    try {
      await walletService.addFunds({
        amount: parseFloat(amount),
        paymentMethodId: paymentMethod,
        description: description || 'Wallet top-up'
      })
      
      onSuccess()
    } catch (err: any) {
      console.error('Add funds error:', err)
      
      // Handle verification error specifically
      if (err.response?.status === 403 && err.response?.data?.error === 'VERIFICATION_REQUIRED') {
        setError('Email verification required to add funds. Please verify your email address.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to add funds')
      }
      setStep('payment')
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-90vh overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Funds to Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'amount' && (
            <form onSubmit={handleAmountSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Add
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="10000"
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
                  <p className="mt-2 text-sm text-gray-600">
                    You will add {formatAmount(amount)} to your wallet
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., For auction bidding"
                  maxLength={255}
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Quick Amounts</p>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 100, 250].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
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
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💰</span>
                    <div>
                      <p className="font-medium text-blue-900">Adding {formatAmount(amount)}</p>
                      <p className="text-sm text-blue-700">{description || 'Wallet top-up'}</p>
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="space-y-2">
                  {mockPaymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        paymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-2xl">
                          {method.brand === 'visa' ? '💳' : '💳'}
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {method.brand} ••••{method.last4}
                          </p>
                          <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                        </div>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="text-blue-500">✓</div>
                      )}
                    </label>
                  ))}
                  
                  <button
                    type="button"
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                  >
                    + Add New Payment Method
                  </button>
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
                  onClick={() => setStep('amount')}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg font-medium"
                >
                  {loading ? 'Processing...' : `Add ${formatAmount(amount)}`}
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Adding {formatAmount(amount)} to your wallet...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddFundsModal 