// Enterprise Quote System Types

export enum EnterpriseListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED'
}

export enum QuoteRequestStatus {
  PENDING = 'PENDING',
  RESPONDED = 'RESPONDED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum QuoteResponseStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export enum ProjectType {
  ROOFTOP = 'ROOFTOP',
  GROUND = 'GROUND',
  UTILITY_SCALE = 'UTILITY_SCALE',
  COMMERCIAL = 'COMMERCIAL'
}

export enum MountingType {
  FIXED = 'FIXED',
  ADJUSTABLE = 'ADJUSTABLE',
  TRACKER = 'TRACKER',
  GROUND_MOUNT = 'GROUND_MOUNT',
  ROOF_MOUNT = 'ROOF_MOUNT'
}

// Enterprise Listing Interface
export interface EnterpriseListing {
  id: string
  name: string
  description: string
  categoryId: string
  category?: {
    id: string
    name: string
    description?: string
  }
  vendorId: string
  vendor?: {
    id: string
    firstName?: string
    lastName?: string
    email: string
    role: string
  }
  specs?: Record<string, any>
  location: string
  deliveryTime?: string
  basePrice?: number
  priceUnit?: string
  status: EnterpriseListingStatus
  quoteOnly: boolean
  imageUrls: string[]
  documentUrls: string[]
  createdAt: string
  updatedAt: string
}

// Quote Request Interface
export interface QuoteRequest {
  id: string
  buyerCompanyId: string
  buyer?: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  listingId: string
  listing?: EnterpriseListing
  requestedQuantity: number
  projectSpecs?: Record<string, any>
  deliveryDeadline?: string
  notes?: string
  projectType?: ProjectType
  systemSizeKw?: number
  location?: string
  mountingType?: MountingType
  budget?: number
  status: QuoteRequestStatus
  createdAt: string
  updatedAt: string
  expiresAt?: string
  responses?: QuoteResponse[]
}

// Quote Response Interface
export interface QuoteResponse {
  id: string
  quoteRequestId: string
  quoteRequest?: QuoteRequest
  vendorId: string
  vendor?: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  proposedTotalPrice: number
  deliveryEstimate?: string
  validUntil?: string
  message?: string
  pdfProposalUrl?: string
  lineItems?: Record<string, any>
  paymentTerms?: string
  warrantyTerms?: string
  status: QuoteResponseStatus
  createdAt: string
  updatedAt: string
}

// ROI Simulation Interface
export interface ROISimulation {
  id: string
  userId?: string
  user?: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  projectType: ProjectType
  location: string
  systemSizeKw: number
  panelWattage?: number
  mountingType: MountingType
  targetBudget?: number
  estimatedPanels: number
  estimatedCost: number
  roiYears: number
  co2OffsetTons: number
  installationTime?: string
  freightCost?: number
  energyProduction?: number
  createdAt: string
}

// Request/Response DTOs
export interface CreateEnterpriseListingRequest {
  name: string
  description: string
  categoryId: string
  specs?: Record<string, any>
  location: string
  deliveryTime?: string
  basePrice?: number
  priceUnit?: string
  imageUrls?: string[]
  documentUrls?: string[]
}

export interface CreateQuoteRequestRequest {
  listingId: string
  requestedQuantity: number
  projectSpecs?: Record<string, any>
  deliveryDeadline?: string
  notes?: string
  projectType?: ProjectType
  systemSizeKw?: number
  location?: string
  mountingType?: MountingType
  budget?: number
}

export interface CreateQuoteResponseRequest {
  quoteRequestId: string
  proposedTotalPrice: number
  deliveryEstimate?: string
  validUntil?: string
  message?: string
  lineItems?: Record<string, any>
  paymentTerms?: string
  warrantyTerms?: string
}

export interface ROICalculationRequest {
  projectType: ProjectType
  location: string
  systemSizeKw: number
  panelWattage?: number
  mountingType: MountingType
  targetBudget?: number
}

export interface ROICalculationResult {
  estimatedPanels: number
  estimatedCost: number
  roiYears: number
  co2OffsetTons: number
  installationTime: string
  freightCost: number
  energyProduction: number
  breakdown: {
    panelCost: number
    inverterCost: number
    rackingCost: number
    installationCost: number
    permitsCost: number
    otherCosts: number
  }
  savings: {
    annualSavings: number
    totalSavings25Years: number
    paybackPeriod: number
  }
} 