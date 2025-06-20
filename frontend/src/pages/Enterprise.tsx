import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  HardHat, 
  MapPin, 
  CheckCircle, 
  Calendar,
  Filter,
  Search,
  CheckCircle2
} from 'lucide-react'
import { SolarNewsTicker } from '../components/SolarNewsTicker'
import apiService from '../services/api'

interface Vendor {
  id: string
  companyName: string
  locationCity: string
  locationState: string
  avatar: string | null
  completedJobs: number
  memberSince: string
}

export default function Enterprise() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [searchParams] = useSearchParams()
  const [showQuoteSuccess, setShowQuoteSuccess] = useState(false)

  // Check if user was redirected from ROI calculator
  useEffect(() => {
    if (searchParams.get('quote_requested') === 'true') {
      setShowQuoteSuccess(true)
      // Hide the message after 5 seconds
      setTimeout(() => setShowQuoteSuccess(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    fetchVendors()
  }, [])

  useEffect(() => {
    filterVendors()
  }, [vendors, searchTerm, cityFilter, stateFilter])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const response = await apiService.get('/api/enterprise/vendors') as any
      if (response.success) {
        setVendors(response.data)
      } else {
        setError('Failed to fetch vendors')
      }
    } catch (err) {
      setError('Failed to fetch vendors')
      console.error('Error fetching vendors:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterVendors = () => {
    let filtered = vendors.filter(vendor => vendor.companyName) // Only show vendors with company names

    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.locationCity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.locationState?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (cityFilter) {
      filtered = filtered.filter(vendor =>
        vendor.locationCity?.toLowerCase().includes(cityFilter.toLowerCase())
      )
    }

    if (stateFilter) {
      filtered = filtered.filter(vendor =>
        vendor.locationState?.toLowerCase().includes(stateFilter.toLowerCase())
      )
    }

    setFilteredVendors(filtered)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  const getUniqueStates = () => {
    const states = vendors
      .filter(vendor => vendor.locationState)
      .map(vendor => vendor.locationState)
    return [...new Set(states)].sort()
  }

  const getUniqueCities = () => {
    const cities = vendors
      .filter(vendor => vendor.locationCity)
      .map(vendor => vendor.locationCity)
    return [...new Set(cities)].sort()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enterprise vendors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchVendors}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <HardHat className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Directory</h1>
          </div>
          <p className="text-gray-600 max-w-2xl">
            Connect with verified solar enterprise vendors for large-scale commercial and industrial jobs. 
            Browse our directory of trusted partners with proven track records.
          </p>
        </div>
      </div>

      {/* Quote Request Success Message */}
      {showQuoteSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4 sm:mx-6 lg:mx-8 mt-4 rounded-r-lg">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-400 mr-3" />
            <div>
              <p className="text-sm text-green-700">
                <strong>Quote request submitted successfully!</strong> Our enterprise vendors will review your project details and contact you with competitive quotes.
              </p>
            </div>
            <button
              onClick={() => setShowQuoteSuccess(false)}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Solar News Ticker */}
      <SolarNewsTicker />

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors, cities, or states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Cities</option>
                    {getUniqueCities().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All States</option>
                    {getUniqueStates().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredVendors.length} enterprise vendor{filteredVendors.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Vendor Grid */}
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12">
            <HardHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vendors found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  {/* Company Info */}
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {vendor.avatar ? (
                        <img
                          src={vendor.avatar}
                          alt={vendor.companyName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <HardHat className="h-6 w-6 text-primary-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {vendor.companyName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {vendor.locationCity}, {vendor.locationState}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-gray-600">
                        <span className="font-semibold text-gray-900">{vendor.completedJobs}</span> completed jobs
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        Member since {formatDate(vendor.memberSince)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/enterprise/vendor/${vendor.id}`}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg text-center font-medium hover:bg-primary-700 transition-colors duration-200 block"
                  >
                    View Details & Request Quote
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 