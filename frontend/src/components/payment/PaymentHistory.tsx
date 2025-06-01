import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { paymentService } from '../../services/paymentService'
import { toast } from 'react-toastify'

interface Payment {
  id: string
  amount: number
  status: string
  description: string
  createdAt: string
  paidAt?: string
  product?: {
    id: string
    title: string
    imageUrls: string[]
  }
  orderId?: string
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPaymentHistory()
  }, [])

  const loadPaymentHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const history = await paymentService.getPaymentHistory()
      setPayments(history)
    } catch (error: any) {
      setError(error.message)
      toast.error('Failed to load payment history')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SUCCEEDED: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      PROCESSING: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      FAILED: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
      REFUNDED: { color: 'bg-purple-100 text-purple-800', label: 'Refunded' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy • h:mm a')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading payment history...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">
          <p>Failed to load payment history</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={loadPaymentHistory}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h3 className="text-lg font-medium">No Payment History</h3>
          <p>You haven't made any payments yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment History</h2>
        <button
          onClick={loadPaymentHistory}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {payment.product?.imageUrls?.[0] && (
                    <img
                      src={payment.product.imageUrls[0]}
                      alt={payment.product.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">
                      {payment.product?.title || payment.description}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Payment ID: {payment.id}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-lg">
                      {paymentService.formatCurrency(payment.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                </div>

                {payment.paidAt && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Completed: {formatDate(payment.paidAt)}</p>
                  </div>
                )}
              </div>

              <div className="ml-4">
                {payment.orderId && (
                  <button
                    onClick={() => {
                      // Navigate to order details
                      window.location.href = `/orders/${payment.orderId}`
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Order
                  </button>
                )}
              </div>
            </div>

            {/* Additional payment details for failed/cancelled payments */}
            {(payment.status === 'FAILED' || payment.status === 'CANCELLED') && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">
                  {payment.status === 'FAILED' 
                    ? 'This payment failed to process. Please try again or contact support.'
                    : 'This payment was cancelled.'
                  }
                </p>
                {payment.status === 'FAILED' && payment.product && (
                  <button
                    onClick={() => {
                      // Navigate back to product to retry payment
                      window.location.href = `/products/${payment.product!.id}`
                    }}
                    className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium underline"
                  >
                    Try Payment Again
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {payments.filter(p => p.status === 'SUCCEEDED').length}
            </p>
            <p className="text-sm text-gray-600">Successful Payments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {paymentService.formatCurrency(
                payments
                  .filter(p => p.status === 'SUCCEEDED')
                  .reduce((sum, p) => sum + p.amount, 0)
              )}
            </p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING').length}
            </p>
            <p className="text-sm text-gray-600">Pending Payments</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentHistory 