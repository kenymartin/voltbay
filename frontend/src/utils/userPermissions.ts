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
  
  switch (userType) {
    case 'ENTERPRISE_VENDOR':
      return {
        // Navigation
        canAccessMarketplace: false,
        canAccessAuctions: false,
        canAccessEnterprise: false,
        canAccessROICalculator: false, // ROI Calculator is exclusively for buyers
        canAccessCategories: false,
        
        // Dashboard
        canViewMyListings: true, // Services/Listings
        canViewMyBids: false,
        canViewMyOrders: true, // Contracts/Orders
        canViewMessages: true,
        canViewWallet: true,
        canViewAnalytics: true,
        
        // Actions
        canCreateListing: true, // Create services
        canPlaceBid: false,
        canBuyNow: false,
        canSell: true,
        canRequestQuote: false,
        canManageServices: true,
        
        // UI elements
        showShoppingCart: false,
        showSellButton: false, // They manage services differently
        showBiddingFeatures: false,
        showQuoteFeatures: true
      }
      
    case 'ENTERPRISE_BUYER':
      return {
        // Navigation
        canAccessMarketplace: false,
        canAccessAuctions: false,
        canAccessEnterprise: true,
        canAccessROICalculator: true,
        canAccessCategories: false,
        
        // Dashboard
        canViewMyListings: false,
        canViewMyBids: false,
        canViewMyOrders: true, // Contracts/Orders
        canViewMessages: true,
        canViewWallet: true,
        canViewAnalytics: true,
        
        // Actions
        canCreateListing: false,
        canPlaceBid: false,
        canBuyNow: false,
        canSell: false,
        canRequestQuote: true,
        canManageServices: false,
        
        // UI elements
        showShoppingCart: false,
        showSellButton: false,
        showBiddingFeatures: false,
        showQuoteFeatures: true
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

export function shouldShowFeature(user: User | null, feature: keyof UserPermissions): boolean {
  const permissions = getUserPermissions(user)
  return permissions[feature]
} 