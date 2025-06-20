import { Router, Request, Response } from 'express'
import FeatureFlags from '../utils/featureFlags'

const router = Router()

/**
 * GET /api/feature-flags
 * Returns current feature flags status
 * Useful for debugging and frontend feature detection
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const flags = FeatureFlags.getAll()
    
    res.json({
      success: true,
      data: {
        features: flags,
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Feature flags error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feature flags'
    })
  }
})

export default router 