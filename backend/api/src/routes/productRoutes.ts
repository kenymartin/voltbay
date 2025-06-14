import { Router } from 'express'
import { ProductController } from '../controllers/productController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const productController = new ProductController()

// Public routes
router.get('/', productController.getProducts)
router.get('/search', productController.getProducts)
router.get('/featured', productController.getFeaturedProducts)
router.get('/auctions', productController.getAuctionProducts)
router.get('/:id', productController.getProduct)
router.get('/:id/bids', productController.getProductBids)

// Protected routes
router.post('/', authMiddleware.authenticate, authMiddleware.requireVerified, productController.createProduct)
router.put('/:id', authMiddleware.authenticate, authMiddleware.requireVerified, productController.updateProduct)
router.delete('/:id', authMiddleware.authenticate, authMiddleware.requireVerified, productController.deleteProduct)
router.get('/user/my-products', authMiddleware.authenticate, productController.getUserProducts)
router.post('/:id/bids', authMiddleware.authenticate, authMiddleware.requireVerified, productController.placeBid)

export default router 