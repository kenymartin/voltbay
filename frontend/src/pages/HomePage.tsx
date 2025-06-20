import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react'
import SEO from '../components/SEO'
import ProductCarousel from '../components/ProductCarousel'
import ProductCarouselSkeleton from '../components/ProductCarouselSkeleton'
import apiService from '../services/api'

// Define types locally to avoid import issues
interface Product {
  id: string
  title: string
  price: number
  imageUrls?: string[]
  isAuction?: boolean
  auctionEndDate?: string | Date
  owner?: {
    firstName?: string
    lastName?: string
  }
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const featuredCategories = [
    {
      name: 'Solar Panels',
      description: 'High-efficiency photovoltaic panels',
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      count: '1,234 products'
    },
    {
      name: 'Inverters',
      description: 'Power conversion systems',
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      count: '567 products'
    },
    {
      name: 'Batteries',
      description: 'Energy storage solutions',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      count: '890 products'
    },
    {
      name: 'Mounting Systems',
      description: 'Installation hardware',
      image: 'https://images.unsplash.com/photo-1622541948011-8c8b76bb8b63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      count: '345 products'
    }
  ]

  // Mock data as fallback
  const mockFeaturedProducts = [
    {
      id: '1',
      title: 'High-Efficiency 400W Solar Panel',
      price: 299.99,
      originalPrice: 349.99,
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      reviews: 124,
      seller: 'SolarTech Pro',
      isAuction: false
    },
    {
      id: '2',
      title: '5kW String Inverter - Premium Grade',
      price: 1299.99,
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reviews: 89,
      seller: 'PowerSolutions',
      isAuction: true,
      timeLeft: '2d 14h'
    },
    {
      id: '3',
      title: 'Tesla Powerwall 2 - Like New',
      price: 8999.99,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      rating: 5.0,
      reviews: 45,
      seller: 'EnergyHub',
      isAuction: false
    },
    {
      id: '4',
      title: 'Complete Solar Kit 10kW System',
      price: 12999.99,
      originalPrice: 15999.99,
      image: 'https://images.unsplash.com/photo-1622541948011-8c8b76bb8b63?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      reviews: 67,
      seller: 'SolarComplete',
      isAuction: false
    },
    {
      id: '5',
      title: 'Microinverter Set - 20 Units',
      price: 2499.99,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      rating: 4.6,
      reviews: 156,
      seller: 'MicroPower',
      isAuction: false
    },
    {
      id: '6',
      title: 'Solar Charge Controller MPPT 60A',
      price: 189.99,
      originalPrice: 229.99,
      image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      rating: 4.5,
      reviews: 203,
      seller: 'ChargeMax',
      isAuction: true,
      timeLeft: '1d 8h'
    },
    {
      id: '7',
      title: 'Flexible Solar Panel 100W',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1564419434-d6b63c27fac5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      rating: 4.4,
      reviews: 89,
      seller: 'FlexSolar',
      isAuction: false
    },
    {
      id: '8',
      title: 'Solar Monitoring System Pro',
      price: 399.99,
      image: 'https://images.unsplash.com/photo-1471219743851-c4df8b6ee585?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      reviews: 76,
      seller: 'MonitorTech',
      isAuction: false
    }
  ]

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      // Try to fetch real products from API
      const response = await apiService.get<ApiResponse<Product[]>>('/api/products/search?limit=8&status=ACTIVE')
      
      if (response.success && response.data) {
        // Handle nested response structure
        const products = Array.isArray(response.data) ? response.data : (response.data as any).products || []
        
        if (products.length > 0) {
          // Transform API products to match carousel interface
          const transformedProducts = products.map((product: Product) => ({
            id: product.id,
            title: product.title,
            price: parseFloat(product.price.toString()),
            image: product.imageUrls?.[0] || 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
            rating: 4.5, // Default rating since we don't have reviews yet
            reviews: Math.floor(Math.random() * 200) + 10, // Random reviews for demo
            seller: product.owner?.firstName ? `${product.owner.firstName} ${product.owner.lastName}` : 'VoltBay Seller',
            isAuction: product.isAuction || false,
            timeLeft: product.isAuction && product.auctionEndDate ? 
              calculateTimeLeft(product.auctionEndDate) : undefined
          }))
          
          setFeaturedProducts(transformedProducts)
        } else {
          // If no real products, use mock data but mark them as mock
          const mockProductsWithFlag = mockFeaturedProducts.map(product => ({
            ...product,
            isMock: true
          }))
          setFeaturedProducts(mockProductsWithFlag)
        }
      } else {
        // Fallback to mock data if API fails
        const mockProductsWithFlag = mockFeaturedProducts.map(product => ({
          ...product,
          isMock: true
        }))
        setFeaturedProducts(mockProductsWithFlag)
      }
    } catch (error) {
      console.error('Failed to fetch featured products:', error)
      // Fallback to mock data
      const mockProductsWithFlag = mockFeaturedProducts.map(product => ({
        ...product,
        isMock: true
      }))
      setFeaturedProducts(mockProductsWithFlag)
    } finally {
      setLoading(false)
    }
  }

  const calculateTimeLeft = (endDate: string | Date) => {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h`
    } else {
      return `${hours}h`
    }
  }

  return (
    <div className="min-h-screen">
      <SEO 
        title="Solar Products Marketplace - Buy, Sell & Auction Solar Equipment"
        description="Discover the world's largest marketplace for solar products. Find solar panels, inverters, batteries, and complete systems. Buy directly or participate in auctions for the best deals on renewable energy equipment."
        keywords="solar panels, solar marketplace, solar equipment auction, photovoltaic panels, solar inverters, solar batteries, renewable energy, clean energy marketplace, solar deals"
        url={window.location.href}
        type="website"
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Power Your Future with
                <span className="text-accent-400"> Solar</span>
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                The world's largest marketplace for solar products. Buy, sell, and auction 
                solar panels, inverters, batteries, and complete systems.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Browse Products
                </Link>
                <Link
                  to="/auctions"
                  className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold"
                >
                  View Auctions
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">50K+</div>
                    <div className="text-primary-200">Products Listed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">15K+</div>
                    <div className="text-primary-200">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">99.8%</div>
                    <div className="text-primary-200">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-primary-200">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose VoltBay?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a secure, efficient, and comprehensive platform for all your solar needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure Transactions</h3>
              <p className="text-gray-600">
                Advanced encryption and buyer protection ensure your transactions are safe and secure.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Quality Verified</h3>
              <p className="text-gray-600">
                All products are verified for quality and authenticity by our expert team.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Best Prices</h3>
              <p className="text-gray-600">
                Competitive pricing through auctions and direct sales from verified sellers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600">
              Find exactly what you need for your solar project
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCategories.map((category, index) => (
              <Link
                key={index}
                to={`/search?category=${encodeURIComponent(category.name)}`}
                className="group card hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <p className="text-primary-600 font-medium text-sm">{category.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">
                Handpicked deals and trending items
              </p>
            </div>
            <Link
              to="/search"
              className="btn-outline flex items-center"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <ProductCarouselSkeleton />
          ) : (
            <ProductCarousel 
              products={featuredProducts}
              autoPlay={true}
              autoPlayInterval={50000}
              showDots={false}
              itemsPerView={{
                mobile: 1,
                tablet: 2,
                desktop: 4
              }}
            />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Go Solar?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-3xl mx-auto">
            Join thousands of satisfied customers who have found their perfect solar solutions on VoltBay.
            Start your renewable energy journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              Get Started Free
            </Link>
            <Link
              to="/search"
              className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 