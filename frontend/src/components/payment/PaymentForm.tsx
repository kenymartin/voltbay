import React, { useState, useEffect } from 'react'
import {
  useStripe,
  useElements,
  CardElement,
  Elements
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { toast } from 'react-toastify'
import { paymentService, PaymentIntentData } from '../../services/paymentService'

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

interface PaymentFormProps {
  paymentData: PaymentIntentData
  onSuccess: (orderId: string) => void
  onError: (error: string) => void
  loading?: boolean
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({
  paymentData,
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
        const result = await paymentService.createPaymentIntent(paymentData)
        setPaymentIntent(result)
      } catch (error: any) {
        onError(error.message)
      }
    }

    createPaymentIntent()
  }, [paymentData, onError])

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
        toast.success('Payment successful!')
      }
    } catch (error: any) {
      onError(error.message || 'Payment processing failed')
    } finally {
      setProcessing(false)
    }
  }

  const config = paymentService.getConfig()
  const platformFee = config ? paymentService.calculatePlatformFee(paymentData.amount) : 0
  const sellerAmount = config ? paymentService.calculateSellerAmount(paymentData.amount) : paymentData.amount

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Item Total:</span>
            <span>{paymentService.formatCurrency(paymentData.amount)}</span>
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
            <span>Total:</span>
            <span>{paymentService.formatCurrency(paymentData.amount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address Display */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
        <div className="text-sm space-y-1">
          <p>{paymentData.shippingAddress.street}</p>
          <p>
            {paymentData.shippingAddress.city}, {paymentData.shippingAddress.state} {paymentData.shippingAddress.zipCode}
          </p>
          <p>{paymentData.shippingAddress.country}</p>
        </div>
      </div>

      {/* Card Input */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Information</h3>
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing || loading || !paymentIntent}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          !stripe || processing || loading || !paymentIntent
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay ${paymentService.formatCurrency(paymentData.amount)}`
        )}
      </button>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 text-center">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p>Powered by Stripe</p>
      </div>
    </form>
  )
}

// Main component with Stripe Elements provider
const PaymentForm: React.FC<PaymentFormProps> = (props) => {
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
        <span className="ml-2">Loading payment system...</span>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  )
}

export default PaymentForm 