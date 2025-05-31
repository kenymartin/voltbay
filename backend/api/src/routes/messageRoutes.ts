import { Router } from 'express'
import { MessageController } from '../controllers/messageController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const messageController = new MessageController()

// All message routes require authentication
router.use(authMiddleware.authenticate)

// Message management
router.post('/', messageController.sendMessage)
router.get('/conversations', messageController.getConversations)
router.get('/unread-count', messageController.getUnreadCount)
router.get('/:otherUserId', messageController.getMessages)
router.patch('/:otherUserId/read', messageController.markAsRead)

export default router 