import { Router } from 'express'
import { ROIController } from '../modules/roi-simulator/roiController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

// ROI Calculation Routes - EXCLUSIVELY FOR BUYERS
router.post('/calculate', authMiddleware.authenticate, authMiddleware.requireRole(['BUYER']), ROIController.calculateROI)
router.get('/simulations', authMiddleware.authenticate, authMiddleware.requireRole(['BUYER']), ROIController.getMySimulations)
router.delete('/simulations/:id', authMiddleware.authenticate, authMiddleware.requireRole(['BUYER']), ROIController.deleteSimulation)

// Solar Data Routes
router.get('/solar-data/:location', ROIController.getSolarData)

export default router 