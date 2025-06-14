import { useState } from 'react'
import { Link} from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import apiService from '../../services/api'

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

interface RegisterError {
  message: string
  field?: string
}

interface PasswordStrength {
  score: number
  feedback: string[]
}

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<RegisterError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  //const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) score++
    else feedback.push('At least 8 characters')

    if (/[a-z]/.test(password)) score++
    else feedback.push('One lowercase letter')

    if (/[A-Z]/.test(password)) score++
    else feedback.push('One uppercase letter')

    if (/\d/.test(password)) score++
    else feedback.push('One number')

    if (/[^a-zA-Z0-9]/.test(password)) {
      score++
      feedback.push('One special character (optional)')
    }

    return { score, feedback }
  }

  // Password requirement checker
  const getPasswordRequirements = (password: string) => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[^a-zA-Z0-9]/.test(password)
    }
  }

  const passwordStrength = getPasswordStrength(form.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validation
      if (!form.email || !form.password || !form.firstName || !form.lastName) {
        setError({ message: 'Please fill in all required fields' })
        return
      }

      if (!form.email.includes('@')) {
        setError({ message: 'Please enter a valid email address', field: 'email' })
        return
      }

      if (form.password !== form.confirmPassword) {
        setError({ message: 'Passwords do not match', field: 'confirmPassword' })
        return
      }

      if (passwordStrength.score < 3) {
        const requirements = getPasswordRequirements(form.password)
        const missing = []
        if (!requirements.length) missing.push('at least 8 characters')
        if (!requirements.lowercase) missing.push('one lowercase letter')
        if (!requirements.uppercase) missing.push('one uppercase letter')
        if (!requirements.number) missing.push('one number')
        
        setError({ 
          message: `Password must include: ${missing.join(', ')}. Please check the requirements below.`, 
          field: 'password' 
        })
        return
      }

      // Call registration API
      const response = await apiService.authPost<{
        success: boolean
        message?: string
        data?: any
      }>('/api/auth/register', {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName
      })
      
      if (response.success) {
        setIsSuccess(true)
      } else {
        setError({ message: response.message || 'Registration failed' })
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      
      // More specific error handling
      let errorMessage = 'An error occurred during registration. Please try again.'
      
      if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        errorMessage = 'Unable to connect to the registration service. Please check your internet connection and try again.'
      } else if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
        errorMessage = 'Registration service is temporarily unavailable. Please try again in a moment.'
      } else if (err.response?.status === 404) {
        errorMessage = 'Registration service endpoint not found. Please contact support if this persists.'
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

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-4 text-sm text-gray-600">
              We've sent a verification link to <strong>{form.email}</strong>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Please check your email and click the verification link to activate your account.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="btn-primary"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Registration Form */}
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
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={form.firstName}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address *
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
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${error?.field === 'password' ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Create a password"
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

              {/* Password Requirements Checklist */}
              {form.password && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  {(() => {
                    const requirements = getPasswordRequirements(form.password)
                    return (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {requirements.length ? (
                            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <span className={`text-xs ${requirements.length ? 'text-green-700' : 'text-red-700'}`}>
                            At least 8 characters
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {requirements.lowercase ? (
                            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <span className={`text-xs ${requirements.lowercase ? 'text-green-700' : 'text-red-700'}`}>
                            One lowercase letter (a-z)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {requirements.uppercase ? (
                            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <span className={`text-xs ${requirements.uppercase ? 'text-green-700' : 'text-red-700'}`}>
                            One uppercase letter (A-Z)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {requirements.number ? (
                            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                              <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <span className={`text-xs ${requirements.number ? 'text-green-700' : 'text-red-700'}`}>
                            One number (0-9)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {requirements.special ? (
                            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          <span className={`text-xs ${requirements.special ? 'text-green-700' : 'text-gray-600'}`}>
                            One special character (!@#$%^&*) - Optional
                          </span>
                        </div>
                      </div>
                    )
                  })()}
                  
                  {/* Overall Status */}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        passwordStrength.score >= 3 ? 'bg-green-500' : 
                        passwordStrength.score >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score >= 3 ? 'text-green-700' : 
                        passwordStrength.score >= 2 ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        Password strength: {
                          passwordStrength.score >= 3 ? 'Strong' : 
                          passwordStrength.score >= 2 ? 'Good' : 'Weak'
                        }
                      </span>
                    </div>
                    {passwordStrength.score < 3 && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Example: MyPassword123 or SecurePass2024!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`input pl-10 pr-10 ${error?.field === 'confirmPassword' ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </label>
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
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 