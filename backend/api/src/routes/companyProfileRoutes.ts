import { Router } from 'express'
import * as companyProfileController from '../controllers/companyProfileController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

// Get the logged-in user's own company profile
router.get('/me', authMiddleware.authenticate, companyProfileController.getMyCompanyProfile)

// Get a public company profile by its ID
router.get('/:id', companyProfileController.getCompanyProfile)

// Update a company profile (must be the owner)
router.put('/:id', authMiddleware.authenticate, companyProfileController.updateCompanyProfile)

// Note: Document upload/listing routes removed as CompanyDocument model doesn't exist in schema

export default router 