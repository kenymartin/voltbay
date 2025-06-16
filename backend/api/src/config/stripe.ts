import Stripe from 'stripe'

// Check if we have Stripe keys
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

if (!process.env.STRIPE_PUBLISHABLE_KEY) {
  throw new Error('STRIPE_PUBLISHABLE_KEY is required')
}

// Initialize real Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
  typescript: true,
})

console.log('✅ Stripe initialized with real API keys')

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
  
  // Publishable key for frontend
  PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
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