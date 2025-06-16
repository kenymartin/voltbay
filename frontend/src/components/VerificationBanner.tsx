import { useState } from 'react'
import { X, Mail, AlertTriangle, CheckCircle, Package, Gavel, Wallet } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../store/authStore'
import apiService from '../services/api'

interface VerificationBannerProps {
  context?: 'general' | 'selling' | 'bidding' | 'wallet' | 'checkout'
  onClose?: () => void
}

export default function VerificationBanner({ context = 'general', onClose }: VerificationBannerProps) {
  const { user, refreshUserProfile } = useAuthStore()
  const [dismissed, setDismissed] = useState(false)
  const [resending, setResending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Don't show if user is verified or banner is dismissed
  if (!user || user.verified || dismissed) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    onClose?.()
  }

  const handleResendVerification = async () => {
    if (!user?.email) return
    
    setResending(true)
    try {
      await apiService.authPost('/api/auth/resend-verification', { email: user.email })
      toast.success('Verification email sent! Please check your inbox.')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send verification email'
      toast.error(message)
    } finally {
      setResending(false)
    }
  }

  const handleRefreshStatus = async () => {
    setRefreshing(true)
    try {
      await refreshUserProfile()
      toast.success('Status refreshed!')
    } catch (error) {
      toast.error('Failed to refresh status')
    } finally {
      setRefreshing(false)
    }
  }

  const getContextContent = () => {
    switch (context) {
      case 'selling':
        return {
          icon: Package,
          title: 'Verify Your Email to Start Selling',
          description: 'You need to verify your email address before you can create product listings or sell items on VoltBay.',
          features: [
            'Create unlimited product listings',
            'List items for auction',
            'Receive payments from buyers',
            'Access seller dashboard'
          ]
        }
      
      case 'bidding':
        return {
          icon: Gavel,
          title: 'Verify Your Email to Place Bids',
          description: 'Email verification is required to participate in auctions and place bids on items.',
          features: [
            'Place bids on auction items',
            'Participate in live auctions',
            'Receive bid notifications',
            'Win auction items'
          ]
        }
      
      case 'wallet':
        return {
          icon: Wallet,
          title: 'Verify Your Email for Wallet Features',
          description: 'Verify your email to unlock full wallet functionality and financial transactions.',
          features: [
            'Add funds to your wallet',
            'Transfer money to other users',
            'Make instant payments',
            'Access transaction history'
          ]
        }
      
      case 'checkout':
        return {
          icon: CheckCircle,
          title: 'Verify Your Email to Complete Purchase',
          description: 'Email verification is required to make purchases and complete transactions.',
          features: [
            'Purchase products instantly',
            'Secure payment processing',
            'Order tracking and updates',
            'Buyer protection'
          ]
        }
      
      default:
        return {
          icon: Mail,
          title: 'Verify Your Email Address',
          description: 'Get full access to VoltBay by verifying your email address. Many features are limited for unverified accounts.',
          features: [
            'Create and sell products',
            'Place bids on auctions',
            'Use wallet features',
            'Make purchases over $50'
          ]
        }
    }
  }

  const content = getContextContent()
  const Icon = content.icon

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Icon className="w-5 h-5 text-yellow-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                {content.title}
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                {content.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {content.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-yellow-700">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
                
                <button
                  onClick={handleRefreshStatus}
                  disabled={refreshing}
                  className="inline-flex items-center px-3 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {refreshing ? 'Checking...' : 'Check Status'}
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="inline-flex items-center px-3 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-4 text-yellow-400 hover:text-yellow-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 