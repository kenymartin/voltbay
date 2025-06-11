import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clock, Gavel, Eye, Search, Filter, Star, Calendar, TrendingUp } from 'lucide-react'
import apiService from '../services/api'
import type { Product, Category, ProductCondition, ApiResponse, PaginatedResponse } from '../../../shared/types'
import { ProductSortBy, SortOrder } from '../../../shared/types'
import SEO from '../components/SEO'

export default function AuctionsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [auctions, setAuctions] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [condition, setCondition] = useState<ProductCondition | ''>(searchParams.get('condition') as ProductCondition || '')
  const [sortBy, setSortBy] = useState<ProductSortBy>(searchParams.get('sortBy') as ProductSortBy || ProductSortBy.ENDING_SOON)
  const [sortOrder, setSortOrder] = useState<SortOrder>(searchParams.get('sortOrder') as SortOrder || SortOrder.ASC)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    searchAuctions()
  }, [searchQuery, selectedCategory, minPrice, maxPrice, condition, sortBy, sortOrder, currentPage])

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (condition) params.set('condition', condition)
    if (sortBy !== ProductSortBy.ENDING_SOON) params.set('sortBy', sortBy)
    if (sortOrder !== SortOrder.ASC) params.set('sortOrder', sortOrder)
    if (currentPage > 1) params.set('page', currentPage.toString())
    
    setSearchParams(params)
  }, [searchQuery, selectedCategory, minPrice, maxPrice, condition, sortBy, sortOrder, currentPage, setSearchParams])

  const fetchCategories = async () => {
    try {
      const response = await apiService.get<ApiResponse<{ categories: Category[] }>>('/api/categories')
      setCategories(response.data?.categories || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const searchAuctions = async () => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams({
        isAuction: 'true', // Only show auctions
        query: searchQuery || '',
        categoryId: selectedCategory || '',
        minPrice: minPrice || '',
        maxPrice: maxPrice || '',
        condition: condition || '',
        sortBy: sortBy,
        sortOrder: sortOrder,
        page: currentPage.toString(),
        limit: '12'
      })

      // Remove empty parameters
      for (const [key, value] of [...searchParams.entries()]) {
        if (!value || value === '') {
          searchParams.delete(key)
        }
      }

      const response = await apiService.get<{ success: boolean; data: { products: Product[]; pagination: any } }>(`/api/products/search?${searchParams.toString()}`)
      setAuctions(response.data?.products || [])
      setTotalPages(response.data?.pagination?.pages || 1)
      setTotalResults(response.data?.pagination?.total || 0)
    } catch (error) {
      console.error('Failed to search auctions:', error)
      setAuctions([])
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setMinPrice('')
    setMaxPrice('')
    setCondition('')
    setSortBy(ProductSortBy.ENDING_SOON)
    setSortOrder(SortOrder.ASC)
    setCurrentPage(1)
  }

  const AuctionCard = ({ auction }: { auction: Product }) => {
    const [timeLeft, setTimeLeft] = useState('')
    const isActive = auction.auctionEndDate && new Date(auction.auctionEndDate) > new Date()
    
    useEffect(() => {
      if (!auction.auctionEndDate) return

      const timer = setInterval(() => {
        const now = new Date().getTime()
        const endTime = new Date(auction.auctionEndDate!).getTime()
        const distance = endTime - now

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24))
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)

          if (days > 0) {
            setTimeLeft(`${days}d ${hours}h ${minutes}m`)
          } else if (hours > 0) {
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
          } else {
            setTimeLeft(`${minutes}m ${seconds}s`)
          }
        } else {
          setTimeLeft('Ended')
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }, [auction.auctionEndDate])
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <div className="aspect-square bg-gray-200 overflow-hidden">
            {auction.imageUrls && auction.imageUrls.length > 0 ? (
              <img
                src={auction.imageUrls[0]}
                alt={auction.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            )}
          </div>
          
          {/* Auction Status Badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${
            isActive 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-500 text-white'
          }`}>
            <Clock className="w-4 h-4 inline mr-1" />
            {timeLeft || 'Calculating...'}
          </div>

          {/* Buy Now Badge */}
          {auction.buyNowPrice && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              Buy Now Available
            </div>
          )}
        </div>
        
        <div className="p-5">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{auction.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{auction.category?.name}</p>
          
          {/* Current Bid */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Bid:</span>
              <span className="text-xl font-bold text-green-600">
                ${auction.currentBid || auction.minimumBid || 0}
              </span>
            </div>
            
            {auction.buyNowPrice && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Buy Now:</span>
                <span className="text-lg font-semibold text-blue-600">
                  ${auction.buyNowPrice}
                </span>
              </div>
            )}
          </div>

          {/* Condition */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {auction.condition.replace('_', ' ')}
            </span>
            <span className={`text-sm font-medium ${
              isActive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isActive ? 'Active' : 'Ended'}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => navigate(`/products/${auction.id}`)}
              className="w-full btn btn-primary"
            >
              <Gavel className="w-4 h-4 mr-2" />
              {isActive ? 'Place Bid' : 'View Results'}
            </button>
            
            {isActive && auction.buyNowPrice && (
              <button
                onClick={() => navigate(`/products/${auction.id}`)}
                className="w-full btn btn-outline"
              >
                Buy Now - ${auction.buyNowPrice}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Solar Equipment Auctions - Bid on Solar Panels & Inverters"
        description="Participate in live auctions for solar equipment. Find great deals on solar panels, inverters, batteries, and complete systems. Real-time bidding with countdown timers."
        keywords="solar auctions, solar panel auctions, solar equipment bidding, renewable energy auctions, solar inverter auctions, solar battery auctions"
        url={window.location.href}
        type="website"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Live Auctions</h1>
          <p className="text-gray-600">Bid on solar equipment and get the best deals</p>
          
          {/* Search Form */}
          <form onSubmit={(e) => { e.preventDefault(); searchAuctions() }} className="flex gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search auctions..."
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
              <Filter className="w-5 h-5" />
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mt-4 space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Bid</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="$0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Bid</label>
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
                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as ProductSortBy)}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={ProductSortBy.ENDING_SOON}>Ending Soon</option>
                    <option value={ProductSortBy.CREATED_AT}>Newest</option>
                    <option value={ProductSortBy.PRICE}>Current Bid</option>
                    <option value={ProductSortBy.TITLE}>Name</option>
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
              {loading ? 'Loading...' : `${totalResults} active auctions`}
            </p>
          </div>
        </div>

        {/* Auctions Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-300"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : auctions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
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
              <Gavel className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active auctions found</h3>
            <p className="text-gray-600 mb-4">Check back later for new auction listings</p>
            <button
              onClick={clearFilters}
              className="btn btn-primary"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 