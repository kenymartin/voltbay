import { loadStripe, Stripe } from '@stripe/stripe-js'
import apiService from './api'

export interface PaymentIntentData {
  productId: string
  amount: number
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface AuctionPaymentData {
  auctionId: string
  winnerId: string
  winningBid: number
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface PaymentConfig {
  publicKey: string
  minimumAmount: number
  currency: string
  platformFeePercentage: number
}

export interface PaymentIntentResult {
  paymentIntentId: string
  clientSecret: string
  orderId: string
}

class PaymentService {
  private stripe: Stripe | null = null
  private config: PaymentConfig | null = null

  // Initialize Stripe with public key
  async initialize(): Promise<void> {
    try {
      // Get Stripe configuration from backend  
      const response = await apiService.get('/api/payments/config')
      this.config = (response as any).data

      if (!this.config?.publicKey) {
        throw new Error('Stripe public key not found')
      }

      // Check if we're in a secure context (HTTPS or localhost)
      const isSecureContext = window.isSecureContext || 
                             window.location.protocol === 'https:' || 
                             window.location.hostname === 'localhost' ||
                             window.location.hostname === '127.0.0.1'

      // In development, allow both HTTP and HTTPS
      const isDevelopmentMode = process.env.NODE_ENV === 'development'
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

      // Load Stripe with development-friendly options
      const stripeOptions: any = {
        // Force Stripe to work in development with self-signed certs
        ...(isDevelopmentMode && {
          // These options help with development environments
          locale: 'en'
        })
      }

      this.stripe = await loadStripe(this.config.publicKey, stripeOptions)
      
      if (!this.stripe) {
        throw new Error('Failed to load Stripe')
      }

      console.log('✅ Stripe initialized successfully')
      
      // Log connection security status
      if (isSecureContext) {
        console.log('🔒 Secure context detected - Stripe functionality available')
        if (window.location.protocol === 'https:' && isLocalhost) {
          console.log('🔧 Development HTTPS mode - Using self-signed certificate')
        }
      } else if (isDevelopmentMode && isLocalhost) {
        console.log('🔧 Development HTTP mode - Limited Stripe functionality')
        console.log('💡 Some features may be restricted. For full functionality, use HTTPS')
      } else {
        console.warn('⚠️ Insecure context detected - Some Stripe features may be limited')
        console.log('💡 For full functionality, use HTTPS: https://localhost:3000')
      }
      
    } catch (error) {
      console.error('Error initializing Stripe:', error)
      throw error
    }
  }

  // Get Stripe instance
  getStripe(): Stripe | null {
    return this.stripe
  }

  // Get payment configuration
  getConfig(): PaymentConfig | null {
    return this.config
  }

  // Create payment intent for direct purchase
  async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntentResult> {
    try {
      console.log('🔧 Creating payment intent with data:', data)
      const response = await apiService.post('/api/payments/create-payment-intent', data)
      console.log('🔧 Raw payment response:', response)
      
      // Handle different response structures
      const result = (response as any).data?.data || (response as any).data || response
      console.log('🔧 Extracted result:', result)
      
      if (!result) {
        throw new Error('No payment intent data received from server')
      }
      
      if (!result.paymentIntentId || !result.clientSecret || !result.orderId) {
        console.error('🔧 Invalid payment intent structure:', result)
        throw new Error('Invalid payment intent response structure')
      }
      
      return result
    } catch (error: any) {
      console.error('🔧 Error creating payment intent:', error)
      console.error('🔧 Error response:', error.response?.data)
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.')
      }
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Invalid request data'
        throw new Error(errorMessage)
      }
      
      // Handle server errors
      if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      }
      
      throw new Error(error.response?.data?.error || error.message || 'Failed to create payment intent')
    }
  }

  // Process auction payment
  async processAuctionPayment(data: AuctionPaymentData): Promise<PaymentIntentResult> {
    try {
      const response = await apiService.post('/api/payments/auction-payment', data)
      return (response as any).data.data
    } catch (error: any) {
      console.error('Error processing auction payment:', error)
      throw new Error(error.response?.data?.error || 'Failed to process auction payment')
    }
  }

  // Confirm payment after successful processing
  async confirmPayment(paymentIntentId: string): Promise<void> {
    try {
      await apiService.post('/api/payments/confirm-payment', { paymentIntentId })
    } catch (error: any) {
      console.error('Error confirming payment:', error)
      throw new Error(error.response?.data?.error || 'Failed to confirm payment')
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId: string) {
    try {
      const response = await apiService.get(`/api/payments/status/${paymentIntentId}`)
      return (response as any).data.data
    } catch (error: any) {
      console.error('Error getting payment status:', error)
      throw new Error(error.response?.data?.error || 'Failed to get payment status')
    }
  }

  // Get auction payment status
  async getAuctionPaymentStatus(auctionId: string) {
    try {
      const response = await apiService.get(`/api/payments/auction/${auctionId}/status`)
      return (response as any).data.data
    } catch (error: any) {
      console.error('Error getting auction payment status:', error)
      throw new Error(error.response?.data?.error || 'Failed to get auction payment status')
    }
  }

  // Get user payment history
  async getPaymentHistory() {
    try {
      const response = await apiService.get('/api/payments/history')
      return (response as any).data.data
    } catch (error: any) {
      console.error('Error getting payment history:', error)
      throw new Error(error.response?.data?.error || 'Failed to get payment history')
    }
  }

  // Calculate platform fee
  calculatePlatformFee(amount: number): number {
    if (!this.config) return 0
    return Math.round(amount * this.config.platformFeePercentage * 100) / 100
  }

  // Calculate seller amount after fees
  calculateSellerAmount(amount: number): number {
    const platformFee = this.calculatePlatformFee(amount)
    return Math.round((amount - platformFee) * 100) / 100
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  // Validate minimum amount
  validateAmount(amount: number): boolean {
    if (!this.config) return false
    return amount >= this.config.minimumAmount
  }

  // Get minimum amount error message
  getMinimumAmountError(): string {
    if (!this.config) return 'Payment configuration not loaded'
    return `Minimum payment amount is ${this.formatCurrency(this.config.minimumAmount)}`
  }
}

// Export singleton instance
export const paymentService = new PaymentService()
export default paymentService 