import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { 
  CreateEnterpriseListingRequest, 
  CreateQuoteRequestRequest, 
  CreateQuoteResponseRequest,
  EnterpriseListingStatus,
  QuoteRequestStatus,
  QuoteResponseStatus
} from '@shared'
import FeatureFlags from '../../utils/featureFlags'

const prisma = new PrismaClient()

export class EnterpriseController {
  /**
   * Create a new enterprise listing
   * POST /api/enterprise/listing
   */
  static async createListing(req: Request, res: Response) {
    try {
      // Check feature flag
      if (!FeatureFlags.industrialQuotes) {
        return res.status(403).json({
          success: false,
          message: 'Industrial quotes feature is not enabled'
        })
      }

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const data: CreateEnterpriseListingRequest = req.body

      const listing = await prisma.enterpriseListing.create({
        data: {
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          vendorId: userId,
          specs: data.specs || {},
          location: data.location,
          deliveryTime: data.deliveryTime,
          basePrice: data.basePrice,
          priceUnit: data.priceUnit,
          imageUrls: data.imageUrls || [],
          documentUrls: data.documentUrls || [],
          status: EnterpriseListingStatus.DRAFT
        },
        include: {
          category: true,
          vendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true
            }
          }
        }
      })

      res.status(201).json({
        success: true,
        data: { listing }
      })
    } catch (error) {
      console.error('Create listing error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create enterprise listing'
      })
    }
  }

  /**
   * Get enterprise listings with filters
   * GET /api/enterprise/listings
   */
  static async getListings(req: Request, res: Response) {
    try {
      if (!FeatureFlags.industrialQuotes) {
        return res.status(403).json({
          success: false,
          message: 'Industrial quotes feature is not enabled'
        })
      }

      const { 
        categoryId, 
        location, 
        status = EnterpriseListingStatus.ACTIVE,
        page = 1, 
        limit = 20 
      } = req.query

      const skip = (Number(page) - 1) * Number(limit)

      const where: any = {
        status: status as EnterpriseListingStatus
      }

      if (categoryId) {
        where.categoryId = categoryId
      }

      if (location) {
        where.location = {
          contains: location as string,
          mode: 'insensitive'
        }
      }

      const [listings, total] = await Promise.all([
        prisma.enterpriseListing.findMany({
          where,
          include: {
            category: true,
            vendor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.enterpriseListing.count({ where })
      ])

      res.json({
        success: true,
        data: { listings },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Get listings error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch enterprise listings'
      })
    }
  }

  /**
   * Create a quote request
   * POST /api/enterprise/quote-request
   */
  static async createQuoteRequest(req: Request, res: Response) {
    try {
      if (!FeatureFlags.industrialQuotes) {
        return res.status(403).json({
          success: false,
          message: 'Industrial quotes feature is not enabled'
        })
      }

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const data = req.body

      // Handle direct vendor quote requests (from vendor detail page)
      if (data.vendorId && !data.listingId) {
        // Verify vendor exists
        const vendor = await prisma.user.findFirst({
          where: {
            id: data.vendorId,
            isEnterprise: true,
            role: 'VENDOR'
          }
        })

        if (!vendor) {
          return res.status(404).json({
            success: false,
            message: 'Vendor not found'
          })
        }

        // Create a direct quote request (not tied to a specific listing)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const quoteRequest = await prisma.quoteRequest.create({
          data: {
            buyerCompanyId: userId,
            requestedQuantity: 1,
            projectSpecs: {
              projectType: data.projectType,
              systemSizeKw: data.systemSizeKw,
              location: data.location,
              budget: data.budget,
              timeline: data.timeline,
              description: data.description,
              documentUrls: data.documentUrls || []
            },
            notes: data.description,
            projectType: data.projectType,
            systemSizeKw: data.systemSizeKw,
            location: data.location,
            budget: data.budget,
            status: QuoteRequestStatus.PENDING,
            expiresAt
          },
          include: {
            buyer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                companyName: true
              }
            }
          }
        })

        // Create a direct quote response entry for the vendor to respond to
        await prisma.quoteResponse.create({
          data: {
            quoteRequestId: quoteRequest.id,
            vendorId: data.vendorId,
            proposedTotalPrice: 0, // Will be filled by vendor
            status: QuoteResponseStatus.PENDING
          }
        })

        res.status(201).json({
          success: true,
          data: { quoteRequest }
        })
        return
      }

      // Handle general quote requests (from ROI calculator)
      if (!data.listingId && !data.vendorId) {
        // This is a general quote request (e.g., from ROI calculator)
        // Create a general quote request that vendors can respond to
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        const quoteRequest = await prisma.quoteRequest.create({
          data: {
            buyerCompanyId: userId,
            requestedQuantity: data.requestedQuantity || 1,
            projectSpecs: data.projectSpecs || {},
            deliveryDeadline: data.deliveryDeadline ? new Date(data.deliveryDeadline) : null,
            notes: data.notes || 'Quote request generated from ROI Calculator',
            projectType: data.projectType,
            systemSizeKw: data.systemSizeKw,
            location: data.location,
            budget: data.budget,
            status: QuoteRequestStatus.PENDING,
            expiresAt
          },
          include: {
            buyer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                companyName: true
              }
            }
          }
        })

        res.status(201).json({
          success: true,
          data: { quoteRequest }
        })
        return
      }

      // Original listing-based quote request logic
      if (!data.listingId) {
        return res.status(400).json({
          success: false,
          message: 'Either listingId or vendorId is required'
        })
      }

      // Verify listing exists and is active
      const listing = await prisma.enterpriseListing.findFirst({
        where: {
          id: data.listingId,
          status: EnterpriseListingStatus.ACTIVE
        }
      })

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Enterprise listing not found or not active'
        })
      }

      // Set expiration date (30 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      const quoteRequest = await prisma.quoteRequest.create({
        data: {
          buyerCompanyId: userId,
          listingId: data.listingId,
          requestedQuantity: data.requestedQuantity,
          projectSpecs: data.projectSpecs || {},
          deliveryDeadline: data.deliveryDeadline ? new Date(data.deliveryDeadline) : null,
          notes: data.notes,
          projectType: data.projectType,
          systemSizeKw: data.systemSizeKw,
          location: data.location,
          budget: data.budget,
          status: QuoteRequestStatus.PENDING,
          expiresAt
        },
        include: {
          listing: {
            include: {
              category: true,
              vendor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          buyer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      })

      res.status(201).json({
        success: true,
        data: { quoteRequest }
      })
    } catch (error) {
      console.error('Create quote request error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create quote request'
      })
    }
  }

  /**
   * Create a quote response
   * POST /api/enterprise/quote-response
   */
  static async createQuoteResponse(req: Request, res: Response) {
    try {
      if (!FeatureFlags.industrialQuotes) {
        return res.status(403).json({
          success: false,
          message: 'Industrial quotes feature is not enabled'
        })
      }

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const data: CreateQuoteResponseRequest = req.body

      // Verify quote request exists and user is the vendor
      const quoteRequest = await prisma.quoteRequest.findFirst({
        where: {
          id: data.quoteRequestId,
          status: QuoteRequestStatus.PENDING
        },
        include: {
          listing: true
        }
      })

      if (!quoteRequest) {
        return res.status(404).json({
          success: false,
          message: 'Quote request not found or not pending'
        })
      }

      // For listing-based quotes, check if user is the vendor
      if (quoteRequest.listing && quoteRequest.listing.vendorId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the listing vendor can respond to this quote'
        })
      }

      // For direct vendor quotes, check if there's already a response from this vendor
      if (!quoteRequest.listing) {
        const existingResponse = await prisma.quoteResponse.findFirst({
          where: {
            quoteRequestId: data.quoteRequestId,
            vendorId: userId
          }
        })

        if (!existingResponse) {
          return res.status(403).json({
            success: false,
            message: 'You are not authorized to respond to this quote request'
          })
        }
      }

      const quoteResponse = await prisma.quoteResponse.create({
        data: {
          quoteRequestId: data.quoteRequestId,
          vendorId: userId,
          proposedTotalPrice: data.proposedTotalPrice,
          deliveryEstimate: data.deliveryEstimate,
          validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
          message: data.message,
          lineItems: data.lineItems || {},
          paymentTerms: data.paymentTerms,
          warrantyTerms: data.warrantyTerms,
          status: QuoteResponseStatus.PENDING
        },
        include: {
          vendor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          quoteRequest: {
            include: {
              listing: true,
              buyer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      })

      // Update quote request status
      await prisma.quoteRequest.update({
        where: { id: data.quoteRequestId },
        data: { status: QuoteRequestStatus.RESPONDED }
      })

      res.status(201).json({
        success: true,
        data: { quoteResponse }
      })
    } catch (error) {
      console.error('Create quote response error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create quote response'
      })
    }
  }

  /**
   * Get user's quote requests
   * GET /api/enterprise/my-requests
   */
  static async getMyRequests(req: Request, res: Response) {
    try {
      if (!FeatureFlags.industrialQuotes) {
        return res.status(403).json({
          success: false,
          message: 'Industrial quotes feature is not enabled'
        })
      }

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const { page = 1, limit = 20, status } = req.query

      const skip = (Number(page) - 1) * Number(limit)
      
      const where: any = {
        buyerCompanyId: userId
      }

      if (status) {
        where.status = status as QuoteRequestStatus
      }

      const [requests, total] = await Promise.all([
        prisma.quoteRequest.findMany({
          where,
          include: {
            listing: {
              include: {
                category: true,
                vendor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            },
            responses: {
              include: {
                vendor: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.quoteRequest.count({ where })
      ])

      res.json({
        success: true,
        data: { requests },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Get my requests error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quote requests'
      })
    }
  }

  /**
   * Get vendor dashboard data
   * GET /api/enterprise/vendor-dashboard
   */
  static async getVendorDashboard(req: Request, res: Response) {
    try {
      if (!FeatureFlags.industrialQuotes) {
        return res.status(403).json({
          success: false,
          message: 'Industrial quotes feature is not enabled'
        })
      }

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const [
        listings,
        pendingRequests,
        totalRequests,
        totalResponses
      ] = await Promise.all([
        prisma.enterpriseListing.findMany({
          where: { vendorId: userId },
          include: {
            category: true,
            _count: {
              select: { quoteRequests: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.quoteRequest.findMany({
          where: {
            listing: { vendorId: userId },
            status: QuoteRequestStatus.PENDING
          },
          include: {
            listing: true,
            buyer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        prisma.quoteRequest.count({
          where: {
            listing: { vendorId: userId }
          }
        }),
        prisma.quoteResponse.count({
          where: { vendorId: userId }
        })
      ])

      res.json({
        success: true,
        data: {
          listings,
          pendingRequests,
          stats: {
            totalListings: listings.length,
            totalRequests,
            totalResponses,
            pendingRequests: pendingRequests.length
          }
        }
      })
    } catch (error) {
      console.error('Get vendor dashboard error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendor dashboard'
      })
    }
  }

  /**
   * Get enterprise vendors directory
   * GET /api/enterprise/vendors
   */
  static async getVendors(req: Request, res: Response) {
    try {
      const { city, state, limit = '12', offset = '0' } = req.query
      console.log('📊 Enterprise vendors request:', { city, state, limit, offset })

      const whereClause: any = {
        isEnterprise: true,
        role: 'VENDOR'
      }

      if (city) {
        whereClause.locationCity = {
          contains: city as string,
          mode: 'insensitive'
        }
      }

      if (state) {
        whereClause.locationState = {
          contains: state as string,
          mode: 'insensitive'
        }
      }

      console.log('🔍 Where clause:', whereClause)

      // Get total count for pagination
      const totalCount = await prisma.user.count({
        where: whereClause
      })

      console.log('📈 Total count:', totalCount)

      const vendors = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          companyName: true,
          locationCity: true,
          locationState: true,
          avatar: true,
          createdAt: true,
          vendorProjects: {
            where: {
              status: 'completed'
            },
            select: {
              id: true
            }
          }
        },
        orderBy: {
          companyName: 'asc'
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      })

      console.log('👥 Found vendors:', vendors.length)

      const vendorsWithProjectCount = vendors.map(vendor => ({
        id: vendor.id,
        companyName: vendor.companyName,
        locationCity: vendor.locationCity,
        locationState: vendor.locationState,
        avatar: vendor.avatar,
        completedJobs: vendor.vendorProjects.length,
        memberSince: vendor.createdAt
      }))

      const paginationInfo = {
        total: totalCount,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: parseInt(offset as string) + parseInt(limit as string) < totalCount
      }

      console.log('📄 Pagination info:', paginationInfo)

      const response = {
        success: true,
        data: vendorsWithProjectCount,
        pagination: paginationInfo
      }

      console.log('📤 Sending response with data length:', vendorsWithProjectCount.length)
      res.json(response)
    } catch (error) {
      console.error('❌ Error fetching vendors:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendors'
      })
    }
  }

  /**
   * Get detailed vendor information
   * GET /api/enterprise/vendor/:vendorId
   */
  static async getVendorDetail(req: Request, res: Response) {
    try {
      const { vendorId } = req.params

      if (!vendorId) {
        return res.status(400).json({
          success: false,
          message: 'Vendor ID is required'
        })
      }

      const vendor = await prisma.user.findFirst({
        where: {
          id: vendorId,
          isEnterprise: true,
          role: 'VENDOR'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          companyName: true,
          locationCity: true,
          locationState: true,
          phone: true,
          avatar: true,
          createdAt: true,
          vendorProjects: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              projectType: true,
              systemSizeKw: true,
              location: true,
              completedAt: true,
              createdAt: true
            },
            orderBy: {
              completedAt: 'desc'
            }
          },
          enterpriseListings: {
            where: {
              status: 'ACTIVE'
            },
            select: {
              id: true,
              name: true,
              description: true,
              documentUrls: true,
              imageUrls: true,
              createdAt: true
            }
          }
        }
      })

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found'
        })
      }

      // Mock additional data that would come from other sources
      const vendorDetail = {
        id: vendor.id,
        companyName: vendor.companyName,
        locationCity: vendor.locationCity,
        locationState: vendor.locationState,
        avatar: vendor.avatar,
        completedJobs: vendor.vendorProjects.filter(p => p.status === 'completed').length,
        memberSince: vendor.createdAt,
        email: vendor.email,
        phone: vendor.phone || '(555) 123-4567',
        website: `https://${vendor.companyName?.toLowerCase().replace(/\s+/g, '')}.com`,
        description: `${vendor.companyName} is a leading solar energy solutions provider specializing in commercial and industrial installations. With years of experience and a commitment to quality, we deliver reliable and efficient solar systems that help businesses reduce their carbon footprint and energy costs.`,
        specialties: [
          'Commercial Solar Installation',
          'Industrial Solar Systems',
          'Solar Panel Manufacturing',
          'Energy Storage Solutions',
          'Grid-Tie Systems',
          'Solar Maintenance & Monitoring'
        ],
        certifications: [
          'NABCEP Certified',
          'OSHA 30-Hour Certified',
          'UL Listed Components',
          'IEC 61215 Certified',
          'ISO 9001:2015 Quality Management',
          'Better Business Bureau A+ Rating'
        ],
        projects: vendor.vendorProjects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description,
          status: project.status,
          projectType: project.projectType,
          systemSizeKw: project.systemSizeKw,
          location: project.location,
          completedAt: project.completedAt || project.createdAt
        })),
        documents: vendor.enterpriseListings.flatMap(listing => 
          listing.documentUrls.map((url, index) => ({
            id: `${listing.id}-doc-${index}`,
            name: `${listing.name} - Specification Sheet.pdf`,
            type: 'pdf',
            url: url,
            uploadedAt: listing.createdAt,
            size: 2048000 // 2MB mock size
          }))
        )
      }

      res.json({
        success: true,
        data: vendorDetail
      })
    } catch (error) {
      console.error('Error fetching vendor detail:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch vendor details'
      })
    }
  }
} 