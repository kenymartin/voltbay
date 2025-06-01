import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { CreditCard, MapPin, User, ShoppingBag, ArrowLeft, Lock } from 'lucide-react'
import { toast } from 'react-toastify'
import SEO from '../components/SEO'

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

interface PaymentInfo {
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  
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
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  })

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
    
    setCurrentStep(2)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate payment info
    if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || !paymentInfo.nameOnCard) {
      toast.error('Please fill in all payment details')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear cart and redirect to success
      clearCart()
      toast.success('Order placed successfully!')
      navigate('/order-success')
    } catch (error) {
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const updateShippingInfo = (field: keyof ShippingInfo, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }))
  }

  const updatePaymentInfo = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }))
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
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
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => updateShippingInfo('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
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
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full btn btn-primary"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-primary-600 mr-3" />
                  <h2 className="text-xl font-semibold">Payment Information</h2>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => updatePaymentInfo('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => updatePaymentInfo('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => updatePaymentInfo('cvv', e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.nameOnCard}
                      onChange={(e) => updatePaymentInfo('nameOnCard', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600">
                      <Lock className="w-4 h-4 mr-2" />
                      Your payment information is encrypted and secure
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 btn btn-outline"
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 btn btn-primary"
                    >
                      {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3">
                    <img
                      src={item.product.imageUrls?.[0] || '/placeholder-product.jpg'}
                      alt={item.product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
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
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 