import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Users, Package, TrendingUp, AlertTriangle, Eye, Ban, CheckCircle, XCircle, Edit, Trash2, Plus, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import apiService from '../../services/api'
import type { User, Product, Category, Order, ApiResponse } from '@shared/dist'

// Local UserRole enum to avoid import issues
enum UserRole {
  BUYER = 'BUYER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR' // Keep for future use, but not actively used
}

type TabType = 'overview' | 'users' | 'products' | 'categories' | 'orders'

interface AdminStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingProducts: number
  reportedProducts: number
  activeAuctions: number
  newUsersToday: number
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<TabType>((location.state as any)?.activeTab || 'overview')
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingProducts: 0,
    reportedProducts: 0,
    activeAuctions: 0,
    newUsersToday: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedUserStatus, setSelectedUserStatus] = useState<string>('')
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('')
  const [selectedUserType, setSelectedUserType] = useState<string>('')
  const [selectedUserRole, setSelectedUserRole] = useState<string>('')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [statsRes, usersRes, productsRes, categoriesRes, ordersRes] = await Promise.all([
        apiService.get<ApiResponse<AdminStats>>('/api/admin/stats'),
        apiService.get<ApiResponse<User[]>>('/api/admin/users'),
        apiService.get<ApiResponse<Product[]>>('/api/admin/products'),
        apiService.get<ApiResponse<Category[]>>('/api/admin/categories'),
        apiService.get<ApiResponse<Order[]>>('/api/admin/orders')
      ])

      setStats(statsRes.data || stats)
      setUsers(usersRes.data || [])
      setProducts(productsRes.data || [])
      setCategories(categoriesRes.data || [])
      setOrders(ordersRes.data || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'ban' | 'unban' | 'verify') => {
    try {
      await apiService.post(`/api/admin/users/${userId}/${action}`)
      toast.success(`User ${action}ned successfully`)
      fetchAdminData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`)
    }
  }

  const handleProductAction = async (productId: string, action: 'approve' | 'reject' | 'suspend') => {
    try {
      await apiService.post(`/api/admin/products/${productId}/${action}`)
      toast.success(`Product ${action}ed successfully`)
      fetchAdminData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} product`)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      await apiService.delete(`/api/admin/categories/${categoryId}`)
      toast.success('Category deleted successfully')
      fetchAdminData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, trend }: {
    title: string
    value: number | string
    icon: any
    color: string
    trend?: string
  }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  const UserRow = ({ user }: { user: User }) => {
    // Determine user type for display (5 main roles: Regular Buyer, Regular Vendor, Enterprise Buyer, Enterprise Vendor, Admin)
    const getUserType = () => {
      if (user.role === UserRole.ADMIN) return 'Admin'
      if (user.role === UserRole.MODERATOR) return 'Moderator' // Future use
      if (user.role === UserRole.VENDOR && user.isEnterprise) return 'Enterprise Vendor'
      if (user.role === UserRole.VENDOR && !user.isEnterprise) return 'Regular Vendor'
      if (user.role === UserRole.BUYER && user.isEnterprise) return 'Enterprise Buyer'
      if (user.role === UserRole.BUYER && !user.isEnterprise) return 'Regular Buyer'
      return 'User'
    }

    const getUserTypeColor = () => {
      if (user.role === UserRole.ADMIN) return 'bg-purple-100 text-purple-800'
      if (user.role === UserRole.MODERATOR) return 'bg-blue-100 text-blue-800' // Future use
      if (user.role === UserRole.VENDOR && user.isEnterprise) return 'bg-orange-100 text-orange-800'
      if (user.role === UserRole.VENDOR && !user.isEnterprise) return 'bg-green-100 text-green-800'
      if (user.role === UserRole.BUYER && user.isEnterprise) return 'bg-yellow-100 text-yellow-800'
      if (user.role === UserRole.BUYER && !user.isEnterprise) return 'bg-blue-100 text-blue-800'
      return 'bg-gray-100 text-gray-800'
    }

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
                {user.companyName && (
                  <span className="text-xs text-gray-500 block">
                    {user.companyName}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs rounded ${getUserTypeColor()}`}>
            {getUserType()}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 text-xs rounded ${
            user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {user.verified ? 'Verified' : 'Unverified'}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex space-x-2">
            {!user.verified && (
              <button
                onClick={() => handleUserAction(user.id, 'verify')}
                className="text-green-600 hover:text-green-900"
                title="Verify User"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleUserAction(user.id, 'ban')}
              className="text-red-600 hover:text-red-900"
              title="Ban User"
            >
              <Ban className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  const ProductRow = ({ product }: { product: Product }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
            {product.imageUrls?.[0] ? (
              <img src={product.imageUrls[0]} alt={product.title} className="w-12 h-12 object-cover" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
              {product.title}
            </div>
            <div className="text-sm text-gray-500">{product.category?.name}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {product.owner?.firstName} {product.owner?.lastName}
        </div>
        <div className="text-sm text-gray-500">{product.owner?.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-medium text-green-600">
          ${product.isAuction ? (product.currentBid || product.minimumBid || 0) : product.price}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded ${
          product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          product.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
          product.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {product.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(product.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/products/${product.id}`)}
            className="text-blue-600 hover:text-blue-900"
            title="View Product"
          >
            <Eye className="w-4 h-4" />
          </button>
          {product.status === 'DRAFT' && (
            <>
              <button
                onClick={() => handleProductAction(product.id, 'approve')}
                className="text-green-600 hover:text-green-900"
                title="Approve Product"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleProductAction(product.id, 'reject')}
                className="text-red-600 hover:text-red-900"
                title="Reject Product"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {product.status === 'ACTIVE' && (
            <button
              onClick={() => handleProductAction(product.id, 'suspend')}
              className="text-orange-600 hover:text-orange-900"
              title="Suspend Product"
            >
              <Ban className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )

  const CategoryRow = ({ category }: { category: Category }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {category.imageUrl && (
            <img src={category.imageUrl} alt={category.name} className="w-10 h-10 rounded object-cover mr-3" />
          )}
          <div>
            <div className="text-sm font-medium text-gray-900">{category.name}</div>
            {category.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">{category.description}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {category.parent?.name || 'Root Category'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {category.children?.length || 0} subcategories
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(category.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit Category"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCategory(category.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
          trend={`+${stats.newUsersToday} today`}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="bg-green-500"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Platform Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">Pending Products</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-2">{stats.pendingProducts}</p>
          <p className="text-sm text-yellow-700">Products awaiting approval</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Reported Products</h3>
          </div>
          <p className="text-2xl font-bold text-red-900 mt-2">{stats.reportedProducts}</p>
          <p className="text-sm text-red-700">Products with reports</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-blue-800">Active Auctions</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{stats.activeAuctions}</p>
          <p className="text-sm text-blue-700">Currently running auctions</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className="btn btn-outline"
          >
            <Users className="w-5 h-5 mr-2" />
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className="btn btn-outline"
          >
            <Package className="w-5 h-5 mr-2" />
            Review Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className="btn btn-outline"
          >
            <Plus className="w-5 h-5 mr-2" />
            Manage Categories
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className="btn btn-outline"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            View Orders
          </button>
        </div>
      </div>
    </div>
  )

  const UsersTab = () => {
    const filteredUsers = users.filter(user => {
      const matchesSearch = user.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                           user.lastName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                           user.email.toLowerCase().includes(userSearch.toLowerCase())
      
      let matchesStatus = true
      let matchesType = true
      let matchesRole = true
      
      if (selectedUserStatus) {
        switch (selectedUserStatus) {
          case 'verified':
            matchesStatus = user.verified ?? false
            break
          case 'unverified':
            matchesStatus = !(user.verified ?? true)
            break
          case 'ADMIN':
          case 'MODERATOR':
            matchesStatus = user.role === selectedUserStatus
            break
          case 'REGULAR_BUYER':
            matchesStatus = user.role === UserRole.BUYER && !(user.isEnterprise ?? false)
            break
          case 'REGULAR_VENDOR':
            matchesStatus = user.role === UserRole.VENDOR && !(user.isEnterprise ?? false)
            break
          case 'ENTERPRISE_BUYER':
            matchesStatus = user.role === UserRole.BUYER && (user.isEnterprise ?? false)
            break
          case 'ENTERPRISE_VENDOR':
            matchesStatus = user.role === UserRole.VENDOR && (user.isEnterprise ?? false)
            break
          case 'ALL_BUYERS':
            matchesStatus = user.role === UserRole.BUYER
            break
          case 'ALL_VENDORS':
            matchesStatus = user.role === UserRole.VENDOR
            break
          default:
            matchesStatus = true
        }
      }

      // New filtering logic for user type
      if (selectedUserType) {
        matchesType = selectedUserType === 'Enterprise' ? (user.isEnterprise ?? false) : !(user.isEnterprise ?? false)
      }

      // New filtering logic for user role
      if (selectedUserRole) {
        matchesRole = selectedUserRole === 'Buyer' ? user.role === UserRole.BUYER : user.role === UserRole.VENDOR
      }

      return matchesSearch && matchesStatus && matchesType && matchesRole
    })

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">User Management</h2>
          <div className="flex space-x-4">
            <select
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Regular">Regular</option>
              <option value="Enterprise">Enterprise</option>
            </select>
            <select
              value={selectedUserRole}
              onChange={(e) => setSelectedUserRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="Buyer">Buyer</option>
              <option value="Vendor">Vendor</option>
            </select>
            <select
              value={selectedUserStatus}
              onChange={(e) => setSelectedUserStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              <option value="REGULAR_BUYER">Regular Buyers</option>
              <option value="ENTERPRISE_BUYER">Enterprise Buyers</option>
              <option value="REGULAR_VENDOR">Regular Vendors</option>
              <option value="ENTERPRISE_VENDOR">Enterprise Vendors</option>
              <option value="ALL_BUYERS">All Buyers</option>
              <option value="ALL_VENDORS">All Vendors</option>
              <option value="ADMIN">Admins</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const ProductsTab = () => {
    const filteredProducts = products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                           product.owner?.email.toLowerCase().includes(productSearch.toLowerCase())
      const matchesStatus = !selectedStatus || product.status === selectedStatus
      return matchesSearch && matchesStatus
    })

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Product Management</h2>
          <div className="flex space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="SOLD">Sold</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const CategoriesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Category Management</h2>
        <button
          onClick={() => navigate('/admin/categories/create')}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subcategories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const OrdersTab = () => {
    const filteredOrders = orders.filter(order => {
      const matchesSearch = order.product?.title.toLowerCase().includes(orderSearch.toLowerCase()) ||
                           order.buyer?.firstName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                           order.buyer?.lastName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                           order.buyer?.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
                           order.seller?.firstName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                           order.seller?.lastName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                           order.seller?.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
                           order.id.toLowerCase().includes(orderSearch.toLowerCase())
      
      const matchesStatus = !selectedOrderStatus || order.status === selectedOrderStatus
      
      return matchesSearch && matchesStatus
    })

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Order Management</h2>
          <div className="flex space-x-4">
            <select
              value={selectedOrderStatus}
              onChange={(e) => setSelectedOrderStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search orders..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.product?.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.buyer?.firstName} {order.buyer?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.seller?.firstName} {order.seller?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${order.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      order.status === 'REFUNDED' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Package },
    { id: 'orders', label: 'Orders', icon: TrendingUp },
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your VoltBay marketplace</p>
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
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'products' && <ProductsTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'orders' && <OrdersTab />}
    </div>
  )
} 