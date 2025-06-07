import { Router } from 'express'
import { ProductController } from '../controllers/productController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const productController = new ProductController()

// All bid routes require authentication
router.use(authMiddleware.authenticate)

// Get user's bids
router.get('/my-bids', productController.getUserBids)

export default router 