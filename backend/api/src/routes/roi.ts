import { Router } from 'express'
import { ROIController } from '../modules/roi-simulator/roiController'
import { authenticateToken, optionalAuth } from '../middleware/auth'

const router = Router()

// ROI Calculation Routes
router.post('/calculate', optionalAuth, ROIController.calculateROI)
router.get('/simulations', authenticateToken, ROIController.getMySimulations)
router.delete('/simulations/:id', authenticateToken, ROIController.deleteSimulation)

// Solar Data Routes
router.get('/solar-data/:location', ROIController.getSolarData)

export default router 