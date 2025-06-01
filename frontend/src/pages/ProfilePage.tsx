import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { User, Edit, Save, X, Camera, Mail, Phone, MapPin } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import apiService from '../services/api'
import SEO from '../components/SEO'
import type { User as UserType, ApiResponse } from '../../../shared/types'

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuthStore()
  const navigate = useNavigate()
  
  const [user, setUser] = useState<UserType | null>(authUser)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [editForm, setEditForm] = useState({
    firstName: authUser?.firstName || '',
    lastName: authUser?.lastName || '',
    phone: authUser?.phone || '',
    street: authUser?.street || '',
    city: authUser?.city || '',
    state: authUser?.state || '',
    zipCode: authUser?.zipCode || '',
    country: authUser?.country || ''
  })

  useEffect(() => {
    if (!authUser) {
      navigate('/login')
      return
    }
    fetchUserProfile()
  }, [authUser, navigate])

  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      const response = await apiService.authGet<ApiResponse<{ user: UserType }>>('/api/auth/profile')
      if (response.success && response.data) {
        setUser(response.data.user)
        setEditForm({
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          phone: response.data.user.phone || '',
          street: response.data.user.street || '',
          city: response.data.user.city || '',
          state: response.data.user.state || '',
          zipCode: response.data.user.zipCode || '',
          country: response.data.user.country || ''
        })
      }
    } catch (error) {
      toast.error('Failed to load profile')
      console.error('Profile fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await apiService.authPut<ApiResponse<{ user: UserType }>>('/api/auth/profile', editForm)
      
      if (response.success && response.data) {
        setUser(response.data.user)
        updateUser(response.data.user)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
      console.error('Profile update error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      street: user?.street || '',
      city: user?.city || '',
      state: user?.state || '',
      zipCode: user?.zipCode || '',
      country: user?.country || ''
    })
    setIsEditing(false)
  }

  const handleAvatarUpload = () => {
    toast.info('Avatar upload feature coming soon!')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
              <div className="space-y-3">
                <div className="h-6 bg-gray-300 rounded w-48"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Profile not found</h1>
          <p className="mt-2 text-gray-600">Unable to load your profile information.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO 
        title="My Profile"
        description="Manage your VoltBay profile information and account settings"
        url={window.location.href}
        noIndex={true}
      />
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-8">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.firstName} 
                    className="w-24 h-24 object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button
                onClick={handleAvatarUpload}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.verified ? 'Verified Account' : 'Unverified Account'}
                </span>
                <span className="text-xs text-gray-500">
                  Member since {new Date(user.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={isEditing ? editForm.firstName : user.firstName || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    !isEditing ? 'bg-gray-50 text-gray-700' : ''
                  }`}
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={isEditing ? editForm.lastName : user.lastName || ''}
                  onChange={handleInputChange}
                  readOnly={!isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    !isEditing ? 'bg-gray-50 text-gray-700' : ''
                  }`}
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  />
                  <span className="text-xs text-gray-500">(Cannot be changed)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    name="phone"
                    value={isEditing ? editForm.phone : user.phone || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      !isEditing ? 'bg-gray-50 text-gray-700' : ''
                    }`}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="street"
                    value={isEditing ? editForm.street : user.street || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      !isEditing ? 'bg-gray-50 text-gray-700' : ''
                    }`}
                    placeholder="Enter street address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={isEditing ? editForm.city : user.city || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      !isEditing ? 'bg-gray-50 text-gray-700' : ''
                    }`}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={isEditing ? editForm.state : user.state || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      !isEditing ? 'bg-gray-50 text-gray-700' : ''
                    }`}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={isEditing ? editForm.zipCode : user.zipCode || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      !isEditing ? 'bg-gray-50 text-gray-700' : ''
                    }`}
                    placeholder="Zip Code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={isEditing ? editForm.country : user.country || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      !isEditing ? 'bg-gray-50 text-gray-700' : ''
                    }`}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-primary-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">0</div>
                <div className="text-sm text-gray-600">Products Listed</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Successful Sales</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Purchases Made</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 