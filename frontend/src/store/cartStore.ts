import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product } from '../../../shared/types'

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
  
  // Actions
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  
  // Getters
  getTotalPrice: () => number
  getTotalItems: () => number
  getItemQuantity: (productId: string) => number
  isInCart: (productId: string) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addToCart: (product: Product, quantity = 1) => {
        const { items } = get()
        const existingItem = items.find(item => item.productId === product.id)

        if (existingItem) {
          // Update quantity if item already exists
          set({
            items: items.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          // Add new item to cart
          const newItem: CartItem = {
            productId: product.id,
            product,
            quantity,
            price: parseFloat(product.price.toString()),
            addedAt: new Date()
          }
          
          set({
            items: [...items, newItem]
          })
        }
      },

      removeFromCart: (productId: string) => {
        set({
          items: get().items.filter(item => item.productId !== productId)
        })
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        set({
          items: get().items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        })
      },

      clearCart: () => {
        set({ items: [] })
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
    }),
    {
      name: 'voltbay-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist the items, not the UI state
      partialize: (state) => ({ items: state.items })
    }
  )
) 