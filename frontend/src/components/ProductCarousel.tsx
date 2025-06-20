import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { getSafeImageUrl } from '../utils/imageUtils'

interface Product {
  id: string
  title: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  seller: string
  isAuction: boolean
  timeLeft?: string
  isMock?: boolean
}

interface ProductCarouselProps {
  products: Product[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showDots?: boolean
  itemsPerView?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

export default function ProductCarousel({ 
  products, 
  autoPlay = true, 
  autoPlayInterval = 8000,
  // showDots = true, // unused parameter
  itemsPerView = { mobile: 1, tablet: 2, desktop: 4 }
}: ProductCarouselProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [itemsToShow, setItemsToShow] = useState(itemsPerView.desktop)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [translateX, setTranslateX] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  // Duplicate products for infinite scroll
  const duplicatedProducts = [...products, ...products, ...products]

  // Responsive items per view
  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(itemsPerView.mobile)
      } else if (window.innerWidth < 1024) {
        setItemsToShow(itemsPerView.tablet)
      } else {
        setItemsToShow(itemsPerView.desktop)
      }
    }

    updateItemsToShow()
    window.addEventListener('resize', updateItemsToShow)
    return () => window.removeEventListener('resize', updateItemsToShow)
  }, [itemsPerView])

  // Continuous auto-scroll animation
  useEffect(() => {
    if (!autoPlay || isHovered || products.length === 0) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const speed = 0.01 * (10000 / autoPlayInterval) // Adjust speed based on interval (lower interval = faster)
    let lastTime = 0

    const animate = (currentTime: number) => {
      if (lastTime === 0) lastTime = currentTime
      
      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      setTranslateX(prev => {
        const newTranslateX = prev - (speed * deltaTime)
        // Reset position when we've scrolled through one full set of products
        const resetPoint = -(100 / 3) // Since we have 3 sets of products
        return newTranslateX <= resetPoint ? 0 : newTranslateX
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [autoPlay, isHovered, products.length, autoPlayInterval])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      // Speed up temporarily
      setTranslateX(prev => prev - 10)
    } else if (isRightSwipe) {
      // Slow down temporarily  
      setTranslateX(prev => prev + 10)
    }
  }

  // Handle image loading errors
  const handleImageError = (productId: string) => {
    setImageErrors(prev => new Set([...prev, productId]))
  }

  // Get fallback image for failed loads
  const getImageSrc = (product: Product) => {
    // Use the new utility function to get safe image URL
    return getSafeImageUrl(product.image, 'solar')
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products available</p>
      </div>
    )
  }

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div 
        ref={carouselRef}
        className="overflow-hidden rounded-lg"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex"
          style={{ 
            transform: `translateX(${translateX}%)`,
            width: `${duplicatedProducts.length * (100 / itemsToShow)}%`,
            animation: !isHovered && autoPlay ? 'none' : undefined
          }}
        >
          {duplicatedProducts.map((product, index) => (
            <div 
              key={`${product.id}-${index}`}
              className={`flex-shrink-0 px-3`}
              style={{ width: `${100 / duplicatedProducts.length}%` }}
            >
              <Link
                to={product.isMock ? '/search' : `/product/${product.id}`}
                className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={getImageSrc(product)}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={() => handleImageError(product.id)}
                    onLoad={(_e) => {
                      // Remove from error set if image loads successfully after retry
                      if (imageErrors.has(product.id)) {
                        setImageErrors(prev => {
                          const newSet = new Set(prev)
                          newSet.delete(product.id)
                          return newSet
                        })
                      }
                    }}
                  />
                  {product.isAuction && product.timeLeft && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Auction: {product.timeLeft}
                    </div>
                  )}
                  {product.originalPrice && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Sale
                    </div>
                  )}
                  {product.isMock && (
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Demo
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                      {product.isMock ? 'Browse Similar Products' : 'View Details'}
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 text-sm">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 truncate">by {product.seller}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {products.length > 0 && (
        <>
          <button
            onClick={() => setTranslateX(prev => prev + 20)} // Move backward
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
            aria-label="Slow down carousel"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setTranslateX(prev => prev - 20)} // Move forward
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
            aria-label="Speed up carousel"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Continuous Scroll Indicator */}
      {autoPlay && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
          <div 
            className="h-full bg-primary-600 transition-all duration-100"
            style={{ 
              width: `${Math.abs(translateX % 100)}%` // Show continuous progress
            }}
          />
        </div>
      )}
    </div>
  )
} 