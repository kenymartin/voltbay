import { Router } from 'express'
import { EnterpriseController } from '../modules/quotes/enterpriseController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

// Enterprise Vendor Directory - EXCLUSIVELY FOR BUYERS
router.get('/vendors', authMiddleware.authenticate, authMiddleware.requireRole(['BUYER']), EnterpriseController.getVendors)
router.get('/vendor/:vendorId', authMiddleware.authenticate, authMiddleware.requireRole(['BUYER']), EnterpriseController.getVendorDetail)

// Enterprise Listing Routes - FOR VENDORS TO MANAGE THEIR SERVICES
router.post('/listing', authMiddleware.authenticate, authMiddleware.requireRole(['VENDOR']), EnterpriseController.createListing)
router.get('/listings', EnterpriseController.getListings) // Public for buyers to see

// Quote Request Routes - FOR ENTERPRISE BUYERS TO REQUEST QUOTES (verification checked in controller)
router.post('/quote-request', authMiddleware.authenticate, authMiddleware.requireRole(['BUYER']), EnterpriseController.createQuoteRequest)
router.get('/my-requests', authMiddleware.authenticate, EnterpriseController.getMyRequests)

// Quote Response Routes - FOR VENDORS TO RESPOND TO QUOTES
router.post('/quote-response', authMiddleware.authenticate, authMiddleware.requireRole(['VENDOR']), EnterpriseController.createQuoteResponse)

// Vendor Dashboard - FOR VENDORS TO MANAGE THEIR PROFILE
router.get('/vendor-dashboard', authMiddleware.authenticate, authMiddleware.requireRole(['VENDOR']), EnterpriseController.getVendorDashboard)

export default router 