import { prisma } from '../config/database'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'

interface NotificationQuery {
  page: number
  limit: number
  unreadOnly: boolean
}

export class NotificationService {
  async getNotifications(userId: string, query: NotificationQuery) {
    const { page, limit, unreadOnly } = query
    const skip = (page - 1) * limit

    const where: any = { userId }
    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      throw new AppError('Notification not found', 404)
    }

    if (notification.userId !== userId) {
      throw new AppError('Access denied', 403)
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })

    logger.info(`Notification marked as read: ${notificationId}`)
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false
      },
      data: { isRead: true }
    })

    logger.info(`All notifications marked as read for user: ${userId}`)
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      throw new AppError('Notification not found', 404)
    }

    if (notification.userId !== userId) {
      throw new AppError('Access denied', 403)
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    })

    logger.info(`Notification deleted: ${notificationId}`)
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    })

    return count
  }

  async createNotification(data: {
    userId: string
    type: string
    title: string
    message: string
    data?: any
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        data: data.data || {}
      }
    })

    logger.info(`Notification created: ${notification.id} for user: ${data.userId}`)
    return notification
  }
} 