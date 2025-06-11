import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthResponse } from '@shared/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (authData: AuthResponse) => void
  logout: () => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  updateToken: (token: string) => void
  clearAllData: () => void
}

type AuthStore = AuthState & AuthActions

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
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        })
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