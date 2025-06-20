import { Router } from 'express'
import { EnterpriseController } from '../modules/quotes/enterpriseController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Enterprise Vendor Directory
router.get('/vendors', EnterpriseController.getVendors)
router.get('/vendor/:vendorId', EnterpriseController.getVendorDetail)

// Enterprise Listing Routes
router.post('/listing', authenticateToken, EnterpriseController.createListing)
router.get('/listings', EnterpriseController.getListings)

// Quote Request Routes
router.post('/quote-request', authenticateToken, EnterpriseController.createQuoteRequest)
router.get('/my-requests', authenticateToken, EnterpriseController.getMyRequests)

// Quote Response Routes
router.post('/quote-response', authenticateToken, EnterpriseController.createQuoteResponse)

// Vendor Dashboard
router.get('/vendor-dashboard', authenticateToken, EnterpriseController.getVendorDashboard)

export default router 