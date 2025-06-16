// Global image URL interceptor to fix problematic URLs like via.placeholder.com

import { getSafeImageUrl, PROBLEMATIC_DOMAINS } from './imageUtils'

/**
 * Intercept and fix problematic image URLs globally
 */
export const initGlobalImageFix = () => {
  // Override Image constructor to intercept src setting
  const OriginalImage = window.Image
  
  window.Image = function(width?: number, height?: number) {
    const img = new OriginalImage(width, height)
    
    // Override src setter
    let _src = ''
    Object.defineProperty(img, 'src', {
      get() {
        return _src
      },
      set(value: string) {
        _src = getSafeImageUrl(value)
        // Set the actual src to the safe URL
        Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')?.set?.call(img, _src)
      }
    })
    
    return img
  } as any
  
  // Intercept fetch requests for images
  const originalFetch = window.fetch
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    
    // Check if it's an image request to a problematic domain
    if (url && PROBLEMATIC_DOMAINS.some(domain => url.includes(domain))) {
      console.warn(`Blocked problematic image URL: ${url}`)
      // Return a rejected promise or redirect to safe URL
      const safeUrl = getSafeImageUrl(url)
      return originalFetch(safeUrl, init)
    }
    
    return originalFetch(input, init)
  }
  
  // Add global error handler for images
  document.addEventListener('error', (event) => {
    const target = event.target as HTMLImageElement
    if (target && target.tagName === 'IMG') {
      const src = target.src
      if (PROBLEMATIC_DOMAINS.some(domain => src.includes(domain))) {
        console.warn(`Image failed to load from problematic domain: ${src}`)
        target.src = getSafeImageUrl(src)
      }
    }
  }, true)
  
  // Monitor for dynamically added images
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element
          
          // Check if it's an image
          if (element.tagName === 'IMG') {
            const img = element as HTMLImageElement
            if (img.src && PROBLEMATIC_DOMAINS.some(domain => img.src.includes(domain))) {
              console.warn(`Fixing problematic image URL: ${img.src}`)
              img.src = getSafeImageUrl(img.src)
            }
          }
          
          // Check for images in child elements
          const images = element.querySelectorAll('img')
          images.forEach((img) => {
            if (img.src && PROBLEMATIC_DOMAINS.some(domain => img.src.includes(domain))) {
              console.warn(`Fixing problematic image URL: ${img.src}`)
              img.src = getSafeImageUrl(img.src)
            }
          })
        }
      })
    })
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  console.log('Global image fix initialized - problematic URLs will be automatically replaced')
}

/**
 * Fix all existing images on the page
 */
export const fixExistingImages = () => {
  const images = document.querySelectorAll('img')
  let fixedCount = 0
  
  images.forEach((img) => {
    if (img.src && PROBLEMATIC_DOMAINS.some(domain => img.src.includes(domain))) {
      console.warn(`Fixing existing problematic image URL: ${img.src}`)
      img.src = getSafeImageUrl(img.src)
      fixedCount++
    }
  })
  
  if (fixedCount > 0) {
    console.log(`Fixed ${fixedCount} problematic image URLs`)
  }
} 