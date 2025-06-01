import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  Package, 
  Upload, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Plus, 
  X, 
  Info,
  Zap
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import apiService from '../services/api'
import SEO from '../components/SEO'
import type { Category, ProductCondition, ApiResponse } from '../../../shared/types'

interface ProductForm {
  title: string
  description: string
  price: number
  categoryId: string
  condition: ProductCondition | ''
  imageUrls: string[]
  
  // Auction fields
  isAuction: boolean
  auctionEndDate: string
  minimumBid: number
  buyNowPrice: number
  
  // Location
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  
  // Specifications
  specifications: Array<{
    name: string
    value: string
    unit: string
  }>
}

interface ImageUpload {
  id: string
  url: string
  file?: File
  uploading: boolean
}

export default function CreateProductPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { id: productId } = useParams()
  const isEditing = !!productId
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'location' | 'specs'>('basic')
  
  const [form, setForm] = useState<ProductForm>({
    title: '',
    description: '',
    price: 0,
    categoryId: '',
    condition: '',
    imageUrls: [],
    
    isAuction: false,
    auctionEndDate: '',
    minimumBid: 0,
    buyNowPrice: 0,
    
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    specifications: []
  })
  
  const [images, setImages] = useState<ImageUpload[]>([])
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchCategories()
  }, [user, navigate])

  const fetchCategories = async () => {
    try {
      const response = await apiService.get<ApiResponse<{ categories: Category[] }>>('/api/categories')
      setCategories(response.data?.categories || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setForm(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setForm(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9)
        const url = URL.createObjectURL(file)
        
        setImages(prev => [...prev, {
          id,
          url,
          file,
          uploading: false
        }])
      }
    })
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id)
      if (image?.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url)
      }
      return prev.filter(img => img.id !== id)
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files)
    }
  }

  const addSpecification = () => {
    setForm(prev => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '', unit: '' }]
    }))
  }

  const updateSpecification = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) => 
        i === index ? { ...spec, [field]: value } : spec
      )
    }))
  }

  const removeSpecification = (index: number) => {
    setForm(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const errors: string[] = []
    
    if (!form.title.trim()) errors.push('Title is required')
    if (!form.description.trim()) errors.push('Description is required')
    if (form.price <= 0) errors.push('Price must be greater than 0')
    if (!form.categoryId) errors.push('Category is required')
    if (!form.condition) errors.push('Condition is required')
    
    if (form.isAuction) {
      if (!form.auctionEndDate) errors.push('Auction end date is required')
      else {
        const endDate = new Date(form.auctionEndDate)
        if (endDate <= new Date()) errors.push('Auction end date must be in the future')
      }
      
      if (form.minimumBid <= 0) errors.push('Minimum bid must be greater than 0')
      if (form.minimumBid >= form.price) errors.push('Minimum bid must be less than starting price')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }
    
    setSubmitting(true)
    
    try {
      // Prepare form data
      const productData = {
        ...form,
        imageUrls: images.map(img => img.url), // For now, use blob URLs
        specifications: form.specifications.filter(spec => spec.name && spec.value)
      }
      
      // Remove empty fields
      if (!productData.isAuction) {
        delete productData.auctionEndDate
        delete productData.minimumBid
        delete productData.buyNowPrice
      }
      
      const response = await apiService.post<ApiResponse<{ product: any }>>('/api/products', productData)
      
      if (response.success) {
        toast.success('Product created successfully!')
        navigate('/dashboard?tab=listings')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create product')
      console.error('Product creation error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const getMinDateTime = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 16)
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'details', label: 'Details', icon: Info },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'specs', label: 'Specifications', icon: Zap }
  ]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO 
        title="Create Product Listing"
        description="List your solar products for sale or auction on VoltBay marketplace"
        url={window.location.href}
        noIndex={true}
      />
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
          <h1 className="text-2xl font-bold text-white">Create Product Listing</h1>
          <p className="text-primary-100 mt-1">List your solar products for sale or auction</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., High-Efficiency 400W Solar Panel"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select condition</option>
                    <option value="NEW">New</option>
                    <option value="LIKE_NEW">Like New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Describe your product in detail..."
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop images here, or click to select</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="btn btn-outline cursor-pointer"
                  >
                    Choose Images
                  </label>
                </div>

                {/* Image Preview */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.url}
                          alt="Product"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price * ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isAuction"
                      checked={form.isAuction}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">This is an auction</span>
                  </label>
                </div>
              </div>

              {/* Auction Fields */}
              {form.isAuction && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
                  <h3 className="font-medium text-orange-800">Auction Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Auction End Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="datetime-local"
                          name="auctionEndDate"
                          value={form.auctionEndDate}
                          onChange={handleInputChange}
                          min={getMinDateTime()}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          required={form.isAuction}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Bid ($)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          name="minimumBid"
                          value={form.minimumBid}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buy Now Price ($) - Optional
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          name="buyNowPrice"
                          value={form.buyNowPrice}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Allow buyers to purchase immediately at this price
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Location Tab */}
          {activeTab === 'location' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="street"
                      value={form.street}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={form.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Product Specifications</h3>
                <button
                  type="button"
                  onClick={addSpecification}
                  className="btn btn-outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Specification
                </button>
              </div>

              <div className="space-y-4">
                {form.specifications.map((spec, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={spec.name}
                        onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., Power Output"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., 400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={spec.unit}
                        onChange={(e) => updateSpecification(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., W"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="btn btn-outline text-red-600 hover:bg-red-50 w-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {form.specifications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No specifications added yet</p>
                    <p className="text-sm">Add technical details about your product</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            
            <div className="flex space-x-3">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
                    if (currentIndex > 0) {
                      setActiveTab(tabs[currentIndex - 1].id as any)
                    }
                  }}
                  className="btn btn-outline"
                >
                  Previous
                </button>
              )}
              
              {activeTab !== 'specs' ? (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
                    if (currentIndex < tabs.length - 1) {
                      setActiveTab(tabs[currentIndex + 1].id as any)
                    }
                  }}
                  className="btn btn-primary"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Listing'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 