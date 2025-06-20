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
  fallbackSrc = 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  showIcon = true,
  iconClassName = 'w-8 h-8 text-gray-400'
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [fallbackError, setFallbackError] = useState(false)

  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
  }

  const handleFallbackError = () => {
    setFallbackError(true)
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // Check if the src is a problematic URL (like via.placeholder.com)
  const isProblematicUrl = src && (
    src.includes('via.placeholder.com') || 
    src.includes('placeholder.com') ||
    src.startsWith('blob:') && !src.includes(window.location.origin)
  )

  // If no src provided, error occurred, or problematic URL, show fallback
  if (!src || hasError || isProblematicUrl) {
    // If fallback also failed or we want to show icon, show icon
    if (fallbackError || !fallbackSrc || showIcon) {
      return (
        <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
          <Package className={iconClassName} />
        </div>
      )
    }

    // Try fallback image
    return (
      <div className="relative">
        {isLoading && (
          <div className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`} />
        )}
        <img
          src={fallbackSrc}
          alt={alt}
          className={className}
          onError={handleFallbackError}
          onLoad={handleLoad}
          style={{ display: isLoading ? 'none' : 'block' }}
        />
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