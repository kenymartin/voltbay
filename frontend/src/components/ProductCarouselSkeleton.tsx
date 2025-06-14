interface ProductCarouselSkeletonProps {
  itemsPerView?: {
    mobile: number
    tablet: number
    desktop: number
  }
}

export default function ProductCarouselSkeleton({ 
  itemsPerView = { mobile: 1, tablet: 2, desktop: 4 }
}: ProductCarouselSkeletonProps) {
  // Create skeleton items based on desktop view (show more items)
  const skeletonItems = Array.from({ length: Math.max(itemsPerView.desktop, 6) }, (_, index) => index)

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <div className="flex space-x-6">
          {skeletonItems.map((index) => (
            <div 
              key={index}
              className="flex-shrink-0 w-full md:w-1/2 lg:w-1/4 animate-pulse"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Image skeleton */}
                <div className="w-full h-48 bg-gray-300"></div>
                
                {/* Content skeleton */}
                <div className="p-4">
                  {/* Title skeleton */}
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                  
                  {/* Rating skeleton */}
                  <div className="flex items-center mb-2">
                    <div className="h-4 w-4 bg-gray-300 rounded mr-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                  
                  {/* Price skeleton */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-5 bg-gray-300 rounded w-20"></div>
                  </div>
                  
                  {/* Seller skeleton */}
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation arrows skeleton */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
      
      {/* Dots skeleton */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: 3 }, (_, index) => (
          <div 
            key={index}
            className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  )
} 