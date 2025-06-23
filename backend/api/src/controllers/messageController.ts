import { Request, Response, NextFunction } from 'express'
import { MessageService } from '../services/messageService'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'
import { 
  sendMessageSchema,
  getMessagesSchema,
  getConversationsSchema,
  markMessageReadSchema,
  createConversationSchema
} from '../validators/messageValidators'

export class MessageController {
  private messageService: MessageService

  constructor() {
    this.messageService = new MessageService()
  }

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const validatedData = sendMessageSchema.parse(req.body)
      
      // Clean null values to undefined for the service
      const cleanedData = {
        ...validatedData,
        senderId: userId,
        productId: validatedData.productId || undefined,
        context: validatedData.context ? {
          ...validatedData.context,
          quoteRequestId: validatedData.context.quoteRequestId || undefined,
          vendorId: validatedData.context.vendorId || undefined,
          projectType: validatedData.context.projectType || undefined,
          urgency: validatedData.context.urgency
        } : undefined,
        attachments: validatedData.attachments || undefined
      }
      
      const message = await this.messageService.sendMessage(cleanedData)
      
      logger.info(`Message sent: ${message.id} from user: ${userId} to: ${validatedData.receiverId}`)
      
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { message }
      })
    } catch (error) {
      next(error)
    }
  }

  createConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const validatedData = createConversationSchema.parse(req.body)
      
      const conversation = await this.messageService.createConversation({
        ...validatedData,
        initiatorId: userId
      })
      
      logger.info(`Conversation created: ${conversation.id} by user: ${userId}`)
      
      res.status(201).json({
        success: true,
        message: 'Conversation created successfully',
        data: { conversation }
      })
    } catch (error) {
      next(error)
    }
  }

  getConversations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const validatedQuery = getConversationsSchema.parse(req.query)
      
      const result = await this.messageService.getConversations(userId, validatedQuery)
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  getConversationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { conversationId } = req.params
      const { page = 1, limit = 50 } = req.query
      
      const result = await this.messageService.getConversationMessages(userId, conversationId, {
        page: Number(page),
        limit: Number(limit)
      })
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { otherUserId } = req.params
      const validatedQuery = getMessagesSchema.parse(req.query)
      
      const result = await this.messageService.getMessages(userId, otherUserId, validatedQuery)
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const validatedData = markMessageReadSchema.parse(req.body)
      
      await this.messageService.markMessagesAsRead(userId, validatedData.messageIds)
      
      res.json({
        success: true,
        message: 'Messages marked as read'
      })
    } catch (error) {
      next(error)
    }
  }

  markConversationAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { conversationId } = req.params
      
      await this.messageService.markConversationAsRead(userId, conversationId)
      
      res.json({
        success: true,
        message: 'Conversation marked as read'
      })
    } catch (error) {
      next(error)
    }
  }

  getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const count = await this.messageService.getUnreadCount(userId)
      
      res.json({
        success: true,
        data: { unreadCount: count }
      })
    } catch (error) {
      next(error)
    }
  }

  getMessageById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { messageId } = req.params
      
      const message = await this.messageService.getMessageById(userId, messageId)
      
      res.json({
        success: true,
        data: message
      })
    } catch (error) {
      next(error)
    }
  }

  getVendorInquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      // Check if user is a vendor or enterprise vendor
      const user = await this.messageService.getUserById(userId)
      if (user?.role !== 'VENDOR') {
        throw new AppError('Access denied. Vendor access required.', 403)
      }

      const { page = 1, limit = 20, status = 'ALL' } = req.query
      
      const result = await this.messageService.getVendorInquiries(userId, {
        page: Number(page),
        limit: Number(limit),
        status: status as string
      })
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  archiveConversation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { conversationId } = req.params
      
      await this.messageService.archiveConversation(userId, conversationId)
      
      res.json({
        success: true,
        message: 'Conversation archived successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { messageId } = req.params
      
      await this.messageService.deleteMessage(userId, messageId)
      
      res.json({
        success: true,
        message: 'Message deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }
} 