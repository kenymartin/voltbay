import { Router } from 'express'
import { OrderController } from '../controllers/orderController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const orderController = new OrderController()

// All order routes require authentication
router.use(authMiddleware.authenticate)

// Order management
router.post('/', orderController.createOrder)
router.get('/', orderController.getOrders)
router.get('/stats', orderController.getOrderStats)
router.get('/:id', orderController.getOrder)

// Order status management
router.patch('/:id/status', orderController.updateOrderStatus)
router.patch('/:id/shipping', orderController.updateShipping)
router.patch('/:id/cancel', orderController.cancelOrder)
router.patch('/:id/confirm-delivery', orderController.confirmDelivery)

export default router 