import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Package } from 'lucide-react'
import { toast } from 'react-toastify'
// import { useAuthStore } from '../../store/authStore'
import apiService from '../../services/api'
import type { Product, PaginatedResponse } from '@shared/dist'
// import { ProductStatus } from '@shared/dist'

// Define enum locally to avoid import issues
enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  EXPIRED = 'EXPIRED',
  SUSPENDED = 'SUSPENDED'
}
import SEO from '../../components/SEO'

export default function MyProductsPage() {
  const navigate = useNavigate()
  // const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'ALL'>('ALL')

  useEffect(() => {
    fetchProducts()
  }, [currentPage, statusFilter])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      })
      
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter)
      }

      const response = await apiService.get<PaginatedResponse<Product>>(`/api/products/user/my-products?${params}`)
      
      if (response.data) {
        setProducts(response.data)
        setTotalPages(response.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load your products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await apiService.delete(`/api/products/${productId}`)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-square bg-gray-200 overflow-hidden">
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
            product.status === ProductStatus.ACTIVE ? 'bg-green-100 text-green-800' :
            product.status === ProductStatus.SOLD ? 'bg-blue-100 text-blue-800' :
            product.status === ProductStatus.DRAFT ? 'bg-yellow-100 text-yellow-800' :
            product.status === ProductStatus.EXPIRED ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {product.status}
          </span>
        </div>

        {product.isAuction && product.auctionEndDate && (
          <div className="mb-3">
            <span className={`px-2 py-1 rounded text-xs ${
              new Date(product.auctionEndDate) > new Date() 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {new Date(product.auctionEndDate) > new Date() ? 'Active Auction' : 'Auction Ended'}
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Ends: {new Date(product.auctionEndDate).toLocaleDateString()}
            </p>
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

  const StatusFilter = () => (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Products
        </button>
        <button
          onClick={() => setStatusFilter(ProductStatus.ACTIVE)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === ProductStatus.ACTIVE
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setStatusFilter(ProductStatus.DRAFT)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === ProductStatus.DRAFT
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Draft
        </button>
        <button
          onClick={() => setStatusFilter(ProductStatus.SOLD)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === ProductStatus.SOLD
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Sold
        </button>
      </div>
    </div>
  )

  const Pagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <div className="flex space-x-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded-md ${
                currentPage === i + 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="My Products - VoltBay"
        description="Manage your products on VoltBay marketplace"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <button
            onClick={() => navigate('/sell')}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Listing
          </button>
        </div>

        <StatusFilter />

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination />
          </>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter === 'ALL' ? 'No products yet' : `No ${statusFilter.toLowerCase()} products`}
            </h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === 'ALL'
                ? 'Start selling your solar products today'
                : `You don't have any ${statusFilter.toLowerCase()} products`
              }
            </p>
            <button
              onClick={() => navigate('/sell')}
              className="btn btn-primary"
            >
              Create Your First Listing
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 