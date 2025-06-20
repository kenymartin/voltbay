import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { CreditCard, MapPin, ShoppingBag, ArrowLeft, Lock } from 'lucide-react'
import { toast } from 'react-toastify'
import SEO from '../components/SEO'
import LoginModal from '../components/LoginModal'
import PaymentForm from '../components/payment/PaymentForm'
import type { PaymentIntentData } from '../services/paymentService'
import { getSafeImageUrls, handleImageError } from '../utils/imageUtils'

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [paymentData, setPaymentData] = useState<PaymentIntentData | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated)
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  })

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    // Continue with checkout process
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart before checking out</p>
          <button
            onClick={() => navigate('/products')}
            className="btn btn-primary"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  // For now, we'll handle single product checkout (most common case)
  // TODO: Implement multi-product checkout in the future
  const firstItem = items[0]
  const subtotal = getTotalPrice()
  const shipping = 25.00 // Fixed shipping cost
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate shipping info
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode']
    const missingFields = requiredFields.filter(field => !shippingInfo[field as keyof ShippingInfo])
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields')
      return
    }

    // Prepare payment data for the first item (single product checkout)
    const paymentIntentData: PaymentIntentData = {
      productId: firstItem.productId,
      amount: total,
      shippingAddress: {
        street: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country
      }
    }

    setPaymentData(paymentIntentData)
    setCurrentStep(2)
  }

  const handlePaymentSuccess = (orderId: string) => {
    // Clear cart and redirect to order detail
    clearCart()
    toast.success('Order placed successfully!')
    navigate(`/order/${orderId}`)
  }

  const handlePaymentError = (error: string) => {
    toast.error(error)
  }

  const updateShippingInfo = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Checkout - VoltBay Solar Marketplace"
        description="Complete your solar equipment purchase securely with our streamlined checkout process."
        url={window.location.href}
        type="website"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold">Shipping Information</h2>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => updateShippingInfo('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => updateShippingInfo('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => updateShippingInfo('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => updateShippingInfo('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => updateShippingInfo('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => updateShippingInfo('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => updateShippingInfo('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.zipCode}
                        onChange={(e) => updateShippingInfo('zipCode', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      value={shippingInfo.country}
                      onChange={(e) => updateShippingInfo('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {currentStep === 2 && paymentData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold">Payment Information</h2>
                </div>

                <PaymentForm
                  paymentData={paymentData}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />

                <button
                  onClick={() => setCurrentStep(1)}
                  className="mt-4 text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Shipping
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${index}`} className="flex items-center space-x-3">
                    <img
                      src={getSafeImageUrls(item.product.imageUrls, item.product.category?.name)[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTI4IDI4TDM2IDM2TDI4IDQ0IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo='}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded-md bg-gray-100"
                      onError={(e) => handleImageError(e, item.product.category?.name)}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.product.title}</h4>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 flex items-center justify-center text-sm text-gray-600">
                <Lock className="w-4 h-4 mr-2" />
                <span>Secure SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => navigate('/')}
        onSuccess={handleLoginSuccess}
        context={{ action: 'checkout' }}
      />
    </div>
  )
} 