import { useState } from 'react'
import { Link} from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Building, MapPin, Phone } from 'lucide-react'
import apiService from '../../services/api'

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  userType: 'BUYER' | 'VENDOR'
  isEnterprise: boolean
  // Company specific fields (for vendors or enterprise accounts)
  companyName?: string
  phone?: string
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  // Enterprise specific fields
  businessLicense?: string
  certifications?: string[]
  specialties?: string[]
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
    lastName: '',
    userType: 'BUYER',
    isEnterprise: false,
    companyName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    businessLicense: '',
    certifications: [],
    specialties: []
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<RegisterError | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleUserTypeChange = (userType: 'BUYER' | 'VENDOR') => {
    setForm(prev => ({ ...prev, userType }))
    setError(null)
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

      // Vendor/Seller or Enterprise specific validation
      if ((form.userType === 'VENDOR' || form.isEnterprise) && !form.companyName) {
        setError({ message: 'Company name is required for vendors/sellers and enterprise accounts', field: 'companyName' })
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

      // Prepare registration data
      const registrationData = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.userType, // BUYER or VENDOR
        isEnterprise: form.isEnterprise,
        companyName: form.companyName || undefined,
        phone: form.phone || undefined,
        street: form.street || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zipCode: form.zipCode || undefined,
        country: form.country || undefined,
        locationCity: form.city || undefined,
        locationState: form.state || undefined,
        // Additional metadata for enterprise accounts
        ...(form.isEnterprise && {
          businessLicense: form.businessLicense,
          certifications: form.certifications,
          specialties: form.specialties
        })
      }

      // Call registration API
      const response = await apiService.authPost<{
        success: boolean
        message?: string
        data?: any
      }>('/api/auth/register', registrationData)
      
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
              {form.isEnterprise ? 'Application Submitted!' : 'Check your email'}
            </h2>
            <p className="mt-4 text-sm text-gray-600">
              {form.isEnterprise ? (
                <>
                  Your enterprise account has been submitted to <strong>{form.email}</strong>
                  <br />
                  Our team will review your application and contact you within 2-3 business days.
                </>
              ) : (
                <>
                  We've sent a verification link to <strong>{form.email}</strong>
                  <br />
                  Please check your email and click the verification link to activate your account.
                </>
              )}
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
      <div className="max-w-2xl w-full space-y-8">
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

          {/* User Type Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to join VoltBay as a: *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Buyer Option */}
                <div 
                  className={`relative cursor-pointer rounded-lg border p-6 transition-all ${
                    form.userType === 'BUYER' 
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleUserTypeChange('BUYER')}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="radio"
                      name="userType"
                      value="BUYER"
                      checked={form.userType === 'BUYER'}
                      onChange={() => handleUserTypeChange('BUYER')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <User className="h-6 w-6 text-gray-600" />
                        <p className="text-base font-medium text-gray-900">Buyer</p>
                      </div>
                      <p className="text-sm text-gray-600">Purchase solar equipment, services, and solutions for your energy needs</p>
                    </div>
                  </div>
                </div>

                {/* Vendor/Seller Option */}
                <div 
                  className={`relative cursor-pointer rounded-lg border p-6 transition-all ${
                    form.userType === 'VENDOR' 
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleUserTypeChange('VENDOR')}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="radio"
                      name="userType"
                      value="VENDOR"
                      checked={form.userType === 'VENDOR'}
                      onChange={() => handleUserTypeChange('VENDOR')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Building className="h-6 w-6 text-gray-600" />
                        <p className="text-base font-medium text-gray-900">Vendor/Seller</p>
                      </div>
                      <p className="text-sm text-gray-600">Sell solar products, equipment, and services to customers and businesses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise Account Checkbox */}
            <div className="mt-4">
              <div className="flex items-center">
                <input
                  id="isEnterprise"
                  name="isEnterprise"
                  type="checkbox"
                  checked={form.isEnterprise}
                  onChange={(e) => setForm(prev => ({ ...prev, isEnterprise: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isEnterprise" className="ml-2 block text-sm text-gray-900">
                  This is an enterprise account
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enterprise accounts get access to business features, bulk pricing, dedicated support, and vendor management tools. 
                {form.userType === 'VENDOR' && ' Individual sellers can uncheck this for personal selling.'}
              </p>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Company Information - Show for Vendors/Sellers and Enterprise accounts */}
            {(form.userType === 'VENDOR' || form.isEnterprise) && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Building className="h-5 w-5 text-blue-600 mr-2" />
                  {form.isEnterprise ? 'Company Information' : 'Business Information'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                      Company name *
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      value={form.companyName}
                      onChange={handleChange}
                      className={`input ${error?.field === 'companyName' ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Your company name"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className="input pl-10"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="street"
                      name="street"
                      type="text"
                      value={form.street}
                      onChange={handleChange}
                      className="input pl-10"
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange}
                      className="input"
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={form.state}
                      onChange={handleChange}
                      className="input"
                      placeholder="CA"
                    />
                  </div>

                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={form.zipCode}
                      onChange={handleChange}
                      className="input"
                      placeholder="12345"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Mexico">Mexico</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

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
              </div>
            </div>

            {/* Password Requirements Checklist */}
            {form.password && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                {(() => {
                  const requirements = getPasswordRequirements(form.password)
                  return (
                    <div className="grid grid-cols-2 gap-2">
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
                          8+ characters
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
                          Lowercase
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
                          Uppercase
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
                          Number
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                                 `Create ${form.userType === 'BUYER' ? 'Buyer' : 'Vendor'} Account`
              )}
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </Link>
            {form.isEnterprise && (
              <>
                <br />
                Enterprise accounts require approval and may take 2-3 business days to activate.
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 