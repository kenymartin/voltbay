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

// Test card numbers for development
const TEST_CARDS = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  declined: '4000000000000002'
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
  const [creatingIntent, setCreatingIntent] = useState(false)

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async (retryCount = 0) => {
      try {
        setCreatingIntent(true)
        console.log('Creating payment intent with data:', paymentData)
        const result = await paymentService.createPaymentIntent(paymentData)
        console.log('Payment intent created successfully:', result)
        
        if (!result) {
          throw new Error('No payment intent data received')
        }
        
        setPaymentIntent(result)
      } catch (error: any) {
        console.error('Error creating payment intent:', error)
        
        // Handle authentication errors with retry
        if (error.message?.includes('Authentication required') || error.message?.includes('Unauthorized')) {
          if (retryCount < 2) {
            console.log('🔧 Retrying payment intent creation after auth error...')
            // Wait a bit for token refresh to complete
            setTimeout(() => createPaymentIntent(retryCount + 1), 2000)
            return
          } else {
            onError('Your session has expired. Please log in again.')
          }
        } else if (error.message?.includes('productId')) {
          onError('Invalid product information. Please try again.')
        } else {
          onError(error.message || 'Failed to initialize payment. Please try again.')
        }
      } finally {
        setCreatingIntent(false)
      }
    }

    // Only create payment intent if we have valid payment data
    if (paymentData && paymentData.productId && paymentData.amount > 0) {
      createPaymentIntent()
    } else {
      onError('Invalid payment data. Please go back and try again.')
    }
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

  // Check if running in secure context or development mode
  const isSecureContext = window.isSecureContext || 
                          window.location.protocol === 'https:' || 
                          window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1'
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isHttpsLocalhost = window.location.protocol === 'https:' && window.location.hostname === 'localhost'
  const isHttpLocalhost = window.location.protocol === 'http:' && window.location.hostname === 'localhost'

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

      {/* Development HTTPS Warning */}
      {isHttpsLocalhost && isDevelopment && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Development Mode - HTTPS</h4>
              <p className="text-sm text-blue-700 mt-1">
                Using self-signed certificate. Use test card numbers below:
              </p>
              <div className="mt-2 text-xs text-blue-600">
                <div><strong>Visa:</strong> 4242 4242 4242 4242</div>
                <div><strong>Mastercard:</strong> 5555 5555 5555 4444</div>
                <div><strong>Any future date, any 3-digit CVC</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Development HTTP Warning */}
      {isHttpLocalhost && isDevelopment && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Development Mode - HTTP</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Running on HTTP. Some browser features may be limited. Use test card numbers:
              </p>
              <div className="mt-2 text-xs text-yellow-600">
                <div><strong>Visa:</strong> 4242 4242 4242 4242</div>
                <div><strong>Mastercard:</strong> 5555 5555 5555 4444</div>
                <div><strong>Any future date, any 3-digit CVC</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insecure Connection Warning */}
      {!isSecureContext && !isDevelopment && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">Insecure Connection</h4>
              <p className="text-sm text-red-700 mt-1">
                Payment processing requires a secure connection. Please use HTTPS.
              </p>
              <p className="text-xs text-red-600 mt-1">
                Visit: <strong>https://localhost:3000</strong>
              </p>
            </div>
          </div>
        </div>
      )}

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
        disabled={!stripe || processing || loading || !paymentIntent || creatingIntent}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          !stripe || processing || loading || !paymentIntent || creatingIntent
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : creatingIntent ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Initializing Payment...
          </div>
        ) : !stripe ? (
          'Loading Stripe...'
        ) : !paymentIntent ? (
          'Preparing Payment...'
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
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        await paymentService.initialize()
        const stripe = paymentService.getStripe()
        // Create a stable promise that won't change
        const stablePromise = Promise.resolve(stripe)
        setStripePromise(stablePromise)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize Stripe:', error)
        props.onError('Failed to initialize payment system')
      }
    }

    // Only initialize once
    if (!isInitialized) {
      initializeStripe()
    }
  }, [isInitialized, props])

  if (!stripePromise || !isInitialized) {
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