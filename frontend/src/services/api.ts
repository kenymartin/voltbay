import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'react-toastify'
import { useAuthStore } from '../store/authStore'

class ApiService {
  private api: AxiosInstance
  private authApi: AxiosInstance

  constructor() {
    // Main API instance
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
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

  private setupInterceptors() {
    // Request interceptor to add auth token
    const requestInterceptor = (config: AxiosRequestConfig) => {
      const { accessToken } = useAuthStore.getState()
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      return config
    }

    // Response interceptor for error handling
    const responseInterceptor = (response: AxiosResponse) => response

    const errorInterceptor = async (error: any) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        // Don't retry if this was already a refresh token request to prevent infinite loops
        if (originalRequest.url?.includes('/refresh-token')) {
          useAuthStore.getState().logout()
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // Don't try to refresh tokens for authentication endpoints (login, register, etc.)
        const authEndpoints = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']
        const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint))
        
        if (isAuthEndpoint) {
          // For auth endpoints, just pass through the error without trying to refresh
          return Promise.reject(error)
        }

        try {
          // Try to refresh token - this should automatically include cookies
          const refreshResponse = await this.authApi.post('/api/auth/refresh-token', {}, {
            _skipAuthInterceptor: true // Custom flag to skip auth interceptor for this request
          })
          
          const { accessToken } = refreshResponse.data.data
          
          useAuthStore.getState().updateToken(accessToken)
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return axios(originalRequest)
        } catch (refreshError) {
          // Refresh failed, logout user
          console.error('Token refresh failed:', refreshError)
          useAuthStore.getState().logout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }

      // Handle other errors
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred')
      }

      return Promise.reject(error)
    }

    // Apply interceptors to both instances
    this.api.interceptors.request.use(requestInterceptor)
    this.api.interceptors.response.use(responseInterceptor, errorInterceptor)
    
    // For auth API, we need different interceptors to handle refresh token properly
    this.authApi.interceptors.request.use((config: AxiosRequestConfig) => {
      // Don't add auth header to refresh token requests, but add it to others
      if (!config.url?.includes('/refresh-token') && !config._skipAuthInterceptor) {
        const { accessToken } = useAuthStore.getState()
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
      }
      return config
    })
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