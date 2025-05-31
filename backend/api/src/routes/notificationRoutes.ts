import { Router } from 'express'
import { NotificationController } from '../controllers/notificationController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const notificationController = new NotificationController()

// All notification routes require authentication
router.use(authMiddleware.authenticate)

// Notification management
router.get('/', notificationController.getNotifications)
router.get('/unread-count', notificationController.getUnreadCount)
router.patch('/mark-all-read', notificationController.markAllAsRead)
router.patch('/:id/read', notificationController.markAsRead)
router.delete('/:id', notificationController.deleteNotification)

export default router 