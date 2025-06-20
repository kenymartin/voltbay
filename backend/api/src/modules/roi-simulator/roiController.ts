import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { ROICalculationRequest } from '@shared'
import { ROIService } from './roiService'
import FeatureFlags from '../../utils/featureFlags'

const prisma = new PrismaClient()

export class ROIController {
  /**
   * Calculate ROI for solar project
   * POST /api/roi/calculate
   */
  static async calculateROI(req: Request, res: Response) {
    try {
      // Check feature flag
      if (!FeatureFlags.roiSimulator) {
        return res.status(403).json({
          success: false,
          message: 'ROI simulator feature is not enabled'
        })
      }

      const data: ROICalculationRequest = req.body

      // Validate required fields
      if (!data.projectType || !data.location || !data.systemSizeKw || !data.mountingType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: projectType, location, systemSizeKw, mountingType'
        })
      }

      // Calculate ROI
      const result = ROIService.calculateROI(data)

      // Save simulation if user is authenticated
      const userId = req.user?.id
      if (userId) {
        try {
          await prisma.rOISimulation.create({
            data: {
              userId,
              projectType: data.projectType,
              location: data.location,
              systemSizeKw: data.systemSizeKw,
              panelWattage: data.panelWattage,
              mountingType: data.mountingType,
              targetBudget: data.targetBudget,
              estimatedPanels: result.estimatedPanels,
              estimatedCost: result.estimatedCost,
              roiYears: result.roiYears,
              co2OffsetTons: result.co2OffsetTons,
              installationTime: result.installationTime,
              freightCost: result.freightCost,
              energyProduction: result.energyProduction
            }
          })
        } catch (saveError) {
          console.error('Failed to save ROI simulation:', saveError)
          // Continue without failing the request
        }
      }

      res.json({
        success: true,
        data: { result }
      })
    } catch (error) {
      console.error('ROI calculation error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to calculate ROI'
      })
    }
  }

  /**
   * Get user's ROI simulations
   * GET /api/roi/simulations
   */
  static async getMySimulations(req: Request, res: Response) {
    try {
      if (!FeatureFlags.roiSimulator) {
        return res.status(403).json({
          success: false,
          message: 'ROI simulator feature is not enabled'
        })
      }

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const { page = 1, limit = 20 } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const [simulations, total] = await Promise.all([
        prisma.rOISimulation.findMany({
          where: { userId },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.rOISimulation.count({
          where: { userId }
        })
      ])

      res.json({
        success: true,
        data: { simulations },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      })
    } catch (error) {
      console.error('Get ROI simulations error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ROI simulations'
      })
    }
  }

  /**
   * Get solar data for location
   * GET /api/roi/solar-data/:location
   */
  static async getSolarData(req: Request, res: Response) {
    try {
      if (!FeatureFlags.roiSimulator) {
        return res.status(403).json({
          success: false,
          message: 'ROI simulator feature is not enabled'
        })
      }

      const { location } = req.params

      if (!location) {
        return res.status(400).json({
          success: false,
          message: 'Location parameter is required'
        })
      }

      const irradiance = ROIService.getSolarIrradiance(location)
      const electricityRate = ROIService.getElectricityRate(location)

      res.json({
        success: true,
        data: {
          location,
          irradiance,
          electricityRate,
          unit: 'kWh/m²/day'
        }
      })
    } catch (error) {
      console.error('Get solar data error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch solar data'
      })
    }
  }

  /**
   * Delete ROI simulation
   * DELETE /api/roi/simulations/:id
   */
  static async deleteSimulation(req: Request, res: Response) {
    try {
      if (!FeatureFlags.roiSimulator) {
        return res.status(403).json({
          success: false,
          message: 'ROI simulator feature is not enabled'
        })
      }

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        })
      }

      const { id } = req.params

      // Verify simulation belongs to user
      const simulation = await prisma.rOISimulation.findFirst({
        where: {
          id,
          userId
        }
      })

      if (!simulation) {
        return res.status(404).json({
          success: false,
          message: 'ROI simulation not found'
        })
      }

      await prisma.rOISimulation.delete({
        where: { id }
      })

      res.json({
        success: true,
        message: 'ROI simulation deleted successfully'
      })
    } catch (error) {
      console.error('Delete ROI simulation error:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete ROI simulation'
      })
    }
  }
} 