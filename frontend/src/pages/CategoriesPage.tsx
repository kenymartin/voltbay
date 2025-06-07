import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ChevronRight, Search, Grid, List, Filter } from 'lucide-react'
import apiService from '../services/api'
import type { Category, ApiResponse } from '../../../shared/types'
import SEO from '../components/SEO'

export default function CategoriesPage() {
  const navigate = useNavigate()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await apiService.get<ApiResponse<{ categories: Category[] }>>('/api/categories')
      setCategories(response.data?.categories || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Separate main categories (no parent) and subcategories
  const mainCategories = filteredCategories.filter(cat => !cat.parentId)
  const subcategoriesMap = filteredCategories.reduce((acc, cat) => {
    if (cat.parentId) {
      if (!acc[cat.parentId]) acc[cat.parentId] = []
      acc[cat.parentId].push(cat)
    }
    return acc
  }, {} as Record<string, Category[]>)

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/products?category=${categoryId}`)
  }

  const CategoryCard = ({ category, isSubcategory = false }: { category: Category; isSubcategory?: boolean }) => {
    const subcategories = subcategoriesMap[category.id] || []
    const productCount = (category as any)._count?.products || 0
    
    return (
      <div 
        className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group ${
          isSubcategory ? 'border-l-4 border-blue-500' : ''
        }`}
        onClick={() => handleCategoryClick(category.id)}
      >
        {category.imageUrl && (
          <div className="aspect-video bg-gray-200 overflow-hidden">
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors ${
              isSubcategory ? 'text-lg' : 'text-xl'
            }`}>
              {category.name}
            </h3>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          
          {category.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Package className="w-4 h-4 mr-1" />
              <span>{productCount} products</span>
            </div>
            
            {subcategories.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {subcategories.length} subcategories
              </span>
            )}
          </div>
          
          {/* Show subcategories preview */}
          {subcategories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {subcategories.slice(0, 3).map((sub) => (
                  <span
                    key={sub.id}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCategoryClick(sub.id)
                    }}
                  >
                    {sub.name}
                  </span>
                ))}
                {subcategories.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{subcategories.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const CategoryListItem = ({ category }: { category: Category }) => {
    const subcategories = subcategoriesMap[category.id] || []
    const productCount = (category as any)._count?.products || 0
    
    return (
      <div 
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer group"
        onClick={() => handleCategoryClick(category.id)}
      >
        <div className="flex items-center space-x-4">
          {category.imageUrl && (
            <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            
            {category.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-1">
                {category.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Package className="w-4 h-4 mr-1" />
                <span>{productCount} products</span>
                {subcategories.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{subcategories.length} subcategories</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Subcategories in list view */}
            {subcategories.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {subcategories.slice(0, 5).map((sub) => (
                  <span
                    key={sub.id}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCategoryClick(sub.id)
                    }}
                  >
                    {sub.name}
                  </span>
                ))}
                {subcategories.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{subcategories.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO 
        title="Browse Categories - VoltBay Solar Marketplace"
        description="Explore all solar equipment categories on VoltBay. Find solar panels, inverters, batteries, mounting systems and more."
        keywords="solar categories, solar panels, inverters, batteries, mounting systems, solar equipment"
        url={window.location.href}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Categories</h1>
        <p className="text-lg text-gray-600">
          Discover solar equipment organized by category. Find exactly what you need for your solar installation.
        </p>
      </div>

      {/* Search and Controls */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredCategories.length} categories
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid/List */}
      {mainCategories.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search terms.' : 'Categories will appear here once they are added.'}
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {mainCategories.map((category) => (
            viewMode === 'grid' ? (
              <CategoryCard key={category.id} category={category} />
            ) : (
              <CategoryListItem key={category.id} category={category} />
            )
          ))}
        </div>
      )}

      {/* Featured Subcategories */}
      {searchQuery === '' && Object.keys(subcategoriesMap).length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Subcategories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(subcategoriesMap).flat().slice(0, 8).map((subcategory) => (
              <CategoryCard 
                key={subcategory.id} 
                category={subcategory} 
                isSubcategory={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 