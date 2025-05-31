import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { apiService } from '../services/api'
import { LogOut, User, CheckCircle, XCircle } from 'lucide-react'

export default function TestLogoutPage() {
  const { user, isAuthenticated, login } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    setIsLoggingIn(true)
    setMessage('')
    try {
      const response = await apiService.authPost<{
        success: boolean
        message?: string
        data?: any
      }>('/api/auth/login', {
        email: 'logout-test@example.com',
        password: 'TestPassword123!'
      })
      
      if (response.success) {
        login(response.data)
        setMessage('✅ Logged in successfully!')
      } else {
        setMessage('❌ Login failed: ' + (response.message || 'Unknown error'))
      }
    } catch (error: any) {
      setMessage('❌ Login error: ' + (error.response?.data?.message || error.message))
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setMessage('')
    try {
      await apiService.logout()
      setMessage('✅ Logged out successfully!')
    } catch (error: any) {
      setMessage('❌ Logout error: ' + error.message)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Logout Test Page
          </h1>
          <p className="text-gray-600">
            Test the authentication and logout functionality
          </p>
        </div>

        {/* Auth Status */}
        <div className="mb-6 p-4 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-2 mb-2">
            {isAuthenticated ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              Status: {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
            </span>
          </div>
          
          {isAuthenticated && user && (
            <div className="text-sm text-gray-600">
              <p><strong>User:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">{message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          {!isAuthenticated ? (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User className="h-5 w-5" />
              <span>{isLoggingIn ? 'Logging in...' : 'Test Login'}</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="h-5 w-5" />
              <span>{isLoggingOut ? 'Logging out...' : 'Test Logout'}</span>
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 text-sm text-gray-600">
          <h3 className="font-medium mb-2">How to test:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Test Login" to authenticate</li>
            <li>Once logged in, you'll see user details</li>
            <li>Click "Test Logout" to sign out</li>
            <li>The status should update to "Not authenticated"</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 