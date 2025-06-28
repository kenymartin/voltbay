import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '../services/api'
import { useAuthStore } from '../store/authStore'
import { shouldShowFeature } from '../utils/userPermissions'
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Users,
  Award,
  FileText,
  Star,
  Clock,
  Shield,
  CheckCircle,
  Edit,
  Save,
  X,
  Upload,
  ExternalLink,
  Briefcase,
  Send
} from 'lucide-react'
import { toast } from 'react-toastify'

interface QuoteRequest {
  projectType: string
  systemSizeKw: number
  location: string
  budget: number
  timeline: string
  description: string
  documents: File[]
}

export default function CompanyProfilePage() {
  const { id: paramId } = useParams()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<any>({})
  const [docFile, setDocFile] = useState<File | null>(null)

  // Determine if viewing own profile and the actual ID to use
  const isViewingOwnProfile = paramId === 'me'
  const id = isViewingOwnProfile ? user?.id : paramId

  // Quote request state
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest>({
    projectType: '',
    systemSizeKw: 0,
    location: '',
    budget: 0,
    timeline: '',
    description: '',
    documents: []
  })
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([])

  // Check if current user can edit this profile
  // Only allow editing when explicitly viewing via /me route or admin
  const canEdit = user && (
    user.role === 'ADMIN' || // Admin can edit any profile
    isViewingOwnProfile // User viewing their own profile via /me route (edit mode)
  )

  // Fetch company profile
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['companyProfile', paramId], // Use paramId for cache key consistency
    queryFn: async () => {
      const endpoint = isViewingOwnProfile ? '/api/company-profile/me' : `/api/company-profile/${id}`
      const res = await apiService.get(endpoint)
      return res.data
    },
    enabled: !!(id || isViewingOwnProfile)
  })

  // Fetch company documents - DISABLED: CompanyDocument model doesn't exist in schema
  const { data: docs, refetch: refetchDocs } = useQuery({
    queryKey: ['companyDocs', paramId],
    queryFn: async () => {
      // Documents endpoint not implemented
      return []
    },
    enabled: false // Disabled until CompanyDocument model is implemented
  })

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: (payload: any) => {
      const actualId = isViewingOwnProfile ? user?.id : id
      return apiService.put(`/api/company-profile/${actualId}`, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyProfile', paramId] })
      setEditMode(false)
    }
  })

  // Upload document mutation - DISABLED: CompanyDocument model doesn't exist in schema
  const uploadDoc = useMutation({
    mutationFn: (payload: any) => {
      // Document upload not implemented
      return Promise.resolve({ success: false, message: 'Document upload not implemented' })
    },
    enabled: false // Disabled until CompanyDocument model is implemented
  })

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  // Quote request handler
  const handleQuoteSubmit = async () => {
    console.log('🚀 handleQuoteSubmit called from CompanyProfilePage')
    console.log('User:', user)
    console.log('Company ID:', id)
    console.log('Quote Request:', quoteRequest)
    
    if (!user || !id) {
      console.log('❌ Missing user or company ID')
      return
    }

    try {
      // First upload documents if any
      const documentUrls: string[] = []
      
      if (uploadedDocuments.length > 0) {
        const formData = new FormData()
        uploadedDocuments.forEach(file => {
          formData.append('documents', file)
        })
        
        const uploadResponse = await apiService.post('/api/upload/quote-documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }) as any
        
        if (uploadResponse.success) {
          documentUrls.push(...uploadResponse.data.documentUrls)
        }
      }

      console.log('📤 Submitting quote request to API...')
      console.log('📋 Request payload:', {
        vendorId: id,
        ...quoteRequest,
        documentUrls
      })
      
      // Submit quote request
      const response = await apiService.post('/api/enterprise/quote-request', {
        vendorId: id,
        ...quoteRequest,
        documentUrls
      }) as any

      console.log('✅ Quote request response:', response)

      if (response.success) {
        toast.success('Quote request submitted successfully!')
        setShowQuoteModal(false)
        setQuoteRequest({
          projectType: '',
          systemSizeKw: 0,
          location: '',
          budget: 0,
          timeline: '',
          description: '',
          documents: []
        })
        setUploadedDocuments([])
      } else {
        console.log('❌ Quote request failed:', response)
        toast.error('Failed to submit quote request: ' + (response.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('❌ Error submitting quote request:', err)
      toast.error('An error occurred while submitting the quote request. Please try again.')
    }
  }

  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files)
      setUploadedDocuments([...uploadedDocuments, ...newFiles])
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company profile...</p>
        </div>
      </div>
    )
  }

  if (!data) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Profile Not Found</h2>
          <p className="text-gray-600">The requested company profile could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-6 mb-8 lg:mb-0">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                <Building2 className="h-12 w-12 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{data.companyName}</h1>
                <p className="text-blue-100 text-lg mb-4">
                  Solar Energy Solutions Provider
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-200" />
                    <span>{data.locationCity}, {data.locationState}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-200" />
                    <span>Member since {new Date().getFullYear() - 2}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-300" />
                    <span>Verified Provider</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {!canEdit && shouldShowFeature(user, 'canRequestQuote') && (
                <button 
                  onClick={() => {
                    console.log('🔘 Request Quote button clicked from CompanyProfilePage')
                    setShowQuoteModal(true)
                  }}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Request Quote
                </button>
              )}
              {canEdit && (
                <button 
                  onClick={() => setEditMode(!editMode)}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  {editMode ? (
                    <>
                      <X className="h-5 w-5 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-5 w-5 mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="h-6 w-6 mr-3 text-blue-600" />
                  About Our Company
                </h2>
              </div>
              
              {editMode && canEdit ? (
                <div className="space-y-4">
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    <textarea 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      rows={4}
                      value={form.about || ''} 
                      onChange={e => setForm(f => ({ ...f, about: e.target.value }))}
                      placeholder="Tell buyers about your company, experience, and what makes you unique..."
                    />
            </div>
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialties (comma separated)
                    </label>
                    <input 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={form.specialties?.join(', ') || ''} 
                      onChange={e => setForm(f => ({ ...f, specialties: e.target.value.split(',').map(s => s.trim()) }))}
                      placeholder="e.g., Residential Solar, Commercial Solar, Battery Storage"
                    />
                  </div>
                  <button 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    onClick={() => updateProfile.mutate(form)}
                    disabled={updateProfile.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
            </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      {data.about || "This company hasn't added a description yet."}
                    </p>
                  </div>
                  
                  {data.specialties?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            <Award className="h-3 w-3 mr-1" />
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.vendorProjects?.length > 0 && (
          <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Projects</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.vendorProjects.slice(0, 4).map((project, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center mb-2">
                              <Star className="h-4 w-4 text-yellow-500 mr-2" />
                              <h4 className="font-medium text-gray-900">{project.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{project.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
          </div>
        )}
      </div>

      {/* Documents Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-blue-600" />
                  Company Documents
                </h2>
                {canEdit && (
                  <div className="flex items-center space-x-3">
                    <input 
                      type="file" 
                      onChange={e => setDocFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="doc-upload"
                    />
                    <label 
                      htmlFor="doc-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </label>
                    {docFile && (
                      <button 
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        onClick={() => {
            if (docFile) {
              const reader = new FileReader()
              reader.onload = () => {
                uploadDoc.mutate({ url: reader.result, name: docFile.name })
              }
              reader.readAsDataURL(docFile)
            }
                        }}
                        disabled={uploadDoc.isPending}
                      >
                        {uploadDoc.isPending ? 'Uploading...' : 'Confirm Upload'}
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {docs?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                      <FileText className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-3 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
        </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No documents uploaded yet</p>
      </div>
              )}
            </div>
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Phone className="h-5 w-5 mr-3 text-blue-600" />
                Contact Information
              </h2>
              
              {editMode && canEdit ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Representative Name</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={form.representativeName || ''} 
                      onChange={e => setForm(f => ({ ...f, representativeName: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={form.phone || ''} 
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={form.email || ''} 
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={form.website || ''} 
                      onChange={e => setForm(f => ({ ...f, website: e.target.value }))} 
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{data.representativeName}</p>
                      <p className="text-sm text-gray-500">Representative</p>
                    </div>
                  </div>
                  
                  {data.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{data.phone}</p>
                        <p className="text-sm text-gray-500">Phone</p>
                      </div>
                    </div>
                  )}
                  
                  {data.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{data.email}</p>
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                    </div>
                  )}
                  
                  {data.website && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <a 
                          href={data.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          Visit Website
                        </a>
                        <p className="text-sm text-gray-500">Website</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Company Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-5 w-5 mr-3 text-blue-600" />
                Company Overview
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Verified Provider</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Member Since</span>
                  </div>
                  <span className="text-sm text-gray-600">{new Date().getFullYear() - 2}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Projects Completed</span>
                  </div>
                  <span className="text-sm text-gray-600">{data.vendorProjects?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Buyers */}
            {!canEdit && shouldShowFeature(user, 'canRequestQuote') && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
                <h2 className="text-xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-blue-100 mb-6 text-sm">
                  Contact {data.companyName} for a personalized solar solution quote.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      console.log('🔘 Request Quote button clicked from sidebar')
                      setShowQuoteModal(true)
                    }}
                    className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
                  >
                    <Mail className="h-5 w-5 mr-2" />
                    Request Quote
                  </button>
                  <button className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-3 px-4 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center justify-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Schedule Call
                  </button>
                </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Quote Request Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Request Quote from {data?.companyName}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <select
                    value={quoteRequest.projectType}
                    onChange={(e) => setQuoteRequest({...quoteRequest, projectType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select project type</option>
                    <option value="ROOFTOP">Rooftop</option>
                    <option value="GROUND">Ground Mount</option>
                    <option value="UTILITY_SCALE">Utility Scale</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Size (kW)
                  </label>
                  <input
                    type="number"
                    value={quoteRequest.systemSizeKw || ''}
                    onChange={(e) => setQuoteRequest({...quoteRequest, systemSizeKw: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={quoteRequest.location}
                    onChange={(e) => setQuoteRequest({...quoteRequest, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City, State or ZIP code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range ($)
                  </label>
                  <input
                    type="number"
                    value={quoteRequest.budget || ''}
                    onChange={(e) => setQuoteRequest({...quoteRequest, budget: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 500000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline
                </label>
                <select
                  value={quoteRequest.timeline}
                  onChange={(e) => setQuoteRequest({...quoteRequest, timeline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select timeline</option>
                  <option value="ASAP">ASAP</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="12+ months">12+ months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  value={quoteRequest.description}
                  onChange={(e) => setQuoteRequest({...quoteRequest, description: e.target.value})}
                  placeholder="Describe your project requirements, special considerations, etc."
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleDocumentUpload(e.target.files)}
                    className="hidden"
                    id="document-upload"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor="document-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, DOC, XLS, PNG, JPG up to 10MB each
                    </span>
                  </label>
                </div>
                
                {uploadedDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedDocuments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowQuoteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('📝 Submit Quote Request button clicked from CompanyProfilePage')
                  handleQuoteSubmit()
                }}
                disabled={!quoteRequest.projectType || !quoteRequest.systemSizeKw || !quoteRequest.location}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quote Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 