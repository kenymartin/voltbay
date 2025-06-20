import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  // Calendar,
  // DollarSign,
  User,
  MapPin,
  CreditCard,
  FileText,
  Copy,
  ExternalLink
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import apiService from '../services/api'
import SEO from '../components/SEO'
import type { Order, ApiResponse } from '@shared/dist'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchOrder(id)
    }
  }, [id])

  const fetchOrder = async (orderId: string) => {
    setLoading(true)
    try {
      console.log('🔧 Fetching order:', orderId)
      const response = await apiService.get<ApiResponse<{order: Order}>>(`/api/orders/${orderId}`)
      console.log('🔧 Order response:', response)
      
      // Handle different response structures
      let orderData = null
      if (response.success && response.data) {
        // Check if data contains order property (backend format)
        if ((response.data as any).order) {
          orderData = (response.data as any).order
        } else {
          // Direct order data
          orderData = response.data
        }
      }
      
      console.log('🔧 Extracted order data:', orderData)
      
      if (orderData) {
        setOrder(orderData)
      } else {
        console.error('🔧 No order data found in response')
        toast.error('Order not found')
        navigate('/orders')
      }
    } catch (error: any) {
      console.error('🔧 Failed to fetch order:', error)
      console.error('🔧 Error response:', error.response?.data)
      
      if (error.response?.status === 404) {
        toast.error('Order not found')
      } else if (error.response?.status === 403) {
        toast.error('Access denied')
      } else {
        toast.error('Failed to load order details')
      }
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />
      case 'shipped':
        return <Truck className="w-6 h-6 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Package className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
          <div className="h-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Order not found</h1>
          <p className="mt-2 text-gray-600">The order you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/orders')}
            className="mt-4 btn btn-primary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    )
  }

  const isPurchase = order.buyerId === user?.id
  const otherUser = isPurchase ? order.seller : order.buyer

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO 
        title={`Order #${order.id.slice(-8).toUpperCase()}`}
        description="View order details and tracking information"
        url={window.location.href}
        noIndex={true}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/orders')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="Back to Orders"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="font-medium">{order.status}</span>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full ${
            isPurchase ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {isPurchase ? 'Purchase' : 'Sale'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="flex space-x-4">
              {order.product?.imageUrls && order.product.imageUrls.length > 0 && (
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={order.product.imageUrls[0]}
                    alt={order.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {order.product?.title || 'Product Not Found'}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {order.product?.description || 'No description available'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Condition: {order.product?.condition || 'N/A'}</span>
                  <span>Category: {order.product?.category?.name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Placed</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {order.status !== 'PENDING' && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Confirmed</p>
                    <p className="text-sm text-gray-500">Payment processed</p>
                  </div>
                </div>
              )}

              {order.status === 'SHIPPED' || order.status === 'DELIVERED' ? (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Shipped</p>
                    {order.trackingNumber && (
                      <p className="text-sm text-gray-500">
                        Tracking: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">Awaiting Shipment</p>
                  </div>
                </div>
              )}

              {order.status === 'DELIVERED' ? (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Delivered</p>
                    <p className="text-sm text-gray-500">Order completed</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-400">Awaiting Delivery</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Notes</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <p className="text-blue-800">{order.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm">{order.id}</span>
                  <button
                    onClick={() => copyToClipboard(order.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold text-lg">${order.totalAmount}</span>
              </div>
              {order.stripeFee && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Processing Fee:</span>
                  <span className="text-gray-500">${order.stripeFee}</span>
                </div>
              )}
            </div>
          </div>

          {/* Other Party */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              {isPurchase ? 'Seller' : 'Buyer'} Information
            </h2>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {otherUser?.firstName} {otherUser?.lastName}
                </p>
                <p className="text-sm text-gray-500">{otherUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div className="text-sm text-gray-600">
                <p>{order.shippingStreet}</p>
                <p>{order.shippingCity}, {order.shippingState} {order.shippingZipCode}</p>
                <p>{order.shippingCountry}</p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {order.paymentType && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{order.paymentType}</p>
                    {order.paymentLast4 && (
                      <p className="text-sm text-gray-500">****{order.paymentLast4}</p>
                    )}
                  </div>
                </div>
                {order.paymentBrand && (
                  <p className="text-sm text-gray-500 ml-8">{order.paymentBrand}</p>
                )}
              </div>
            </div>
          )}

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Tracking Information</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tracking Number:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{order.trackingNumber}</span>
                    <button
                      onClick={() => copyToClipboard(order.trackingNumber!)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button className="w-full btn btn-outline flex items-center justify-center space-x-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Track Package</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 