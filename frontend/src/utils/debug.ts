import { useAuthStore } from '../store/authStore'
import { clearAllAuthState, restartApp } from './clearAuthState'

// Debug utilities for development
export const debugAuth = {
  // Clear all auth data and reload page (aggressive)
  clearAuth: () => {
    console.log('🔧 CLEARING ALL AUTH STATE (AGGRESSIVE)')
    restartApp()
  },
  
  // Clear auth data without reload
  clearAuthSoft: () => {
    console.log('🔧 Clearing auth state (soft)')
    useAuthStore.getState().clearAllData()
    clearAllAuthState()
  },
  
  // Check current auth state
  checkAuth: () => {
    const state = useAuthStore.getState()
    console.log('🔧 Auth State:', {
      isAuthenticated: state.isAuthenticated,
      hasToken: !!state.accessToken,
      hasUser: !!state.user,
      userId: state.user?.id,
      userEmail: state.user?.email,
      tokenLength: state.accessToken?.length
    })
    
    console.log('🔧 LocalStorage:', {
      authData: localStorage.getItem('voltbay-auth'),
      allKeys: Object.keys(localStorage)
    })
    
    console.log('🔧 Cookies:', document.cookie)
    
    return state
  },
  
  // Test auth endpoints
  testAuth: async () => {
    try {
      const response = await fetch('http://localhost:4000/health')
      const data = await response.json()
      console.log('🔧 Auth Service Health:', data)
      
      // Test if we can make an authenticated request
      const state = useAuthStore.getState()
      if (state.accessToken) {
        const authTest = await fetch('http://localhost:4000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${state.accessToken}`
          }
        })
        console.log('🔧 Auth Test Status:', authTest.status)
      }
    } catch (error) {
      console.error('🔧 Auth Service Error:', error)
    }
  },
  
  // Force stop any ongoing requests
  stopRequests: () => {
    console.log('🔧 Attempting to stop ongoing requests...')
    // This is a hack but can help stop infinite loops
    window.stop?.()
  }
}

// Make it available globally in development
if (import.meta.env.DEV) {
  (window as any).debugAuth = debugAuth
} 