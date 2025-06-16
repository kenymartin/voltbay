import { Router } from 'express'
import { AdminController } from '../controllers/adminController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const adminController = new AdminController()

// All admin routes require admin authentication
router.use(authMiddleware.authenticate)
router.use(authMiddleware.requireAdmin)

// Admin stats endpoint
router.get('/stats', adminController.getStats)

// Admin user management
router.get('/users', adminController.getUsers)
router.post('/users/:id/ban', adminController.banUser)
router.post('/users/:id/unban', adminController.unbanUser)
router.post('/users/:id/verify', adminController.verifyUser)

// Admin product management
router.get('/products', adminController.getProducts)
router.post('/products/:id/approve', adminController.approveProduct)
router.post('/products/:id/reject', adminController.rejectProduct)
router.post('/products/:id/suspend', adminController.suspendProduct)

// Admin category management
router.get('/categories', adminController.getCategories)
router.post('/categories', adminController.createCategory)
router.delete('/categories/:id', adminController.deleteCategory)

// Admin order management
router.get('/orders', adminController.getOrders)

export default router 