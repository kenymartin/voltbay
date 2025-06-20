import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@shared/dist'

export interface AuthResponse {
  user: User
  accessToken: string
}

interface AuthStore {
  // State
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (authData: AuthResponse) => void
  logout: () => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  updateToken: (token: string) => void
  clearAllData: () => void
  checkAuth: () => Promise<void>
  refreshUserProfile: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (authData: AuthResponse) => {
        set({
          user: authData.user,
          accessToken: authData.accessToken,
          isAuthenticated: true,
          isLoading: false,
        })
        
        // Sync cart with the logged-in user
        // Note: This will be handled by the useEffect in App.tsx and Navbar.tsx
        // when the user state changes
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
        
        // Sync cart to guest mode
        // Note: This will be handled by the useEffect in App.tsx and Navbar.tsx
        // when the user state changes to null
      },

      setUser: (user: User) => {
        set({ user })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      updateToken: (token: string) => {
        set({ accessToken: token })
      },

      clearAllData: () => {
        // Clear all auth data and localStorage
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
        // Also clear any related localStorage items
        localStorage.removeItem('voltbay-auth')
        sessionStorage.clear()
        
        // Clear all user-specific cart data
        const cartKeys = Object.keys(localStorage).filter(key => key.startsWith('voltbay-cart-'))
        cartKeys.forEach(key => localStorage.removeItem(key))
      },

      checkAuth: async () => {
        const state = get()
        
        // If we already have a user and token, consider authenticated
        if (state.user && state.accessToken) {
          set({ isAuthenticated: true })
          return
        }

        // If no token, user is not authenticated
        if (!state.accessToken) {
          set({ 
            user: null, 
            accessToken: null, 
            isAuthenticated: false,
            isLoading: false 
          })
          return
        }

        try {
          set({ isLoading: true })
          
          // Try to verify the token with the auth service
          const response = await fetch(`${import.meta.env.VITE_AUTH_URL || 'http://localhost:4000'}/api/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${state.accessToken}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const userData = await response.json()
            set({
              user: userData.user,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            // Token is invalid, clear auth data
            set({
              user: null,
              accessToken: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          // On error, clear auth data
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      refreshUserProfile: async () => {
        const state = get()
        
        if (!state.accessToken || !state.user) {
          console.error('User or token not available for refresh')
          return
        }

        try {
          set({ isLoading: true })
          
          const response = await fetch(`${import.meta.env.VITE_AUTH_URL || 'http://localhost:4000'}/api/auth/profile`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${state.accessToken}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const userData = await response.json()
            if (userData.success && userData.data?.user) {
              set({
                user: userData.data.user,
                isAuthenticated: true,
                isLoading: false,
              })
              console.log('✅ User profile refreshed successfully')
            }
          } else {
            console.error('Failed to refresh user profile')
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Error refreshing user profile:', error)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'voltbay-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
) 