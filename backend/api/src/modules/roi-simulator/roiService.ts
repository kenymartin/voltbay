import { ProjectType, MountingType, ROICalculationRequest, ROICalculationResult } from '@shared'

/**
 * ROI Calculation Service
 * Provides solar project cost estimation and ROI calculations
 */

// Mock data for solar calculations
const SOLAR_DATA = {
  // Cost per watt by project type (USD)
  costPerWatt: {
    [ProjectType.ROOFTOP]: 3.20,
    [ProjectType.COMMERCIAL]: 2.85,
    [ProjectType.GROUND]: 2.50,
    [ProjectType.UTILITY_SCALE]: 1.95
  },
  
  // Installation multipliers by mounting type
  mountingMultiplier: {
    [MountingType.FIXED]: 1.0,
    [MountingType.ADJUSTABLE]: 1.15,
    [MountingType.TRACKER]: 1.35,
    [MountingType.GROUND_MOUNT]: 1.0,
    [MountingType.ROOF_MOUNT]: 1.1
  },
  
  // Average solar irradiance by state (kWh/m²/day)
  irradianceByState: {
    'AZ': 6.5, 'CA': 5.8, 'NV': 6.2, 'FL': 5.3, 'TX': 5.2,
    'NC': 4.8, 'CO': 5.5, 'UT': 5.9, 'NM': 6.1, 'GA': 4.7,
    'AL': 4.6, 'SC': 4.8, 'LA': 4.5, 'TN': 4.4, 'AR': 4.5,
    'MS': 4.6, 'OK': 5.0, 'KS': 5.1, 'MO': 4.6, 'IL': 4.2,
    'IN': 4.1, 'OH': 3.9, 'KY': 4.2, 'WV': 3.8, 'VA': 4.3,
    'MD': 4.1, 'DE': 4.0, 'NJ': 3.9, 'PA': 3.8, 'NY': 3.6,
    'CT': 3.7, 'RI': 3.8, 'MA': 3.7, 'VT': 3.5, 'NH': 3.6,
    'ME': 3.7, 'WI': 4.0, 'MI': 3.8, 'MN': 4.1, 'IA': 4.3,
    'ND': 4.4, 'SD': 4.6, 'NE': 4.7, 'WY': 5.3, 'MT': 4.8,
    'ID': 4.9, 'WA': 3.4, 'OR': 4.1, 'AK': 2.8, 'HI': 5.4
  } as Record<string, number>,
  
  // Electricity rates by state (USD per kWh)
  electricityRates: {
    'AZ': 0.13, 'CA': 0.23, 'NV': 0.12, 'FL': 0.12, 'TX': 0.12,
    'NC': 0.11, 'CO': 0.12, 'UT': 0.11, 'NM': 0.13, 'GA': 0.12,
    'AL': 0.12, 'SC': 0.13, 'LA': 0.10, 'TN': 0.11, 'AR': 0.10,
    'MS': 0.11, 'OK': 0.10, 'KS': 0.13, 'MO': 0.11, 'IL': 0.13,
    'IN': 0.13, 'OH': 0.13, 'KY': 0.11, 'WV': 0.12, 'VA': 0.12,
    'MD': 0.14, 'DE': 0.13, 'NJ': 0.16, 'PA': 0.14, 'NY': 0.19,
    'CT': 0.22, 'RI': 0.23, 'MA': 0.22, 'VT': 0.18, 'NH': 0.20,
    'ME': 0.16, 'WI': 0.14, 'MI': 0.16, 'MN': 0.13, 'IA': 0.12,
    'ND': 0.11, 'SD': 0.12, 'NE': 0.11, 'WY': 0.11, 'MT': 0.11,
    'ID': 0.10, 'WA': 0.10, 'OR': 0.11, 'AK': 0.23, 'HI': 0.33
  } as Record<string, number>
}

export class ROIService {
  /**
   * Calculate ROI and project costs for solar installation
   */
  static calculateROI(request: ROICalculationRequest): ROICalculationResult {
    const {
      projectType,
      location,
      systemSizeKw,
      panelWattage = 400, // Default 400W panels
      mountingType,
      targetBudget
    } = request

    // Extract state from location (assume format like "85001" or "Phoenix, AZ")
    const state = this.extractStateFromLocation(location)
    
    // Calculate basic system parameters
    const estimatedPanels = Math.ceil((systemSizeKw * 1000) / panelWattage)
    
    // Calculate costs
    const baseCostPerWatt = SOLAR_DATA.costPerWatt[projectType]
    const mountingMultiplier = SOLAR_DATA.mountingMultiplier[mountingType]
    const totalCostPerWatt = baseCostPerWatt * mountingMultiplier
    
    const systemCost = systemSizeKw * 1000 * totalCostPerWatt
    
    // Cost breakdown
    const breakdown = {
      panelCost: systemCost * 0.35,
      inverterCost: systemCost * 0.15,
      rackingCost: systemCost * 0.12,
      installationCost: systemCost * 0.25,
      permitsCost: systemCost * 0.08,
      otherCosts: systemCost * 0.05
    }
    
    // Calculate freight cost (simplified)
    const freightCost = this.calculateFreightCost(systemSizeKw, projectType)
    
    // Total estimated cost
    const estimatedCost = systemCost + freightCost
    
    // Calculate energy production
    const irradiance = SOLAR_DATA.irradianceByState[state] || 4.5
    const systemEfficiency = 0.85 // Account for losses
    const energyProduction = systemSizeKw * irradiance * 365 * systemEfficiency
    
    // Calculate savings
    const electricityRate = SOLAR_DATA.electricityRates[state] || 0.13
    const annualSavings = energyProduction * electricityRate
    const totalSavings25Years = annualSavings * 25 * 0.95 // Account for degradation
    
    // Calculate ROI
    const paybackPeriod = estimatedCost / annualSavings
    const roiYears = Math.round(paybackPeriod * 100) / 100
    
    // Calculate CO2 offset (0.92 lbs CO2 per kWh)
    const co2OffsetTons = (energyProduction * 0.92 * 0.000453592) // Convert lbs to metric tons
    
    // Installation time estimate
    const installationTime = this.calculateInstallationTime(systemSizeKw, projectType)
    
    return {
      estimatedPanels,
      estimatedCost: Math.round(estimatedCost),
      roiYears,
      co2OffsetTons: Math.round(co2OffsetTons * 100) / 100,
      installationTime,
      freightCost: Math.round(freightCost),
      energyProduction: Math.round(energyProduction),
      breakdown: {
        panelCost: Math.round(breakdown.panelCost),
        inverterCost: Math.round(breakdown.inverterCost),
        rackingCost: Math.round(breakdown.rackingCost),
        installationCost: Math.round(breakdown.installationCost),
        permitsCost: Math.round(breakdown.permitsCost),
        otherCosts: Math.round(breakdown.otherCosts)
      },
      savings: {
        annualSavings: Math.round(annualSavings),
        totalSavings25Years: Math.round(totalSavings25Years),
        paybackPeriod: Math.round(paybackPeriod * 100) / 100
      }
    }
  }

  /**
   * Extract state abbreviation from location string
   */
  private static extractStateFromLocation(location: string): string {
    // Try to extract state from common formats
    const stateMatch = location.match(/\b([A-Z]{2})\b/)
    if (stateMatch) {
      return stateMatch[1]
    }
    
    // ZIP code to state mapping (simplified - just a few examples)
    const zipToState: { [key: string]: string } = {
      '85': 'AZ', '90': 'CA', '89': 'NV', '33': 'FL', '75': 'TX',
      '27': 'NC', '80': 'CO', '84': 'UT', '87': 'NM', '30': 'GA'
    }
    
    const zipPrefix = location.substring(0, 2)
    return zipToState[zipPrefix] || 'CA' // Default to California
  }

  /**
   * Calculate freight cost based on system size and type
   */
  private static calculateFreightCost(systemSizeKw: number, projectType: ProjectType): number {
    const baseCost = 500 // Base freight cost
    const perKwCost = projectType === ProjectType.UTILITY_SCALE ? 15 : 25
    
    return baseCost + (systemSizeKw * perKwCost)
  }

  /**
   * Calculate installation time estimate
   */
  private static calculateInstallationTime(systemSizeKw: number, projectType: ProjectType): string {
    let daysPerKw: number
    
    switch (projectType) {
      case ProjectType.ROOFTOP:
        daysPerKw = 0.5
        break
      case ProjectType.COMMERCIAL:
        daysPerKw = 0.3
        break
      case ProjectType.GROUND:
        daysPerKw = 0.2
        break
      case ProjectType.UTILITY_SCALE:
        daysPerKw = 0.1
        break
      default:
        daysPerKw = 0.3
    }
    
    const totalDays = Math.ceil(systemSizeKw * daysPerKw)
    const weeks = Math.ceil(totalDays / 5) // 5 working days per week
    
    if (weeks <= 1) {
      return `${totalDays} days`
    } else if (weeks <= 4) {
      return `${weeks} weeks`
    } else {
      const months = Math.ceil(weeks / 4)
      return `${months} months`
    }
  }

  /**
   * Get solar irradiance data for location
   */
  static getSolarIrradiance(location: string): number {
    const state = this.extractStateFromLocation(location)
    return SOLAR_DATA.irradianceByState[state] || 4.5
  }

  /**
   * Get electricity rate for location
   */
  static getElectricityRate(location: string): number {
    const state = this.extractStateFromLocation(location)
    return SOLAR_DATA.electricityRates[state] || 0.13
  }
} 