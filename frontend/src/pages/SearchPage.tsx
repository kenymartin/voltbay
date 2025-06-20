import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react'
import apiService from '../services/api'
import type { Product, Category, ProductSearchParams, ProductCondition, ApiResponse, PaginatedResponse } from '@shared/dist'
// import { ProductSortBy, SortOrder } from '@shared/dist'

// Define enums locally to avoid import issues
enum ProductSortBy {
  CREATED_AT = 'createdAt',
  PRICE = 'price',
  TITLE = 'title',
  ENDING_SOON = 'endingSoon'
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}
// import SEO from '../components/SEO'
// import AddToCartButton from '../components/AddToCartButton'
import { getSafeImageUrls, handleImageError } from '../utils/imageUtils'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [condition, setCondition] = useState<ProductCondition | ''>(searchParams.get('condition') as ProductCondition || '')
  const [isAuction, setIsAuction] = useState<boolean | null>(
    searchParams.get('auction') === 'true' ? true : 
    searchParams.get('auction') === 'false' ? false : null
  )
  const [sortBy, setSortBy] = useState<ProductSortBy>(searchParams.get('sortBy') as ProductSortBy || ProductSortBy.CREATED_AT)
  const [sortOrder, setSortOrder] = useState<SortOrder>(searchParams.get('sortOrder') as SortOrder || SortOrder.DESC)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    searchProducts()
  }, [searchQuery, selectedCategory, minPrice, maxPrice, condition, isAuction, sortBy, sortOrder, currentPage])

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (condition) params.set('condition', condition)
    if (isAuction !== null) params.set('auction', isAuction.toString())
    if (sortBy !== ProductSortBy.CREATED_AT) params.set('sortBy', sortBy)
    if (sortOrder !== SortOrder.DESC) params.set('sortOrder', sortOrder)
    if (currentPage > 1) params.set('page', currentPage.toString())
    
    setSearchParams(params)
  }, [searchQuery, selectedCategory, minPrice, maxPrice, condition, isAuction, sortBy, sortOrder, currentPage, setSearchParams])

  const fetchCategories = async () => {
    try {
      const response = await apiService.get<ApiResponse<{ categories: Category[] }>>('/api/categories')
      setCategories(response.data?.categories || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const searchProducts = async () => {
    setLoading(true)
    try {
      const searchParams: ProductSearchParams = {
        query: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        condition: condition || undefined,
        isAuction: isAuction ?? undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 12
      }

      const queryString = new URLSearchParams(
        Object.entries(searchParams).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value.toString()
          }
          return acc
        }, {} as Record<string, string>)
      ).toString()

      const response = await apiService.get<PaginatedResponse<Product>>(`/api/products/search?${queryString}`)
      setProducts(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
      setTotalResults(response.pagination?.total || 0)
    } catch (error) {
      console.error('Failed to search products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    searchProducts()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setMinPrice('')
    setMaxPrice('')
    setCondition('')
    setIsAuction(null)
    setSortBy(ProductSortBy.CREATED_AT)
    setSortOrder(SortOrder.DESC)
    setCurrentPage(1)
  }

  const ProductCard = ({ product }: { product: Product }) => {
    const isAuctionActive = product.isAuction && product.auctionEndDate && new Date(product.auctionEndDate) > new Date()
    
    return (
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className="aspect-square bg-gray-200 overflow-hidden">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <img
              src={getSafeImageUrls(product.imageUrls, product.category?.name)[0]}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => handleImageError(e, product.category?.name)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
          <p className="text-sm text-gray-600 mb-2">{product.category?.name}</p>
          
          <div className="flex justify-between items-center mb-2">
            {product.isAuction ? (
              <div>
                <span className="text-lg font-bold text-green-600">
                  ${product.currentBid || product.minimumBid || 0}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {isAuctionActive ? 'Current bid' : 'Final bid'}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-green-600">${product.price}</span>
            )}
            
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {product.condition.replace('_', ' ')}
            </span>
          </div>
          
          {product.isAuction && (
            <div className="flex items-center justify-between text-sm">
              <span className={`px-2 py-1 rounded text-xs ${
                isAuctionActive ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isAuctionActive ? 'Active Auction' : 'Auction Ended'}
              </span>
              {product.buyNowPrice && (
                <span className="text-blue-600 font-medium">Buy Now: ${product.buyNowPrice}</span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Solar Products</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for solar panels, batteries, inverters..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary px-6"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline px-4"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="$0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ProductCondition)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Condition</option>
                  <option value="NEW">New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Auction Filter */}
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="auctionType"
                    checked={isAuction === null}
                    onChange={() => setIsAuction(null)}
                    className="mr-2"
                  />
                  All
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="auctionType"
                    checked={isAuction === true}
                    onChange={() => setIsAuction(true)}
                    className="mr-2"
                  />
                  Auctions
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="auctionType"
                    checked={isAuction === false}
                    onChange={() => setIsAuction(false)}
                    className="mr-2"
                  />
                  Buy Now
                </label>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as ProductSortBy)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={ProductSortBy.CREATED_AT}>Newest</option>
                  <option value={ProductSortBy.PRICE}>Price</option>
                  <option value={ProductSortBy.TITLE}>Name</option>
                  <option value={ProductSortBy.ENDING_SOON}>Ending Soon</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={SortOrder.DESC}>High to Low</option>
                  <option value={SortOrder.ASC}>Low to High</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">
            {loading ? 'Searching...' : `${totalResults} results found`}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-300"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-md ${
                        page === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
          <button
            onClick={clearFilters}
            className="btn btn-primary"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
} 