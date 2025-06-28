import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft,
  HardHat, 
  MapPin, 
  CheckCircle, 
  Calendar,
  Star,
  MessageCircle,
  Upload,
  FileText,
  Download,
  Send,
  Phone,
  Mail,
  Globe,
  Award,
  Users,
  Clock,
  Building2,
  Zap,
  Shield
} from 'lucide-react'
import apiService from '../services/api'
import { useAuthStore } from '../store/authStore'
import { shouldShowFeature } from '../utils/userPermissions'
import { toast } from 'react-toastify'

interface VendorDetail {
  id: string
  companyName: string
  locationCity: string
  locationState: string
  avatar: string | null
  completedJobs: number
  memberSince: string
  email: string
  phone: string
  website?: string
  description?: string
  specialties: string[]
  certifications: string[]
  projects: VendorProject[]
  documents: VendorDocument[]
}

interface VendorProject {
  id: string
  title: string
  description: string
  status: string
  projectType: string
  systemSizeKw: number
  location: string
  completedAt: string
}

interface VendorDocument {
  id: string
  name: string
  type: string
  url: string
  uploadedAt: string
  size: number
}

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  sentAt: string
  isRead: boolean
}

interface QuoteRequest {
  projectType: string
  systemSizeKw: number
  location: string
  budget: number
  timeline: string
  description: string
  documents: File[]
}

export default function VendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>()
  const { user } = useAuthStore()
  
  const [vendor, setVendor] = useState<VendorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'documents' | 'contact'>('overview')
  
  // Message state
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showMessageModal, setShowMessageModal] = useState(false)
  
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
  
  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([])

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetails()
    }
  }, [vendorId])

  const fetchVendorDetails = async () => {
    try {
      setLoading(true)
      const response = await apiService.get(`/api/enterprise/vendor/${vendorId}`) as any
      if (response.success) {
        setVendor(response.data)
      } else {
        setError('Failed to fetch vendor details')
      }
    } catch (err) {
      setError('Failed to fetch vendor details')
      console.error('Error fetching vendor details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !vendor) return

    try {
      console.log('🚀 Sending message from VendorDetailPage:', {
        receiverId: vendor.id,
        content: newMessage.trim(),
        messageType: 'GENERAL'
      })

      const response = await apiService.post('/api/messages', {
        receiverId: vendor.id,
        content: newMessage.trim(),
        messageType: 'GENERAL'
      }) as any

      console.log('✅ Message sent successfully:', response)

      if (response.success) {
        setMessages([...messages, response.data])
        setNewMessage('')
        setShowMessageModal(false)
        
        // Navigate to messages page to see the conversation
        window.location.href = `/messages?user=${vendor.id}`
      }
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleQuoteSubmit = async () => {
    console.log('🚀 handleQuoteSubmit called')
    console.log('User:', user)
    console.log('Vendor:', vendor)
    console.log('Quote Request:', quoteRequest)
    
    if (!user || !vendor) {
      console.log('❌ Missing user or vendor data')
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
      // Submit quote request
      const response = await apiService.post('/api/enterprise/quote-request', {
        vendorId: vendor.id,
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
      alert('An error occurred while submitting the quote request. Please try again.')
    }
  }

  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files)
      setUploadedDocuments([...uploadedDocuments, ...newFiles])
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Vendor not found'}</p>
          <Link 
            to="/enterprise"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Link 
              to="/enterprise"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Directory
            </Link>
          </div>

          {/* Vendor Header */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start space-x-6 mb-6 lg:mb-0">
              <div className="w-24 h-24 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {vendor.avatar ? (
                  <img
                    src={vendor.avatar}
                    alt={vendor.companyName}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                ) : (
                  <HardHat className="h-12 w-12 text-primary-600" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {vendor.companyName}
                </h1>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{vendor.locationCity}, {vendor.locationState}</span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    <span>{vendor.completedJobs} completed jobs</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Member since {formatDate(vendor.memberSince)}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>4.8 rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {user && (
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {shouldShowFeature(user, 'canRequestQuote') ? (
                  <>
                    <button
                      onClick={() => setShowMessageModal(true)}
                      className="flex items-center justify-center px-6 py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Send Message
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔘 Request Quote button clicked')
                        setShowQuoteModal(true)
                      }}
                      className="flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Request Quote
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-gray-100 border border-gray-300 rounded-lg px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-gray-500 mb-1">
                      <HardHat className="h-5 w-5" />
                      <span className="font-medium">Account Approval Required</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Contact admin to send messages and request quotes
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Building2 },
              { id: 'projects', label: 'Projects', icon: Zap },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'contact', label: 'Contact', icon: Phone }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-600 leading-relaxed">
                  {vendor.description || 'This vendor has not provided a description yet.'}
                </p>
              </div>

              {/* Specialties */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {vendor.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Projects</h2>
                <div className="space-y-4">
                  {vendor.projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{project.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{project.systemSizeKw} kW</span>
                        <span>{project.location}</span>
                        <span>{formatDate(project.completedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-600">Projects Completed</span>
                    </div>
                    <span className="font-semibold text-gray-900">{vendor.completedJobs}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-gray-600">Team Size</span>
                    </div>
                    <span className="font-semibold text-gray-900">15-25</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="text-gray-600">Avg. Response</span>
                    </div>
                    <span className="font-semibold text-gray-900">2 hours</span>
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                <div className="space-y-3">
                  {vendor.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center">
                      <Shield className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-600 text-sm">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">All Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vendor.projects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{project.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      <span>{project.systemSizeKw} kW System</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Completed {formatDate(project.completedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendor.documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900 truncate">{doc.name}</span>
                    </div>
                    <button className="text-primary-600 hover:text-primary-700">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>{formatFileSize(doc.size)}</p>
                    <p>Uploaded {formatDate(doc.uploadedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{vendor.email}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">{vendor.phone}</p>
                  </div>
                </div>
                {vendor.website && (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a 
                        href={vendor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {vendor.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{vendor.locationCity}, {vendor.locationState}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Business Hours</p>
                    <p className="font-medium text-gray-900">Mon-Fri 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Send Message to {vendor.companyName}
            </h3>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Request Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Request Quote from {vendor.companyName}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
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
                  console.log('📝 Submit Quote Request button clicked')
                  handleQuoteSubmit()
                }}
                disabled={!quoteRequest.projectType || !quoteRequest.systemSizeKw || !quoteRequest.location}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
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