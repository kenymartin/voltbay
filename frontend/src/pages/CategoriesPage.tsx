import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ArrowRight, Grid, List, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import apiService from '../services/api'
import SEO from '../components/SEO'
import type { Category, ApiResponse } from '@shared/dist'

export default function CategoriesPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // Filter categories based on search query
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories)
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredCategories(filtered)
    }
  }, [categories, searchQuery])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await apiService.get<ApiResponse<{ categories: Category[] }>>('/api/categories')
      if (response.success && response.data) {
        const categoryData = Array.isArray(response.data.categories) ? response.data.categories : []
        setCategories(categoryData)
        setFilteredCategories(categoryData)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
      setCategories([])
      setFilteredCategories([])
    } finally {
      setLoading(false)
    }
  }

  // const handleCategoryClick = (categoryId: string) => {
  //   navigate(`/products?category=${categoryId}`)
  // }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-300 rounded-lg h-48"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // const parentCategories = categories.filter(cat => !cat.parentId)
  // const getChildCategories = (parentId: string) => 
  //   categories.filter(cat => cat.parentId === parentId)

  /*
  const CategoryCard = ({ category }: { category: Category }) => {
    const childCategories = getChildCategories(category.id)
    const productCount = (category as any)._count?.products || 0

    return (
      <div
        onClick={() => handleCategoryClick(category.id)}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      >
        <div className="aspect-video bg-gray-200 overflow-hidden">
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
            {category.name}
          </h3>
          
          {category.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {category.description}
            </p>
          )}
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {productCount} product{productCount !== 1 ? 's' : ''}
              {childCategories.length > 0 && (
                <span className="ml-2">
                  • {childCategories.length} subcategor{childCategories.length !== 1 ? 'ies' : 'y'}
                </span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
          </div>
          
          {childCategories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Subcategories:</p>
              <div className="flex flex-wrap gap-1">
                {childCategories.slice(0, 3).map((child) => (
                  <span
                    key={child.id}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {child.name}
                  </span>
                ))}
                {childCategories.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{childCategories.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  */

  /*
  const CategoryListItem = ({ category }: { category: Category }) => {
    const childCategories = getChildCategories(category.id)
    const productCount = (category as any)._count?.products || 0

    return (
      <div
        onClick={() => handleCategoryClick(category.id)}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group"
      >
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>
            
            {category.description && (
              <p className="text-gray-600 text-sm mb-2">
                {category.description}
              </p>
            )}
            
            <div className="text-sm text-gray-500">
              {productCount} product{productCount !== 1 ? 's' : ''}
              {childCategories.length > 0 && (
                <span className="ml-2">
                  • {childCategories.length} subcategor{childCategories.length !== 1 ? 'ies' : 'y'}
                </span>
              )}
            </div>
            
            {childCategories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {childCategories.slice(0, 5).map((child) => (
                  <span
                    key={child.id}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {child.name}
                  </span>
                ))}
                {childCategories.length > 5 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{childCategories.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </div>
      </div>
    )
  }
  */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO 
        title="Categories - VoltBay"
        description="Browse all solar equipment categories on VoltBay marketplace"
        url={window.location.href}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
        <p className="text-gray-600">Explore our comprehensive range of solar equipment by category</p>
      </div>

      {/* Search and Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 flex items-center space-x-2 ${
              viewMode === 'grid' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 flex items-center space-x-2 ${
              viewMode === 'list' 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredCategories.length === 0 
              ? `No categories found for "${searchQuery}"` 
              : `Found ${filteredCategories.length} ${filteredCategories.length === 1 ? 'category' : 'categories'} for "${searchQuery}"`
            }
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-video bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No categories found' : 'No categories available'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? `Try adjusting your search terms or browse all categories.` 
              : 'Categories will appear here once they are added to the system.'
            }
          </p>
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="btn btn-primary"
            >
              View All Categories
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }>
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => navigate(`/products?category=${category.id}`)}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${
                viewMode === 'list' ? 'flex items-center' : ''
              }`}
            >
              {/* Category Image */}
              <div className={`bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center ${
                viewMode === 'grid' ? 'aspect-video' : 'w-24 h-24 flex-shrink-0'
              }`}>
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-12 h-12 text-primary-400" />
                )}
              </div>
              
              {/* Category Info */}
              <div className={viewMode === 'grid' ? 'p-4' : 'flex-1 p-4'}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
                
                {category.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    View Products
                  </span>
                  <div className="text-xs text-gray-400">
                    Click to browse →
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {!loading && filteredCategories.length > 0 && !searchQuery && (
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Showing all {filteredCategories.length} categories
          </p>
        </div>
      )}
    </div>
  )
} 