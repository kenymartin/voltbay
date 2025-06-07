import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Package, Gavel, ShoppingCart, User, Eye, Edit, Trash2, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'
import apiService from '../../services/api'
import type { Product, Bid, Order, ApiResponse } from '../../../../shared/types'

type TabType = 'overview' | 'listings' | 'bids' | 'orders' | 'profile'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  
  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [bids, setBids] = useState<Bid[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  // Stats
  const [stats, setStats] = useState({
    activeListings: 0,
    totalSales: 0,
    activeBids: 0,
    pendingOrders: 0
  })

  useEffect(() => {
    // Check for tab parameter in URL
    const tabParam = searchParams.get('tab') as TabType
    if (tabParam && ['overview', 'listings', 'bids', 'orders', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [productsRes, bidsRes, ordersRes] = await Promise.all([
        apiService.get<ApiResponse<{ products: Product[] }>>('/api/products/my-listings'),
        apiService.get<ApiResponse<{ bids: Bid[] }>>('/api/bids/my-bids'),
        apiService.get<ApiResponse<{ orders: Order[], pagination: any }>>('/api/orders/my-orders')
      ])

      const userProducts = (productsRes.data as any)?.products || []
      const userBids = (bidsRes.data as any)?.bids || []
      const userOrders = (ordersRes.data as any)?.orders || []

      setProducts(userProducts)
      setBids(userBids)
      setOrders(userOrders)

      // Calculate stats
      setStats({
        activeListings: userProducts.filter(p => p.status === 'ACTIVE').length,
        totalSales: userOrders.filter(o => o.sellerId === user?.id && o.status === 'DELIVERED').length,
        activeBids: userBids.filter(b => b.isWinning).length,
        pendingOrders: userOrders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      await apiService.delete(`/api/products/${productId}`)
      toast.success('Product deleted successfully')
      fetchDashboardData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }: { 
    title: string
    value: number | string
    icon: any
    color: string 
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  const ProductCard = ({ product }: { product: Product }) => {
    const isAuctionActive = product.isAuction && product.auctionEndDate && new Date(product.auctionEndDate) > new Date()
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="aspect-video bg-gray-200 overflow-hidden">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <img
              src={product.imageUrls[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
          
          <div className="flex justify-between items-center mb-3">
            {product.isAuction ? (
              <div>
                <span className="text-lg font-bold text-green-600">
                  ${product.currentBid || product.minimumBid || 0}
                </span>
                <span className="text-sm text-gray-500 ml-1">current bid</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-green-600">${product.price}</span>
            )}
            
            <span className={`px-2 py-1 text-xs rounded ${
              product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              product.status === 'SOLD' ? 'bg-blue-100 text-blue-800' :
              product.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {product.status}
            </span>
          </div>

          {product.isAuction && (
            <div className="mb-3">
              <span className={`px-2 py-1 rounded text-xs ${
                isAuctionActive ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isAuctionActive ? 'Active Auction' : 'Auction Ended'}
              </span>
              {product.auctionEndDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Ends: {new Date(product.auctionEndDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/products/${product.id}`)}
              className="flex-1 btn btn-outline btn-sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </button>
            <button
              onClick={() => navigate(`/dashboard/edit-product/${product.id}`)}
              className="flex-1 btn btn-primary btn-sm"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button
              onClick={() => handleDeleteProduct(product.id)}
              className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const BidCard = ({ bid }: { bid: Bid }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{bid.product?.title}</h3>
          <p className="text-sm text-gray-600">{bid.product?.category?.name}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-green-600">${bid.amount}</span>
          {bid.isWinning && (
            <span className="block px-2 py-1 bg-green-100 text-green-800 text-xs rounded mt-1">
              Winning
            </span>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Placed: {new Date(bid.createdAt).toLocaleDateString()}</span>
        <button
          onClick={() => navigate(`/products/${bid.productId}`)}
          className="text-blue-600 hover:text-blue-800"
        >
          View Product
        </button>
      </div>
    </div>
  )

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{order.product?.title}</h3>
          <p className="text-sm text-gray-600">
            {order.buyerId === user?.id ? `Seller: ${order.seller?.firstName} ${order.seller?.lastName}` : 
             `Buyer: ${order.buyer?.firstName} ${order.buyer?.lastName}`}
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-green-600">${order.totalAmount}</span>
          <span className={`block px-2 py-1 text-xs rounded mt-1 ${
            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
            order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>Order Date: {new Date(order.createdAt).toLocaleDateString()}</span>
        {order.trackingNumber && (
          <span>Tracking: {order.trackingNumber}</span>
        )}
      </div>
    </div>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Listings"
          value={stats.activeListings}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Winning Bids"
          value={stats.activeBids}
          icon={Gavel}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/dashboard/create-listing')}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Listing
          </button>
          <button
            onClick={() => setActiveTab('bids')}
            className="btn btn-outline"
          >
            <Gavel className="w-5 h-5 mr-2" />
            View My Bids
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className="btn btn-outline"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            View Orders
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {orders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <p className="font-medium">{order.product?.title}</p>
                <p className="text-sm text-gray-600">
                  {order.buyerId === user?.id ? 'Purchase' : 'Sale'} - {order.status}
                </p>
              </div>
              <span className="text-green-600 font-semibold">${order.totalAmount}</span>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )

  const ListingsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Listings</h2>
        <button
          onClick={() => navigate('/dashboard/create-listing')}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Listing
        </button>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-600 mb-4">Start selling your solar products today</p>
          <button
            onClick={() => navigate('/dashboard/create-listing')}
            className="btn btn-primary"
          >
            Create Your First Listing
          </button>
        </div>
      )}
    </div>
  )

  const BidsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">My Bids</h2>

      {bids.length > 0 ? (
        <div className="space-y-4">
          {bids.map((bid) => (
            <BidCard key={bid.id} bid={bid} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bids placed</h3>
          <p className="text-gray-600 mb-4">Start bidding on auction items</p>
          <button
            onClick={() => navigate('/search?auction=true')}
            className="btn btn-primary"
          >
            Browse Auctions
          </button>
        </div>
      )}
    </div>
  )

  const OrdersTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">My Orders</h2>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-4">Start shopping for solar products</p>
          <button
            onClick={() => navigate('/search')}
            className="btn btn-primary"
          >
            Browse Products
          </button>
        </div>
      )}
    </div>
  )

  const ProfileTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Profile Settings</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.firstName} 
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h3>
            <p className="text-gray-600">{user?.email}</p>
            <span className={`px-2 py-1 text-xs rounded ${
              user?.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user?.verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={user?.firstName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={user?.lastName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={user?.phone || ''}
              placeholder="Not provided"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              readOnly
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button 
            onClick={() => navigate('/profile')}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <p className="text-sm text-gray-500">
            Click "Edit Profile" to update your personal information
          </p>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'listings', label: 'My Listings', icon: Package },
    { id: 'bids', label: 'My Bids', icon: Gavel },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'listings' && <ListingsTab />}
      {activeTab === 'bids' && <BidsTab />}
      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'profile' && <ProfileTab />}
    </div>
  )
} 