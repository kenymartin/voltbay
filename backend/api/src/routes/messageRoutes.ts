import { Router } from 'express'
import { MessageController } from '../controllers/messageController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const messageController = new MessageController()

// All message routes require authentication
router.use(authMiddleware.authenticate)

// Conversation management
router.post('/conversations', messageController.createConversation)
router.get('/conversations', messageController.getConversations)
router.get('/conversations/:conversationId', messageController.getConversationById)
router.patch('/conversations/:conversationId/read', messageController.markConversationAsRead)
router.patch('/conversations/:conversationId/archive', messageController.archiveConversation)

// Vendor-specific routes
router.get('/vendor/inquiries', messageController.getVendorInquiries)

// Message management
router.post('/', messageController.sendMessage)
router.get('/unread-count', messageController.getUnreadCount)
router.get('/message/:messageId', messageController.getMessageById)
router.delete('/:messageId', messageController.deleteMessage)
router.patch('/read', messageController.markAsRead)

// Legacy direct message routes (maintain backward compatibility)
router.get('/:otherUserId', messageController.getMessages)

export default router 