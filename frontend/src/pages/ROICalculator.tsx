import React, { useState } from 'react'
import { CostSimulator } from '../components/roi/CostSimulator'
import { useAuthStore } from '../store/authStore'
import LoginModal from '../components/LoginModal'
import { Lock, Calculator, Users, TrendingUp, HardHat } from 'lucide-react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import apiService from '../services/api'
import { getUserType } from '../utils/userPermissions'

const ROICalculator: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const navigate = useNavigate()
  const userType = getUserType(user)

  // Handle quote request from ROI calculator
  const handleQuoteRequest = async (roiData: any) => {
    try {
      // Create a quote request with the ROI calculation data
      const response = await apiService.post<{ success: boolean; message?: string }>('/api/enterprise/quote-request', {
        projectType: roiData.projectType,
        systemSizeKw: roiData.systemSizeKw,
        location: roiData.location,
        mountingType: roiData.mountingType,
        budget: roiData.targetBudget || roiData.result?.estimatedCost,
        projectSpecs: {
          panelWattage: roiData.panelWattage,
          calculatedCost: roiData.result?.estimatedCost,
          roiPeriod: roiData.result?.roiYears,
          estimatedPanels: roiData.result?.estimatedPanels,
          co2Offset: roiData.result?.co2OffsetTons,
          energyProduction: roiData.result?.energyProduction
        },
        notes: `Quote request generated from ROI Calculator. System size: ${roiData.systemSizeKw}kW, Location: ${roiData.location}. Estimated cost: $${roiData.result?.estimatedCost?.toLocaleString()}, ROI: ${roiData.result?.roiYears} years`
      })

      if (response.success) {
        // Navigate to Enterprise page to show vendors
        navigate('/enterprise?quote_requested=true')
      } else {
        alert('Failed to create quote request. Please try again.')
      }
    } catch (error) {
      console.error('Quote request error:', error)
      alert('Failed to create quote request. Please try again.')
    }
  }

  // Role-based access control for authenticated users
  if (isAuthenticated && user) {
    // Only Enterprise Buyers should access ROI Calculator
    if (userType === 'ENTERPRISE_VENDOR') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <HardHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Enterprise Vendor Access</h2>
            <p className="text-gray-600 mb-6">
              The ROI Calculator is designed for enterprise buyers to evaluate solar projects. As an enterprise vendor, you can manage your services and respond to quote requests through your dashboard.
            </p>
            <Link 
              to="/dashboard" 
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Vendor Dashboard
            </Link>
          </div>
        </div>
      )
    }
    
    // Regular buyers and vendors should not access enterprise features
    if (userType !== 'ENTERPRISE_BUYER') {
      return <Navigate to="/" replace />
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Solar ROI Calculator
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Calculate your solar investment returns, energy savings, and environmental impact with our advanced ROI simulator.
              </p>
            </div>

            {/* Authentication Required Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                  <Lock className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Login Required
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  To access our advanced ROI Calculator and save your simulations, please log in to your VoltBay account.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Login to Continue
                  </button>
                  <a
                    href="/register"
                    className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
                  >
                    Create Account
                  </a>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ROI Analysis
                </h3>
                <p className="text-gray-600 text-sm">
                  Calculate payback period, savings over time, and return on investment for your solar project.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cost Estimation
                </h3>
                <p className="text-gray-600 text-sm">
                  Get detailed cost breakdowns including panels, installation, and freight costs.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Vendor Matching
                </h3>
                <p className="text-gray-600 text-sm">
                  Connect with qualified solar vendors based on your project requirements.
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Why Create an Account?
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Save and compare multiple solar project simulations
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Access detailed financial projections and reports
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Connect directly with enterprise solar vendors
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Track your solar investment performance over time
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <LoginModal 
            isOpen={showLoginModal} 
            onClose={() => setShowLoginModal(false)} 
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Use our advanced ROI calculator to analyze your solar investment opportunities.
          </p>
        </div>
        <CostSimulator onQuoteRequest={handleQuoteRequest} />
      </div>
    </div>
  )
}

export default ROICalculator 