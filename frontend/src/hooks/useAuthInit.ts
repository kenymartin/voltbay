import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiService from '../services/api'

export function useAuthInit() {
  const { isAuthenticated, accessToken, logout, setLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true)
      
      try {
        // If we have a token, validate it
        if (accessToken && isAuthenticated) {
          try {
            // Try to fetch user profile to validate token
            await apiService.authGet('/api/auth/profile')
            // Token is valid, user stays logged in
          } catch (error) {
            // Token is invalid, logout user
            console.warn('Token validation failed, logging out:', error)
            logout()
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [accessToken, isAuthenticated, logout, setLoading])

  // Handle browser navigation state changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      // When user returns to the tab, check if they're still authenticated
      if (!document.hidden && isAuthenticated && accessToken) {
        // Validate token silently
        apiService.authGet('/api/auth/profile').catch(() => {
          logout()
          navigate('/login', { replace: true })
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, accessToken, logout, navigate])

  return {
    isAuthenticated,
    isLoading: useAuthStore(state => state.isLoading)
  }
} 