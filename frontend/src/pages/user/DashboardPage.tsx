import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Package, Gavel, ShoppingCart, User, Eye, Edit, Trash2, Clock, CheckCircle, Wallet, TrendingUp, DollarSign } from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'
import apiService from '../../services/api'
import WalletDashboard from '../../components/WalletDashboard'
import { shouldShowFeature, isEnterpriseUser } from '../../utils/userPermissions'
import type { Product, Bid, Order, ApiResponse } from '@shared/dist'

type TabType = 'overview' | 'listings' | 'bids' | 'orders' | 'wallet' | 'quotes' | 'profile'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  
  // Data states
  const [products, setProducts] = useState<Product[]>([])
  const [bids, _setBids] = useState<Bid[]>([])
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
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const [productsRes, ordersRes] = await Promise.all([
        apiService.get<ApiResponse<Product[]>>('/api/products/user/my-products'),
        apiService.get<ApiResponse<Order[]>>('/api/orders/')
      ])

      // Handle different response structures from backend with proper fallbacks
      const userProducts = Array.isArray(productsRes.data) 
        ? productsRes.data 
        : Array.isArray((productsRes.data as any)?.products) 
        ? (productsRes.data as any).products 
        : []
        
      const userOrders = Array.isArray(ordersRes.data) 
        ? ordersRes.data 
        : Array.isArray((ordersRes.data as any)?.orders) 
        ? (ordersRes.data as any).orders 
        : []

      setProducts(userProducts)
      setOrders(userOrders)

      // Calculate stats with safe array methods
      setStats({
        activeListings: userProducts.filter((p: Product) => p.status === 'ACTIVE').length,
        totalSales: userOrders.filter((o: Order) => o.sellerId === user?.id && o.status === 'DELIVERED').length,
        activeBids: 0, // Will implement bids later
        pendingOrders: userOrders.filter((o: Order) => o.status === 'PENDING' || o.status === 'CONFIRMED').length
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Set empty arrays on error to prevent crashes
      setProducts([])
      setOrders([])
      setStats({
        activeListings: 0,
        totalSales: 0,
        activeBids: 0,
        pendingOrders: 0
      })
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
              onClick={() => navigate(`/product/${product.id}`)}
              className="flex-1 btn btn-outline btn-sm"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </button>
            <button
              onClick={() => navigate(`/sell/edit/${product.id}`)}
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
          onClick={() => navigate(`/product/${bid.productId}`)}
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
      {/* Notifications/Alerts */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">
              {isEnterpriseUser(user) ? 'Welcome to VoltBay Enterprise!' : 'Welcome to VoltBay!'}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {isEnterpriseUser(user) && user?.role === 'BUYER'
                ? 'Your enterprise buyer dashboard is ready. Browse vendors and calculate project ROI.'
                : isEnterpriseUser(user) && user?.role === 'VENDOR'
                ? 'Your enterprise vendor dashboard is ready. Manage your services and client relationships.'
                : 'Your solar marketplace dashboard is ready. Start by creating your first listing or browsing available products.'
              }
            </p>
            <div className="mt-3 flex space-x-3">
              {isEnterpriseUser(user) && user?.role === 'BUYER' ? (
                <>
                  <button
                    onClick={() => navigate('/enterprise')}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Browse Vendors
                  </button>
                  <button
                    onClick={() => navigate('/roi-calculator')}
                    className="text-xs bg-white text-blue-600 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    ROI Calculator
                  </button>
                </>
              ) : isEnterpriseUser(user) && user?.role === 'VENDOR' ? (
                <>
                  <button
                    onClick={() => navigate('/sell')}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    Add Service
                  </button>
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="text-xs bg-white text-blue-600 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    My Services
                  </button>
                </>
              ) : (
                <>
                  {shouldShowFeature(user, 'showSellButton') && (
                    <button
                      onClick={() => navigate('/sell')}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Create Listing
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/search')}
                    className="text-xs bg-white text-blue-600 px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    Browse Products
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {shouldShowFeature(user, 'canViewMyListings') && (
          <StatCard
            title={isEnterpriseUser(user) ? "Active Services" : "Active Listings"}
            value={stats.activeListings}
            icon={Package}
            color="bg-blue-500"
          />
        )}
        <StatCard
          title={isEnterpriseUser(user) ? "Completed Projects" : "Total Sales"}
          value={stats.totalSales}
          icon={CheckCircle}
          color="bg-green-500"
        />
        {shouldShowFeature(user, 'canViewMyBids') && (
          <StatCard
            title="Winning Bids"
            value={stats.activeBids}
            icon={Gavel}
            color="bg-purple-500"
          />
        )}
        {shouldShowFeature(user, 'canViewMyOrders') && (
          <StatCard
            title={isEnterpriseUser(user) ? "Active Contracts" : "Pending Orders"}
            value={stats.pendingOrders}
            icon={Clock}
            color="bg-orange-500"
          />
        )}
      </div>

      {/* Financial Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ${Array.isArray(orders) ? orders
                .filter(o => o.sellerId === user?.id && o.status === 'DELIVERED')
                .reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0)
                .toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Earnings</div>
            <div className="text-xs text-gray-500 mt-1">From completed sales</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ${Array.isArray(orders) ? orders
                .filter(o => o.buyerId === user?.id)
                .reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0)
                .toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Spent</div>
            <div className="text-xs text-gray-500 mt-1">On purchases</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ${Array.isArray(orders) ? orders
                .filter(o => o.sellerId === user?.id && (o.status === 'PENDING' || o.status === 'CONFIRMED'))
                .reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0)
                .toFixed(2) : '0.00'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Pending Revenue</div>
            <div className="text-xs text-gray-500 mt-1">From active orders</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {isEnterpriseUser(user) && user?.role === 'BUYER' ? (
            <>
              <button
                onClick={() => navigate('/enterprise')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Browse Vendors</h3>
                  <p className="text-sm text-gray-600">Find solar providers</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/roi-calculator')}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">ROI Calculator</h3>
                  <p className="text-sm text-gray-600">Calculate project returns</p>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('orders')}
                className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                    <ShoppingCart className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">My Contracts</h3>
                  <p className="text-sm text-gray-600">Track client projects</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Company Profile</h3>
                  <p className="text-sm text-gray-600">Update business info</p>
                </div>
              </button>
            </>
          ) : isEnterpriseUser(user) && user?.role === 'VENDOR' ? (
            <>
              <button
                onClick={() => navigate('/sell')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Add Service</h3>
                  <p className="text-sm text-gray-600">Create new offering</p>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('listings')}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">My Services</h3>
                  <p className="text-sm text-gray-600">Manage offerings</p>
                </div>
              </button>
              
              {shouldShowFeature(user, 'canViewMyOrders') && (
                <button
                  onClick={() => setActiveTab('orders')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                      <ShoppingCart className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">Client Projects</h3>
                    <p className="text-sm text-gray-600">Track contracts</p>
                  </div>
                </button>
              )}
              
              {shouldShowFeature(user, 'canViewWallet') && (
                <button
                  onClick={() => setActiveTab('wallet')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                      <Wallet className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">Finances</h3>
                    <p className="text-sm text-gray-600">Revenue & payments</p>
                  </div>
                </button>
              )}
              
              {shouldShowFeature(user, 'canViewQuotes') && (
                <button
                  onClick={() => setActiveTab('quotes')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-indigo-200 transition-colors">
                      <TrendingUp className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">Quotes</h3>
                    <p className="text-sm text-gray-600">Manage quotes</p>
                  </div>
                </button>
              )}
              
              <button
                onClick={() => navigate('/profile')}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Company Profile</h3>
                  <p className="text-sm text-gray-600">Update business info</p>
                </div>
              </button>
            </>
          ) : (
            <>
              {shouldShowFeature(user, 'showSellButton') && (
                <button
                  onClick={() => navigate('/sell')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                      <Plus className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">Create Listing</h3>
                    <p className="text-sm text-gray-600">Sell your solar equipment</p>
                  </div>
                </button>
              )}
              
              {shouldShowFeature(user, 'canViewMyListings') && (
                <button
                  onClick={() => navigate('/search')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">Browse Products</h3>
                    <p className="text-sm text-gray-600">Find solar equipment</p>
                  </div>
                </button>
              )}
              
              {shouldShowFeature(user, 'canViewMyBids') && (
                <button
                  onClick={() => setActiveTab('bids')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
                      <Gavel className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">My Bids</h3>
                    <p className="text-sm text-gray-600">Track auction bids</p>
                  </div>
                </button>
              )}
              
              {shouldShowFeature(user, 'canViewMyOrders') && (
                <button
                  onClick={() => navigate('/orders')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                      <ShoppingCart className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">My Orders</h3>
                    <p className="text-sm text-gray-600">Track purchases & sales</p>
                  </div>
                </button>
              )}
              
              <button
                onClick={() => navigate('/profile')}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">Edit Profile</h3>
                  <p className="text-sm text-gray-600">Update your information</p>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <button
            onClick={() => setActiveTab('orders')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {Array.isArray(orders) && orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  order.status === 'DELIVERED' ? 'bg-green-500' :
                  order.status === 'SHIPPED' ? 'bg-blue-500' :
                  order.status === 'CONFIRMED' ? 'bg-purple-500' :
                  order.status === 'PENDING' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900">{order.product?.title}</p>
                  <p className="text-sm text-gray-600">
                    {order.buyerId === user?.id ? 'Purchase' : 'Sale'} • {order.status.toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-gray-900">${order.totalAmount}</span>
                <p className="text-xs text-gray-500">
                  {order.buyerId === user?.id ? 'Purchased' : 'Earned'}
                </p>
              </div>
            </div>
          ))}
          {(!Array.isArray(orders) || orders.length === 0) && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No recent activity</p>
              <p className="text-sm text-gray-400">Your transactions will appear here</p>
            </div>
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
          onClick={() => navigate('/sell')}
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
            onClick={() => navigate('/sell')}
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Orders</h2>
        <button
          onClick={() => navigate('/orders')}
          className="btn btn-primary"
        >
          View All Orders
        </button>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.slice(0, 5).map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
          {orders.length > 5 && (
            <div className="text-center pt-4">
              <button
                onClick={() => navigate('/orders')}
                className="text-primary-600 hover:text-primary-800 font-medium"
              >
                View {orders.length - 5} more orders →
              </button>
            </div>
          )}
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

  const WalletTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Wallet</h2>
        <div className="flex space-x-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            💳 Secure Payments
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            ⚡ Instant Transactions
          </span>
        </div>
      </div>

      <WalletDashboard />

      {/* Wallet Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Wallet Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Instant Payments</h4>
              <p className="text-sm text-blue-700">Pay for auctions and purchases instantly with your wallet balance.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Secure Escrow</h4>
              <p className="text-sm text-blue-700">Your funds are protected during transactions with built-in escrow.</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Lower Fees</h4>
              <p className="text-sm text-blue-700">Reduced transaction fees when using wallet funds vs. credit cards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const QuotesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          {user?.role === 'VENDOR' ? 'Quote Requests' : 'My Quotes'}
        </h2>
        {user?.role === 'BUYER' && (
          <button
            onClick={() => navigate('/enterprise')}
            className="btn btn-primary"
          >
            Request New Quote
          </button>
        )}
      </div>

      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {user?.role === 'VENDOR' ? 'No quote requests yet' : 'No quotes yet'}
        </h3>
        <p className="text-gray-600 mb-4">
          {user?.role === 'VENDOR' 
            ? 'Quote requests from enterprise buyers will appear here'
            : 'Your requested quotes will appear here'
          }
        </p>
        {user?.role === 'BUYER' && (
          <button
            onClick={() => navigate('/enterprise')}
            className="btn btn-primary"
          >
            Request Your First Quote
          </button>
        )}
      </div>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={user?.lastName || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={user?.phone || ''}
              placeholder="Not provided"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly
            />
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => {
              if (isEnterpriseUser(user)) {
                navigate("/company/profile/manage")
              } else {
                navigate('/profile')
              }
            }}
            className="btn btn-primary"
          >
            {isEnterpriseUser(user) ? 'Edit Company Profile' : 'Edit Profile'}
          </button>
        </div>
      </div>
    </div>
  )

  // Filter tabs based on user permissions
  const allTabs = [
    { id: 'overview', label: 'Overview', icon: User, permission: null },
    { id: 'listings', label: isEnterpriseUser(user) ? 'My Services' : 'My Listings', icon: Package, permission: 'canViewMyListings' },
    { id: 'bids', label: 'My Bids', icon: Gavel, permission: 'canViewMyBids' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, permission: 'canViewMyOrders' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, permission: 'canViewWallet' },
    { id: 'quotes', label: 'Quotes', icon: TrendingUp, permission: 'canViewQuotes' },
    { id: 'profile', label: 'Profile', icon: User, permission: null },
  ]

  const tabs = allTabs.filter(tab => 
    !tab.permission || shouldShowFeature(user, tab.permission as any)
  )

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
      {activeTab === 'listings' && shouldShowFeature(user, 'canViewMyListings') && <ListingsTab />}
      {activeTab === 'bids' && shouldShowFeature(user, 'canViewMyBids') && <BidsTab />}
              {activeTab === 'orders' && shouldShowFeature(user, 'canViewMyOrders') && <OrdersTab />}
        {activeTab === 'wallet' && shouldShowFeature(user, 'canViewWallet') && <WalletTab />}
        {activeTab === 'quotes' && shouldShowFeature(user, 'canViewQuotes') && <QuotesTab />}
        {activeTab === 'profile' && <ProfileTab />}
    </div>
  )
} 