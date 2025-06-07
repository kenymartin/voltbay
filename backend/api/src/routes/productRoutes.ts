import { Router } from 'express'
import { ProductController } from '../controllers/productController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const productController = new ProductController()

// Public routes - specific routes first to avoid conflicts
router.get('/search', productController.getProducts)
router.get('/featured', productController.getFeaturedProducts)
router.get('/auctions', productController.getAuctionProducts)
router.get('/:id/bids', productController.getProductBids)

// Basic products list route
router.get('/', productController.getProducts)

// Protected user routes before the :id route
router.get('/user/my-products', authMiddleware.authenticate, productController.getUserProducts)
router.get('/my-listings', authMiddleware.authenticate, productController.getUserProducts)

// Product detail route (after specific routes)
router.get('/:id', productController.getProduct)

// Protected routes
router.post('/', authMiddleware.authenticate, productController.createProduct)
router.put('/:id', authMiddleware.authenticate, productController.updateProduct)
router.delete('/:id', authMiddleware.authenticate, productController.deleteProduct)
router.post('/:id/bids', authMiddleware.authenticate, productController.placeBid)

export default router 