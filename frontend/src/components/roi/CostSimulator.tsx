import React, { useState } from 'react'
import { Calculator, TrendingUp, Zap, Leaf, Clock, DollarSign, BarChart3, Settings } from 'lucide-react'
import apiService from '../../services/api'

// Define enums locally to avoid import issues
enum ProjectType {
  ROOFTOP = 'ROOFTOP',
  GROUND = 'GROUND',
  UTILITY_SCALE = 'UTILITY_SCALE',
  COMMERCIAL = 'COMMERCIAL'
}

enum MountingType {
  FIXED = 'FIXED',
  ADJUSTABLE = 'ADJUSTABLE',
  TRACKER = 'TRACKER',
  GROUND_MOUNT = 'GROUND_MOUNT',
  ROOF_MOUNT = 'ROOF_MOUNT'
}

// Define interfaces locally
interface ROICalculationRequest {
  projectType: ProjectType;
  location: string;
  systemSizeKw: number;
  panelWattage?: number;
  mountingType: MountingType;
  targetBudget?: number;
}

interface ROICalculationResult {
  estimatedPanels: number;
  estimatedCost: number;
  roiYears: number;
  co2OffsetTons: number;
  installationTime?: string;
  freightCost?: number;
  energyProduction?: number; // kWh/year
  breakdown?: {
    panelCost: number;
    inverterCost: number;
    rackingCost: number;
    installationCost: number;
    permitsCost: number;
    otherCosts: number;
  };
  savings?: {
    annualSavings: number;
    totalSavings25Years: number;
    paybackPeriod: number;
  };
}

interface CostSimulatorProps {
  onCalculate?: (result: ROICalculationResult) => void
  onQuoteRequest?: (data: ROICalculationRequest & { result?: ROICalculationResult }) => void
}

export const CostSimulator: React.FC<CostSimulatorProps> = ({ 
  onCalculate, 
  onQuoteRequest 
}) => {
  const [formData, setFormData] = useState<ROICalculationRequest>({
    projectType: ProjectType.ROOFTOP,
    location: '',
    systemSizeKw: 10,
    panelWattage: 400,
    mountingType: MountingType.FIXED,
    targetBudget: undefined
  })

  const [result, setResult] = useState<ROICalculationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: keyof ROICalculationRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCalculate = async () => {
    if (!formData.location || !formData.systemSizeKw) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await apiService.post<{ success: boolean; data: { result: ROICalculationResult }; message?: string }>('/api/roi/calculate', formData)

      if (data.success) {
        setResult(data.data.result)
        onCalculate?.(data.data.result)
      } else {
        setError(data.message || 'Failed to calculate ROI')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Network error. Please try again.')
      console.error('ROI calculation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuoteRequest = () => {
    if (result) {
      onQuoteRequest?.({ ...formData, result })
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="w-8 h-8 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">
            Solar ROI Calculator
          </h2>
        </div>
        <p className="text-gray-600">
          Calculate your solar project costs, ROI, and environmental impact
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Project Configuration
            </h3>
            
            <div className="space-y-4">
              {/* Project Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type *
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value as ProjectType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={ProjectType.ROOFTOP}>Rooftop</option>
                  <option value={ProjectType.COMMERCIAL}>Commercial</option>
                  <option value={ProjectType.GROUND}>Ground Mount</option>
                  <option value={ProjectType.UTILITY_SCALE}>Utility Scale</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (ZIP Code or City, State) *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., 85001 or Phoenix, AZ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* System Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System Size (kW) *
                </label>
                <input
                  type="number"
                  value={formData.systemSizeKw}
                  onChange={(e) => handleInputChange('systemSizeKw', Number(e.target.value))}
                  min="1"
                  max="10000"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Panel Wattage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Panel Wattage (W)
                </label>
                <input
                  type="number"
                  value={formData.panelWattage || 400}
                  onChange={(e) => handleInputChange('panelWattage', Number(e.target.value))}
                  min="100"
                  max="800"
                  step="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mounting Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mounting Type
                </label>
                <select
                  value={formData.mountingType}
                  onChange={(e) => handleInputChange('mountingType', e.target.value as MountingType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={MountingType.FIXED}>Fixed Mount</option>
                  <option value={MountingType.ADJUSTABLE}>Adjustable Mount</option>
                  <option value={MountingType.TRACKER}>Solar Tracker</option>
                  <option value={MountingType.GROUND_MOUNT}>Ground Mount</option>
                  <option value={MountingType.ROOF_MOUNT}>Roof Mount</option>
                </select>
              </div>

              {/* Target Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Budget (USD) - Optional
                </label>
                <input
                  type="number"
                  value={formData.targetBudget || ''}
                  onChange={(e) => handleInputChange('targetBudget', e.target.value ? Number(e.target.value) : undefined)}
                  min="1000"
                  step="1000"
                  placeholder="e.g., 50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate ROI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Cost</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${result.estimatedCost.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">ROI Period</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {result.roiYears} years
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Panels Needed</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {result.estimatedPanels}
                      </p>
                    </div>
                    <Zap className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">CO₂ Offset</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        {result.co2OffsetTons} tons/yr
                      </p>
                    </div>
                    <Leaf className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Detailed Analysis
                </h3>
                
                <div className="space-y-4">
                  {/* Energy Production */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Annual Energy Production</span>
                    <span className="font-semibold">{result.energyProduction?.toLocaleString()} kWh/year</span>
                  </div>

                  {/* Installation Time */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Installation Time</span>
                    <span className="font-semibold">{result.installationTime}</span>
                  </div>

                  {/* Freight Cost */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Freight Cost</span>
                    <span className="font-semibold">${result.freightCost?.toLocaleString()}</span>
                  </div>

                  {/* Savings Information */}
                  {result.savings && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Annual Savings</span>
                        <span className="font-semibold text-green-600">${result.savings.annualSavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">25-Year Savings</span>
                        <span className="font-semibold text-green-600">${result.savings.totalSavings25Years.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Cost Breakdown */}
                {result.breakdown && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Cost Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Solar Panels</span>
                        <span>${result.breakdown.panelCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Inverters</span>
                        <span>${result.breakdown.inverterCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Racking System</span>
                        <span>${result.breakdown.rackingCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Installation</span>
                        <span>${result.breakdown.installationCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Permits & Fees</span>
                        <span>${result.breakdown.permitsCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Other Costs</span>
                        <span>${result.breakdown.otherCosts.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quote Request Button */}
                <button
                  onClick={handleQuoteRequest}
                  className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Request Quotes from Vendors
                </button>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Calculate
              </h3>
              <p className="text-gray-600">
                Fill in your project details and click "Calculate ROI" to see your solar investment analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 