import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import apiService from '../../services/api'

interface LoginForm {
  email: string
  password: string
}

interface LoginError {
  message: string
  field?: string
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<LoginError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Basic validation
      if (!form.email || !form.password) {
        setError({ message: 'Please fill in all fields' })
        return
      }

      if (!form.email.includes('@')) {
        setError({ message: 'Please enter a valid email address', field: 'email' })
        return
      }

      // Call login API
      const response = await apiService.authPost<{
        success: boolean
        message?: string
        data?: any
      }>('/api/auth/login', form)
      
      if (response.success) {
        // Update auth store
        login(response.data)
        
        // Redirect to intended page or dashboard
        navigate(from, { replace: true })
      } else {
        setError({ message: response.message || 'Login failed' })
      }
    } catch (err: any) {
      console.error('Login error:', err)
      
      // More specific error handling
      let errorMessage = 'An error occurred during login. Please try again.'
      
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to the authentication service. Please check your internet connection and try again.'
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
        errorMessage = 'Authentication service is temporarily unavailable. Please try again in a moment.'
      } else if (err.response?.status === 404) {
        errorMessage = 'Authentication service endpoint not found. Please contact support if this persists.'
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error occurred. Please try again in a moment.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      setError({ message: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">VoltBay</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">{error.message}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={`input pl-10 ${error?.field === 'email' ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${error?.field === 'password' ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 text-center mb-4">Demo Accounts for Testing:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Admin Account:</p>
                <p className="text-gray-600">Email: admin@voltbay.com</p>
                <p className="text-gray-600">Password: password123</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-700">Test User:</p>
                <p className="text-gray-600">Email: testuser@example.com</p>
                <p className="text-gray-600">Password: testpass123</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 