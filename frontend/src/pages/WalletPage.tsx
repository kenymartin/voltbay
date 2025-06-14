import React from 'react'
import { useAuthStore } from '../store/authStore'
import WalletDashboard from '../components/WalletDashboard'

const WalletPage: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
                <p className="text-gray-600 mt-1">
                  Manage your funds, view transaction history, and transfer money securely
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl">💳</div>
                  <div className="text-gray-600">Instant</div>
                  <div className="text-gray-600">Payments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">🔒</div>
                  <div className="text-gray-600">Secure</div>
                  <div className="text-gray-600">Escrow</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">⚡</div>
                  <div className="text-gray-600">Fast</div>
                  <div className="text-gray-600">Transfers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Wallet Dashboard */}
          <div className="lg:col-span-3">
            <WalletDashboard />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/auctions"
                  className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="text-2xl mr-3">🔨</span>
                  <div>
                    <p className="font-medium text-blue-900">Browse Auctions</p>
                    <p className="text-sm text-blue-700">Find items to bid on</p>
                  </div>
                </a>
                
                <a
                  href="/products"
                  className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-2xl mr-3">🛒</span>
                  <div>
                    <p className="font-medium text-green-900">Shop Products</p>
                    <p className="text-sm text-green-700">Buy items instantly</p>
                  </div>
                </a>
                
                <a
                  href="/sell"
                  className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <span className="text-2xl mr-3">💼</span>
                  <div>
                    <p className="font-medium text-purple-900">Start Selling</p>
                    <p className="text-sm text-purple-700">List your items</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Protection</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✅</span>
                  <div>
                    <p className="font-medium text-gray-900">Escrow Protection</p>
                    <p className="text-sm text-gray-600">Your funds are held securely until delivery</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✅</span>
                  <div>
                    <p className="font-medium text-gray-900">Encrypted Transactions</p>
                    <p className="text-sm text-gray-600">Bank-level security for all transfers</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-0.5">✅</span>
                  <div>
                    <p className="font-medium text-gray-900">Fraud Protection</p>
                    <p className="text-sm text-gray-600">24/7 monitoring and protection</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <a
                  href="/help/wallet"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="mr-2">📖</span>
                  Wallet Guide
                </a>
                <a
                  href="/help/security"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="mr-2">🔒</span>
                  Security Tips
                </a>
                <a
                  href="/support"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="mr-2">💬</span>
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletPage 