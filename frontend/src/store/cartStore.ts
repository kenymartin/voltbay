import { create } from 'zustand'
import type { Product } from '@shared/dist'

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  price: number
  addedAt: Date
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  currentUserId: string | null
  
  // Actions
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  setCurrentUser: (userId: string | null) => void
  
  // Getters
  getTotalPrice: () => number
  getTotalItems: () => number
  getItemQuantity: (productId: string) => number
  isInCart: (productId: string) => boolean
}

// Helper functions for user-specific storage
const getUserStorageKey = (userId: string | null) => {
  return userId ? `voltbay-cart-${userId}` : 'voltbay-cart-guest'
}

const loadCartFromStorage = (userId: string | null): CartItem[] => {
  try {
    const storageKey = getUserStorageKey(userId)
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert addedAt back to Date objects
      return parsed.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }))
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error)
  }
  return []
}

const saveCartToStorage = (userId: string | null, items: CartItem[]) => {
  try {
    const storageKey = getUserStorageKey(userId)
    localStorage.setItem(storageKey, JSON.stringify(items))
  } catch (error) {
    console.error('Error saving cart to storage:', error)
  }
}

const clearCartFromStorage = (userId: string | null) => {
  try {
    const storageKey = getUserStorageKey(userId)
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.error('Error clearing cart from storage:', error)
  }
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  currentUserId: null,

  setCurrentUser: (userId: string | null) => {
    const currentUserId = get().currentUserId
    
    // If user changed, save current cart and load user-specific cart
    if (currentUserId !== userId) {
      // Save current cart for the previous user (only if they were logged in)
      if (currentUserId !== null) {
        saveCartToStorage(currentUserId, get().items)
      }
      
      // If logging out (userId becomes null), clear the cart completely
      if (userId === null && currentUserId !== null) {
        set({ 
          currentUserId: userId,
          items: [] // Clear cart on logout
        })
        // Also clear any guest cart that might exist
        clearCartFromStorage(null)
      } else {
        // Load cart for the new user (login or user switch)
        const userItems = loadCartFromStorage(userId)
        
        set({ 
          currentUserId: userId,
          items: userItems
        })
      }
    }
  },

  addToCart: (product: Product, quantity = 1) => {
    const { items, currentUserId } = get()
    const existingItem = items.find(item => item.productId === product.id)

    let newItems: CartItem[]

    if (existingItem) {
      // Update quantity if item already exists
      newItems = items.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity,
        price: parseFloat(product.price.toString()),
        addedAt: new Date()
      }
      
      newItems = [...items, newItem]
    }

    set({ items: newItems })
    saveCartToStorage(currentUserId, newItems)
  },

  removeFromCart: (productId: string) => {
    const { items, currentUserId } = get()
    const newItems = items.filter(item => item.productId !== productId)
    
    set({ items: newItems })
    saveCartToStorage(currentUserId, newItems)
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId)
      return
    }

    const { items, currentUserId } = get()
    const newItems = items.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    )

    set({ items: newItems })
    saveCartToStorage(currentUserId, newItems)
  },

  clearCart: () => {
    const { currentUserId } = get()
    set({ items: [] })
    clearCartFromStorage(currentUserId)
  },

  toggleCart: () => {
    set({ isOpen: !get().isOpen })
  },

  openCart: () => {
    set({ isOpen: true })
  },

  closeCart: () => {
    set({ isOpen: false })
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => {
      return total + item.quantity
    }, 0)
  },

  getItemQuantity: (productId: string) => {
    const item = get().items.find(item => item.productId === productId)
    return item ? item.quantity : 0
  },

  isInCart: (productId: string) => {
    return get().items.some(item => item.productId === productId)
  }
})) 