import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, AlertCircle, Mail, Loader } from 'lucide-react'
import { toast } from 'react-toastify'
import apiService from '../../services/api'
import SEO from '../../components/SEO'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      setMessage('Invalid verification link')
      return
    }

    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      await apiService.authPost('/api/auth/verify-email', { token })
      setStatus('success')
      setMessage('Your email has been verified successfully!')
      toast.success('Email verified successfully!')
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error: any) {
      setStatus('error')
      const errorMessage = error.response?.data?.message || 'Failed to verify email'
      setMessage(errorMessage)
      toast.error(errorMessage)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'error':
      case 'invalid':
        return <AlertCircle className="h-8 w-8 text-red-600" />
      default:
        return <Mail className="h-8 w-8 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-100'
      case 'success':
        return 'bg-green-100'
      case 'error':
      case 'invalid':
        return 'bg-red-100'
      default:
        return 'bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <SEO 
        title="Verify Email"
        description="Verify your VoltBay account email address"
        url={window.location.href}
        noIndex={true}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${getStatusColor()} mb-6`}>
              {getStatusIcon()}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {status === 'loading' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
              {status === 'invalid' && 'Invalid Link'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {status === 'success' && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  Redirecting to login page in 3 seconds...
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Login
                </Link>
              </div>
            )}

            {(status === 'error' || status === 'invalid') && (
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Login
                </Link>
                <div>
                  <Link
                    to="/register"
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    Need to register again?
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 