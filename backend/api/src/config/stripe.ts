// Temporary mock implementation without Stripe dependency
// import Stripe from 'stripe'

// Mock Stripe types and classes for development
interface MockPaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded'
  client_secret: string
  metadata?: Record<string, string>
}

interface MockCustomer {
  id: string
  email?: string
  metadata?: Record<string, string>
}

class MockStripe {
  paymentIntents = {
    create: async (params: any): Promise<MockPaymentIntent> => {
      console.log('Mock Stripe: Creating payment intent', params)
      return {
        id: `pi_mock_${Date.now()}`,
        amount: params.amount,
        currency: params.currency || 'usd',
        status: 'requires_payment_method',
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        metadata: params.metadata
      }
    },
    retrieve: async (id: string): Promise<MockPaymentIntent> => {
      console.log('Mock Stripe: Retrieving payment intent', id)
      return {
        id,
        amount: 1000,
        currency: 'usd',
        status: 'succeeded',
        client_secret: `${id}_secret_mock`
      }
    },
    confirm: async (id: string, params?: any): Promise<MockPaymentIntent> => {
      console.log('Mock Stripe: Confirming payment intent', id, params)
      return {
        id,
        amount: 1000,
        currency: 'usd',
        status: 'succeeded',
        client_secret: `${id}_secret_mock`
      }
    }
  }

  customers = {
    create: async (params: any): Promise<MockCustomer> => {
      console.log('Mock Stripe: Creating customer', params)
      return {
        id: `cus_mock_${Date.now()}`,
        email: params.email,
        metadata: params.metadata
      }
    },
    retrieve: async (id: string): Promise<MockCustomer> => {
      console.log('Mock Stripe: Retrieving customer', id)
      return {
        id,
        email: 'mock@example.com'
      }
    }
  }

  webhooks = {
    constructEvent: (payload: any, signature: string, secret: string) => {
      console.log('Mock Stripe: Constructing webhook event')
      return {
        id: `evt_mock_${Date.now()}`,
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_mock_123',
            status: 'succeeded'
          }
        }
      }
    }
  }
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found, using mock Stripe implementation')
}

// Initialize mock Stripe
export const stripe = new MockStripe() as any

// Stripe configuration constants
export const STRIPE_CONFIG = {
  // Platform fee percentage (e.g., 2.5% = 0.025)
  PLATFORM_FEE_PERCENTAGE: Number(process.env.PLATFORM_FEE_PERCENTAGE) || 0.025,
  
  // Minimum charge amount in cents ($0.50)
  MINIMUM_CHARGE_AMOUNT: 50,
  
  // Default currency
  DEFAULT_CURRENCY: 'usd',
  
  // Webhook endpoint secret
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Application fee (fixed amount in cents)
  APPLICATION_FEE: Number(process.env.STRIPE_APPLICATION_FEE) || 0,
  
  // Connect account onboarding
  CONNECT_REFRESH_URL: process.env.FRONTEND_URL + '/seller/onboarding/refresh',
  CONNECT_RETURN_URL: process.env.FRONTEND_URL + '/seller/onboarding/complete',
} as const

// Stripe error handling helper
export const handleStripeError = (error: any): string => {
  if (error.type === 'StripeCardError') {
    return `Card error: ${error.message}`
  } else if (error.type === 'StripeRateLimitError') {
    return 'Too many requests made to Stripe API'
  } else if (error.type === 'StripeInvalidRequestError') {
    return `Invalid request: ${error.message}`
  } else if (error.type === 'StripeAPIError') {
    return 'Stripe API error occurred'
  } else if (error.type === 'StripeConnectionError') {
    return 'Network error connecting to Stripe'
  } else if (error.type === 'StripeAuthenticationError') {
    return 'Authentication error with Stripe'
  } else {
    return 'An unknown payment error occurred'
  }
}

// Calculate platform fee
export const calculatePlatformFee = (amount: number): number => {
  return Math.round(amount * STRIPE_CONFIG.PLATFORM_FEE_PERCENTAGE)
}

// Calculate seller amount after fees
export const calculateSellerAmount = (amount: number, stripeFee: number, platformFee: number): number => {
  return amount - stripeFee - platformFee
}

export default stripe 