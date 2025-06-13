import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'react-toastify'
import { useAuthStore } from '../store/authStore'
import { clearAllAuthState } from '../utils/clearAuthState'

// Extend config types for custom properties
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _skipAuthInterceptor?: boolean
  _retry?: boolean
  metadata?: { _skipAuthInterceptor?: boolean }
}

// Vite env type declaration
declare global {
  interface ImportMeta {
    env: {
      VITE_API_URL?: string
      VITE_AUTH_URL?: string
    }
  }
}

class ApiService {
  private api: AxiosInstance
  private authApi: AxiosInstance
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []
  private refreshAttempts = 0
  private maxRefreshAttempts = 3
  private lastRefreshAttempt = 0

  constructor() {
    // Main API instance
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Auth API instance
    this.authApi = axios.create({
      baseURL: import.meta.env.VITE_AUTH_URL || 'http://localhost:4000',
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private onRefreshTokenSuccess(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token))
    this.refreshSubscribers = []
    // Reset refresh attempts on success
    this.refreshAttempts = 0
  }

  private onRefreshTokenFailure() {
    console.log('🔧 Refresh token failure, clearing all auth state')
    this.refreshSubscribers = []
    this.refreshAttempts++
    
    // If we've tried too many times, clear everything and force reload
    if (this.refreshAttempts >= this.maxRefreshAttempts) {
      console.error('🔧 Too many refresh attempts, forcing app restart')
      clearAllAuthState()
      window.location.replace(window.location.origin + '/login')
      return
    }
    
    useAuthStore.getState().logout()
    // Avoid infinite redirects
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback)
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    const requestInterceptor = (config: InternalAxiosRequestConfig) => {
      const { accessToken } = useAuthStore.getState()
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      return config
    }

    // Response interceptor for error handling
    const responseInterceptor = (response: AxiosResponse) => response

    const errorInterceptor = async (error: any) => {
      const originalRequest: CustomAxiosRequestConfig = error.config

      // Handle 401 errors
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        // Circuit breaker: if too many attempts recently, bail out
        const now = Date.now()
        if (now - this.lastRefreshAttempt < 1000 && this.refreshAttempts >= this.maxRefreshAttempts) {
          console.error('🔧 Circuit breaker: too many refresh attempts')
          this.onRefreshTokenFailure()
          return Promise.reject(error)
        }
        this.lastRefreshAttempt = now

        // Don't retry if this was already a refresh token request
        if (originalRequest.url?.includes('/refresh-token')) {
          this.onRefreshTokenFailure()
          return Promise.reject(error)
        }

        // Don't try to refresh tokens for authentication endpoints
        const authEndpoints = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']
        const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint))
        
        if (isAuthEndpoint) {
          return Promise.reject(error)
        }

        // If already refreshing, wait for the result
        if (this.isRefreshing) {
          return new Promise((resolve) => {
            this.addRefreshSubscriber((token: string) => {
              originalRequest.headers!.Authorization = `Bearer ${token}`
              resolve(axios(originalRequest))
            })
          })
        }

        this.isRefreshing = true

        try {
          console.log('🔧 Attempting token refresh...')
          const refreshResponse = await this.authApi.post('/api/auth/refresh-token', {})
          
          const { accessToken } = refreshResponse.data.data
          
          useAuthStore.getState().updateToken(accessToken)
          this.isRefreshing = false
          this.onRefreshTokenSuccess(accessToken)
          
          // Retry original request with new token
          originalRequest.headers!.Authorization = `Bearer ${accessToken}`
          return axios(originalRequest)
        } catch (refreshError) {
          console.error('🔧 Token refresh failed:', refreshError)
          this.isRefreshing = false
          this.onRefreshTokenFailure()
          return Promise.reject(refreshError)
        }
      }

      // Handle other errors without showing toast for auth failures
      if (error.response?.status !== 401) {
        if (error.response?.data?.message) {
          toast.error(error.response.data.message)
        } else if (error.message && !error.message.includes('refresh')) {
          toast.error('An unexpected error occurred')
        }
      }

      return Promise.reject(error)
    }

    // Apply interceptors to main API
    this.api.interceptors.request.use(requestInterceptor)
    this.api.interceptors.response.use(responseInterceptor, errorInterceptor)
    
    // For auth API, use the same interceptors
    this.authApi.interceptors.request.use(requestInterceptor)
    this.authApi.interceptors.response.use(responseInterceptor, errorInterceptor)
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete(url, config)
    return response.data
  }

  // Auth-specific methods
  async authGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.authApi.get(url, config)
    return response.data
  }

  async authPost<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.authApi.post(url, data, config)
    return response.data
  }

  async authPut<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.authApi.put(url, data, config)
    return response.data
  }

  // Logout method
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await this.authApi.post('/api/auth/logout')
    } catch (error) {
      // Even if backend call fails, we should still clear local state
      console.warn('Logout request failed, but clearing local state:', error)
    } finally {
      // Clear auth state regardless of backend response
      useAuthStore.getState().logout()
    }
  }

  // File upload method
  async uploadFile<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }

    const response = await this.api.post(url, formData, config)
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService 