import React, { useState, useEffect } from 'react'
import {
  useStripe,
  useElements,
  CardElement,
  Elements
} from '@stripe/react-stripe-js'
import { toast } from 'react-toastify'
import { paymentService, AuctionPaymentData } from '../../services/paymentService'

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
}

interface AuctionPaymentFormProps {
  auctionData: AuctionPaymentData
  auctionTitle: string
  onSuccess: (orderId: string) => void
  onError: (error: string) => void
  loading?: boolean
}

const AuctionPaymentFormContent: React.FC<AuctionPaymentFormProps> = ({
  auctionData,
  auctionTitle,
  onSuccess,
  onError,
  loading = false
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState<any>(null)

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const result = await paymentService.processAuctionPayment(auctionData)
        setPaymentIntent(result)
      } catch (error: any) {
        onError(error.message)
      }
    }

    createPaymentIntent()
  }, [auctionData, onError])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !paymentIntent) {
      return
    }

    setProcessing(true)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      onError('Card element not found')
      setProcessing(false)
      return
    }

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      )

      if (error) {
        onError(error.message || 'Payment failed')
      } else if (confirmedPaymentIntent?.status === 'succeeded') {
        // Confirm payment with backend
        await paymentService.confirmPayment(confirmedPaymentIntent.id)
        onSuccess(paymentIntent.orderId)
        toast.success('Auction payment successful! 🎉')
      }
    } catch (error: any) {
      onError(error.message || 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const config = paymentService.getConfig()
  const platformFee = config ? paymentService.calculatePlatformFee(auctionData.winningBid) : 0
  const sellerAmount = config ? paymentService.calculateSellerAmount(auctionData.winningBid) : auctionData.winningBid

  return (
    <div className="max-w-2xl mx-auto">
      {/* Auction Winner Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">🎉 Congratulations!</h2>
          <p className="text-lg">You won the auction for:</p>
          <h3 className="text-xl font-semibold mt-2">{auctionTitle}</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-b-lg shadow-lg space-y-6">
        {/* Auction Summary */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-yellow-800">Auction Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Winning Bid:</span>
              <span className="text-xl font-bold text-green-600">
                {paymentService.formatCurrency(auctionData.winningBid)}
              </span>
            </div>
            {platformFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee ({(config?.platformFeePercentage || 0) * 100}%):</span>
                <span>{paymentService.formatCurrency(platformFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Seller Receives:</span>
              <span>{paymentService.formatCurrency(sellerAmount)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Payment:</span>
              <span>{paymentService.formatCurrency(auctionData.winningBid)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address Display */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
          <div className="text-sm space-y-1">
            <p>{auctionData.shippingAddress.street}</p>
            <p>
              {auctionData.shippingAddress.city}, {auctionData.shippingAddress.state} {auctionData.shippingAddress.zipCode}
            </p>
            <p>{auctionData.shippingAddress.country}</p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Information</h3>
          <div className="p-4 border border-gray-300 rounded-lg">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-2">⚠️ Important Notice</h4>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Payment must be completed within 24 hours of auction end</li>
            <li>• Your payment will be held securely until item delivery</li>
            <li>• Seller will be notified once payment is confirmed</li>
            <li>• You will receive tracking information once item ships</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || processing || loading || !paymentIntent}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-colors ${
            !stripe || processing || loading || !paymentIntent
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
          }`}
        >
          {processing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Processing Auction Payment...
            </div>
          ) : (
            `Complete Auction Payment - ${paymentService.formatCurrency(auctionData.winningBid)}`
          )}
        </button>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 text-center">
          <p>🔒 Your payment information is secure and encrypted</p>
          <p>Powered by Stripe • VoltBay Escrow Protection</p>
        </div>
      </form>
    </div>
  )
}

// Main component with Stripe Elements provider
const AuctionPaymentForm: React.FC<AuctionPaymentFormProps> = (props) => {
  const [stripePromise, setStripePromise] = useState<any>(null)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        await paymentService.initialize()
        const stripe = paymentService.getStripe()
        setStripePromise(Promise.resolve(stripe))
      } catch (error) {
        console.error('Failed to initialize Stripe:', error)
        props.onError('Failed to initialize payment system')
      }
    }

    initializeStripe()
  }, [props])

  if (!stripePromise) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading auction payment system...</span>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <AuctionPaymentFormContent {...props} />
    </Elements>
  )
}

export default AuctionPaymentForm 