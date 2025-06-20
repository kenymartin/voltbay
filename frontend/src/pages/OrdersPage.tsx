import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Filter,
  Search,
  Calendar,
  DollarSign,
  User,
  MapPin,
  ArrowLeft,
  RefreshCw
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import apiService from '../services/api'
import SEO from '../components/SEO'
import type { Order, ApiResponse } from '@shared/dist'

type OrderFilter = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
type OrderType = 'all' | 'purchases' | 'sales'

export default function OrdersPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<OrderFilter>(
    (searchParams.get('status') as OrderFilter) || 'all'
  )
  const [typeFilter, setTypeFilter] = useState<OrderType>(
    (searchParams.get('type') as OrderType) || 'all'
  )

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    setSearchParams(params)
  }, [statusFilter, typeFilter, setSearchParams])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await apiService.get<ApiResponse<Order[]>>('/api/orders/')
      
      // Handle different response structures
      const orderData = Array.isArray(response.data) 
        ? response.data 
        : Array.isArray((response.data as any)?.orders) 
        ? (response.data as any).orders 
        : []
        
      setOrders(orderData)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
    toast.success('Orders refreshed')
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-500" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.status.toLowerCase() !== statusFilter) {
      return false
    }

    // Type filter (purchases vs sales)
    if (typeFilter === 'purchases' && order.buyerId !== user?.id) {
      return false
    }
    if (typeFilter === 'sales' && order.sellerId !== user?.id) {
      return false
    }

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        order.product?.title?.toLowerCase().includes(searchLower) ||
        order.id.toLowerCase().includes(searchLower) ||
        order.trackingNumber?.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  const OrderCard = ({ order }: { order: Order }) => {
    const isPurchase = order.buyerId === user?.id
    const otherUser = isPurchase ? order.seller : order.buyer

    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Order #{order.id.slice(-8).toUpperCase()}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isPurchase ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isPurchase ? 'Purchase' : 'Sale'}
                </span>
              </div>
              
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {order.product?.title || 'Product Not Found'}
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">${order.totalAmount}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <button
                onClick={() => navigate(`/order/${order.id}`)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Other Party Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {isPurchase ? 'Seller' : 'Buyer'}
              </h4>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {otherUser?.firstName} {otherUser?.lastName}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping</h4>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <div>{order.shippingStreet}</div>
                  <div>
                    {order.shippingCity}, {order.shippingState} {order.shippingZipCode}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking Number */}
          {order.trackingNumber && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Tracking Number:</span>
                  <span className="ml-2 text-sm font-mono text-gray-900">{order.trackingNumber}</span>
                </div>
                <Truck className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-700">Notes:</span>
              <p className="text-sm text-blue-600 mt-1">{order.notes}</p>
            </div>
          )}

          {/* Payment Info */}
          {order.paymentType && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Payment: {order.paymentType} {order.paymentLast4 && `****${order.paymentLast4}`}
              </span>
              {order.stripeFee && (
                <span className="text-gray-500">
                  Fee: ${order.stripeFee}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
      <p className="text-gray-600 mb-4">
        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
          ? 'Try adjusting your filters or search terms'
          : 'You haven\'t placed any orders yet'}
      </p>
      {(!searchTerm && statusFilter === 'all' && typeFilter === 'all') && (
        <button
          onClick={() => navigate('/search')}
          className="btn btn-primary"
        >
          Start Shopping
        </button>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-16 bg-gray-300 rounded"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO 
        title="My Orders"
        description="View and manage your VoltBay orders"
        url={window.location.href}
        noIndex={true}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <p className="text-gray-600">
          Track your purchases and sales on VoltBay
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product, order ID, or tracking number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as OrderType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Orders</option>
              <option value="purchases">My Purchases</option>
              <option value="sales">My Sales</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
          </div>
          
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setTypeFilter('all')
              }}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
} 