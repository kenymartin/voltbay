import React, { useState } from 'react'
import { Package } from 'lucide-react'

interface ImageWithFallbackProps {
  src?: string | null
  alt: string
  className?: string
  fallbackSrc?: string
  showIcon?: boolean
  iconClassName?: string
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?w=400&h=300&fit=crop',
  showIcon = true,
  iconClassName = 'w-8 h-8 text-gray-400'
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // If no src provided or error occurred, show fallback
  if (!src || hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        {showIcon ? (
          <Package className={iconClassName} />
        ) : (
          <img
            src={fallbackSrc}
            alt={alt}
            className={className}
            onError={() => {
              // If fallback also fails, show icon
              if (showIcon) return
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  )
}

export default ImageWithFallback 