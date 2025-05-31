import { Request, Response, NextFunction } from 'express'
import { MessageService } from '../services/messageService'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'
import { 
  sendMessageSchema,
  getMessagesSchema 
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
      
      const message = await this.messageService.sendMessage({
        ...validatedData,
        senderId: userId
      })
      
      logger.info(`Message sent: ${message.id} from user: ${userId}`)
      
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { message }
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

      const { page = 1, limit = 20 } = req.query
      
      const result = await this.messageService.getConversations(userId, {
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
      const { productId, page = 1, limit = 50 } = req.query
      
      const result = await this.messageService.getMessages(userId, otherUserId, {
        productId: productId as string,
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

  markAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { otherUserId } = req.params
      
      await this.messageService.markMessagesAsRead(userId, otherUserId)
      
      res.json({
        success: true,
        message: 'Messages marked as read'
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
} 