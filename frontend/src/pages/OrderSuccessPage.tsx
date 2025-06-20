import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Package, Mail, ArrowRight } from 'lucide-react'
import SEO from '../components/SEO'

export default function OrderSuccessPage() {
  // const navigate = useNavigate()

  // Generate a mock order number
  const orderNumber = `VB${Date.now().toString().slice(-6)}`

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Order Confirmed - VoltBay Solar Marketplace"
        description="Your solar equipment order has been successfully placed and confirmed."
        url={window.location.href}
        type="website"
      />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your order has been successfully placed and is being processed.
          </p>

          {/* Order Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold text-gray-900">#{orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="font-semibold text-gray-900">
                  {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-semibold text-green-600">Paid</p>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Order Confirmation</h4>
                <p className="text-gray-600">You'll receive an email confirmation with your order details</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Processing</h4>
                <p className="text-gray-600">Your order will be processed and prepared for shipping</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">Delivery</h4>
                <p className="text-gray-600">Your solar equipment will be delivered to your address</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="btn btn-primary flex items-center justify-center"
            >
              View Order Status
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link
              to="/products"
              className="btn btn-outline flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Support Information */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Need help with your order?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a href="mailto:support@voltbay.com" className="text-primary-600 hover:text-primary-700">
                Email Support
              </a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <a href="tel:+1-555-0123" className="text-primary-600 hover:text-primary-700">
                Call (555) 012-3456
              </a>
              <span className="hidden sm:inline text-gray-300">|</span>
              <Link to="/help" className="text-primary-600 hover:text-primary-700">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 