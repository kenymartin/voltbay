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
      const response = await apiService.get('/payments/config')
      this.config = response.data.data

      if (!this.config?.publicKey) {
        throw new Error('Stripe public key not found')
      }

      // Load Stripe
      this.stripe = await loadStripe(this.config.publicKey)
      
      if (!this.stripe) {
        throw new Error('Failed to load Stripe')
      }

      console.log('Stripe initialized successfully')
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
      const response = await apiService.post('/payments/create-payment-intent', data)
      return response.data.data
    } catch (error: any) {
      console.error('Error creating payment intent:', error)
      throw new Error(error.response?.data?.error || 'Failed to create payment intent')
    }
  }

  // Process auction payment
  async processAuctionPayment(data: AuctionPaymentData): Promise<PaymentIntentResult> {
    try {
      const response = await apiService.post('/payments/auction-payment', data)
      return response.data.data
    } catch (error: any) {
      console.error('Error processing auction payment:', error)
      throw new Error(error.response?.data?.error || 'Failed to process auction payment')
    }
  }

  // Confirm payment after successful processing
  async confirmPayment(paymentIntentId: string): Promise<void> {
    try {
      await apiService.post('/payments/confirm-payment', { paymentIntentId })
    } catch (error: any) {
      console.error('Error confirming payment:', error)
      throw new Error(error.response?.data?.error || 'Failed to confirm payment')
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId: string) {
    try {
      const response = await apiService.get(`/payments/status/${paymentIntentId}`)
      return response.data.data
    } catch (error: any) {
      console.error('Error getting payment status:', error)
      throw new Error(error.response?.data?.error || 'Failed to get payment status')
    }
  }

  // Get auction payment status
  async getAuctionPaymentStatus(auctionId: string) {
    try {
      const response = await apiService.get(`/payments/auction/${auctionId}/status`)
      return response.data.data
    } catch (error: any) {
      console.error('Error getting auction payment status:', error)
      throw new Error(error.response?.data?.error || 'Failed to get auction payment status')
    }
  }

  // Get user payment history
  async getPaymentHistory() {
    try {
      const response = await apiService.get('/payments/history')
      return response.data.data
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