// Utility functions for handling image URLs and fallbacks

export const FALLBACK_IMAGES = {
  solarPanel: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=300&fit=crop&auto=format&q=80&ixlib=rb-4.0.3',
  inverter: 'https://images.unsplash.com/photo-1471219743851-c4df8b6ee585?w=400&h=300&fit=crop&auto=format&q=80&ixlib=rb-4.0.3',
  battery: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=300&fit=crop&auto=format&q=80&ixlib=rb-4.0.3',
  mounting: 'https://images.unsplash.com/photo-1515263487990-61b07816b924?w=400&h=300&fit=crop&auto=format&q=80&ixlib=rb-4.0.3',
  controller: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format&q=80&ixlib=rb-4.0.3',
  default: 'https://images.unsplash.com/photo-1516876437184-593fda40c7ce?w=400&h=300&fit=crop&auto=format&q=80&ixlib=rb-4.0.3'
}

export const PROBLEMATIC_DOMAINS = [
  'via.placeholder.com',
  'placeholder.com',
  'placeholdit.imgix.net',
  'placehold.it'
]

/**
 * Check if an image URL is problematic and should be replaced
 */
export const isProblematicImageUrl = (url: string): boolean => {
  if (!url) return true
  
  // Check for problematic domains
  if (PROBLEMATIC_DOMAINS.some(domain => url.includes(domain))) {
    return true
  }
  
  // Check for invalid blob URLs (not from current origin)
  if (url.startsWith('blob:') && !url.includes(window.location.origin)) {
    return true
  }
  
  return false
}

/**
 * Get a safe image URL, replacing problematic ones with fallbacks
 */
export const getSafeImageUrl = (url: string | null | undefined, category?: string): string => {
  if (!url || isProblematicImageUrl(url)) {
    // Return category-specific fallback or default
    switch (category?.toLowerCase()) {
      case 'solar':
      case 'panel':
      case 'monocrystalline':
      case 'polycrystalline':
        return FALLBACK_IMAGES.solarPanel
      case 'inverter':
        return FALLBACK_IMAGES.inverter
      case 'battery':
      case 'lithium':
        return FALLBACK_IMAGES.battery
      case 'mounting':
      case 'mount':
        return FALLBACK_IMAGES.mounting
      case 'controller':
      case 'charge':
        return FALLBACK_IMAGES.controller
      default:
        return FALLBACK_IMAGES.default
    }
  }
  
  return url
}

/**
 * Get multiple safe image URLs from an array
 */
export const getSafeImageUrls = (urls: string[] | null | undefined, category?: string): string[] => {
  if (!urls || urls.length === 0) {
    return [getSafeImageUrl(null, category)]
  }
  
  return urls.map(url => getSafeImageUrl(url, category)).filter(Boolean)
}

/**
 * Handle image error by replacing with fallback
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>, category?: string) => {
  const img = event.currentTarget
  const fallbackUrl = getSafeImageUrl(null, category)
  
  // Prevent infinite loop if fallback also fails
  if (img.src !== fallbackUrl) {
    img.src = fallbackUrl
  } else {
    // If even fallback fails, hide the image
    img.style.display = 'none'
  }
}

/**
 * Create a data URL for a placeholder image
 */
export const createPlaceholderDataUrl = (width = 400, height = 300, text = 'No Image'): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Background
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, width, height)
    
    // Text
    ctx.fillStyle = '#9ca3af'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, width / 2, height / 2)
  }
  
  return canvas.toDataURL()
} 