import { User } from '@voltbay/shared'

export type UserType = 'BUYER' | 'VENDOR' | 'ENTERPRISE_BUYER' | 'ENTERPRISE_VENDOR' | 'ADMIN' | 'GUEST'

export interface UserPermissions {
  // Navigation permissions
  canAccessMarketplace: boolean
  canAccessAuctions: boolean
  canAccessEnterprise: boolean
  canAccessROICalculator: boolean
  canAccessCategories: boolean
  
  // Dashboard permissions
  canViewMyListings: boolean
  canViewMyBids: boolean
  canViewMyOrders: boolean
  canViewMessages: boolean
  canViewWallet: boolean
  canViewAnalytics: boolean
  canViewQuotes: boolean
  
  // Action permissions
  canCreateListing: boolean
  canPlaceBid: boolean
  canBuyNow: boolean
  canSell: boolean
  canRequestQuote: boolean
  canManageServices: boolean
  
  // UI element permissions
  showShoppingCart: boolean
  showSellButton: boolean
  showBiddingFeatures: boolean
  showQuoteFeatures: boolean
}

export function getUserType(user: User | null): UserType {
  if (!user) return 'GUEST'
  
  if (user.role === 'ADMIN') return 'ADMIN'
  
  // Enterprise Vendor - vendors with enterprise status
  if (user.role === 'VENDOR' && user.isEnterprise) {
    return 'ENTERPRISE_VENDOR'
  }
  
  // Enterprise Buyer - buyers with enterprise status
  if (user.role === 'BUYER' && user.isEnterprise) {
    return 'ENTERPRISE_BUYER'
  }
  
  // Regular Vendor
  if (user.role === 'VENDOR') {
    return 'VENDOR'
  }
  
  // Regular Buyer
  return 'BUYER'
}

export function getUserPermissions(user: User | null): UserPermissions {
  const userType = getUserType(user)
  const isApproved = isEnterpriseApproved(user)
  
  switch (userType) {
    case 'ENTERPRISE_VENDOR':
      return {
        // Navigation
        canAccessMarketplace: false,
        canAccessAuctions: false,
        canAccessEnterprise: true,
        canAccessROICalculator: false, // ROI Calculator is exclusively for buyers
        canAccessCategories: false,
        
        // Dashboard
        canViewMyListings: false, // Hidden for enterprise vendors per requirement
        canViewMyBids: false,
        canViewMyOrders: false, // Hidden for enterprise vendors per requirement
        canViewMessages: true, // Can always view messages
        canViewWallet: false, // Hidden for enterprise vendors per requirement
        canViewAnalytics: isApproved,
        canViewQuotes: isApproved, // Quote management for enterprise vendors
        
        // Actions
        canCreateListing: isApproved, // Create services - only if approved
        canPlaceBid: false,
        canBuyNow: false,
        canSell: isApproved, // Can only sell if approved
        canRequestQuote: false,
        canManageServices: isApproved, // Service management only if approved
        
        // UI elements
        showShoppingCart: false,
        showSellButton: false, // They manage services differently
        showBiddingFeatures: false,
        showQuoteFeatures: isApproved // Quote features only if approved
      }
      
    case 'ENTERPRISE_BUYER':
      return {
        // Navigation
        canAccessMarketplace: false,
        canAccessAuctions: false,
        canAccessEnterprise: true,
        canAccessROICalculator: true, // ROI Calculator available for all enterprise buyers
        canAccessCategories: false,
        
        // Dashboard
        canViewMyListings: false,
        canViewMyBids: false,
        canViewMyOrders: false, // Hidden for enterprise buyers per requirement
        canViewMessages: true, // Can always view messages
        canViewWallet: false, // Hidden for enterprise buyers per requirement
        canViewAnalytics: isApproved,
        canViewQuotes: isApproved, // Quote requests for enterprise buyers
        
        // Actions
        canCreateListing: false,
        canPlaceBid: false,
        canBuyNow: false,
        canSell: false,
        canRequestQuote: isApproved, // Quote requests only if approved
        canManageServices: false,
        
        // UI elements
        showShoppingCart: false,
        showSellButton: false,
        showBiddingFeatures: false,
        showQuoteFeatures: isApproved // Quote features only if approved
      }
      
    case 'VENDOR':
      return {
        // Navigation
        canAccessMarketplace: true,
        canAccessAuctions: true,
        canAccessEnterprise: false,
        canAccessROICalculator: false,
        canAccessCategories: true,
        
        // Dashboard
        canViewMyListings: true,
        canViewMyBids: true,
        canViewMyOrders: true,
        canViewMessages: true,
        canViewWallet: true,
        canViewAnalytics: false,
        canViewQuotes: false,
        
        // Actions
        canCreateListing: true,
        canPlaceBid: true,
        canBuyNow: true,
        canSell: true,
        canRequestQuote: false,
        canManageServices: false,
        
        // UI elements
        showShoppingCart: true,
        showSellButton: true,
        showBiddingFeatures: true,
        showQuoteFeatures: false
      }
      
    case 'BUYER':
      return {
        // Navigation
        canAccessMarketplace: true,
        canAccessAuctions: true,
        canAccessEnterprise: false,
        canAccessROICalculator: false,
        canAccessCategories: true,
        
        // Dashboard
        canViewMyListings: false,
        canViewMyBids: true,
        canViewMyOrders: true,
        canViewMessages: true,
        canViewWallet: true,
        canViewAnalytics: false,
        canViewQuotes: false,
        
        // Actions
        canCreateListing: false,
        canPlaceBid: true,
        canBuyNow: true,
        canSell: false,
        canRequestQuote: false,
        canManageServices: false,
        
        // UI elements
        showShoppingCart: true,
        showSellButton: false,
        showBiddingFeatures: true,
        showQuoteFeatures: false
      }
      
    case 'ADMIN':
      return {
        // Navigation
        canAccessMarketplace: true,
        canAccessAuctions: true,
        canAccessEnterprise: true,
        canAccessROICalculator: true,
        canAccessCategories: true,
        
        // Dashboard
        canViewMyListings: true,
        canViewMyBids: true,
        canViewMyOrders: true,
        canViewMessages: true,
        canViewWallet: true,
        canViewAnalytics: true,
        canViewQuotes: true,
        
        // Actions
        canCreateListing: true,
        canPlaceBid: true,
        canBuyNow: true,
        canSell: true,
        canRequestQuote: true,
        canManageServices: true,
        
        // UI elements
        showShoppingCart: true,
        showSellButton: true,
        showBiddingFeatures: true,
        showQuoteFeatures: true
      }
      
    default: // GUEST
      return {
        // Navigation
        canAccessMarketplace: true,
        canAccessAuctions: true,
        canAccessEnterprise: false,
        canAccessROICalculator: false,
        canAccessCategories: true,
        
        // Dashboard
        canViewMyListings: false,
        canViewMyBids: false,
        canViewMyOrders: false,
        canViewMessages: false,
        canViewWallet: false,
        canViewAnalytics: false,
        canViewQuotes: false,
        
        // Actions
        canCreateListing: false,
        canPlaceBid: false,
        canBuyNow: false,
        canSell: false,
        canRequestQuote: false,
        canManageServices: false,
        
        // UI elements
        showShoppingCart: false,
        showSellButton: false,
        showBiddingFeatures: false,
        showQuoteFeatures: false
      }
  }
}

export function isEnterpriseUser(user: User | null): boolean {
  if (!user) return false
  return user.isEnterprise === true
}

export function isEnterpriseApproved(user: User | null): boolean {
  if (!user || !user.isEnterprise) return false
  return user.verified === true
}

export function shouldShowFeature(user: User | null, feature: keyof UserPermissions): boolean {
  const permissions = getUserPermissions(user)
  return permissions[feature]
} 