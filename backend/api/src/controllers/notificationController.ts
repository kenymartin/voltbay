import { Request, Response, NextFunction } from 'express'
import { NotificationService } from '../services/notificationService'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'

export class NotificationController {
  private notificationService: NotificationService

  constructor() {
    this.notificationService = new NotificationService()
  }

  getNotifications = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { page = 1, limit = 20, unreadOnly = false } = req.query
      
      const result = await this.notificationService.getNotifications(userId, {
        page: Number(page),
        limit: Number(limit),
        unreadOnly: unreadOnly === 'true'
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

      const { id } = req.params
      
      await this.notificationService.markAsRead(id, userId)
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      })
    } catch (error) {
      next(error)
    }
  }

  markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      await this.notificationService.markAllAsRead(userId)
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      })
    } catch (error) {
      next(error)
    }
  }

  deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { id } = req.params
      
      await this.notificationService.deleteNotification(id, userId)
      
      res.json({
        success: true,
        message: 'Notification deleted'
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

      const count = await this.notificationService.getUnreadCount(userId)
      
      res.json({
        success: true,
        data: { unreadCount: count }
      })
    } catch (error) {
      next(error)
    }
  }
} 