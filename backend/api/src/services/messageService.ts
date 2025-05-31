import { prisma } from '../config/database'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'

interface SendMessageData {
  senderId: string
  receiverId: string
  content: string
  productId?: string
}

interface MessageQuery {
  productId?: string
  page: number
  limit: number
}

interface ConversationQuery {
  page: number
  limit: number
}

export class MessageService {
  async sendMessage(data: SendMessageData) {
    const { senderId, receiverId, content, productId } = data

    // Validate receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      throw new AppError('Receiver not found', 404)
    }

    if (senderId === receiverId) {
      throw new AppError('Cannot send message to yourself', 400)
    }

    // Validate product if provided
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        throw new AppError('Product not found', 404)
      }
    }

    const message = await prisma.$transaction(async (tx) => {
      // Create the message
      const newMessage = await tx.message.create({
        data: {
          senderId,
          receiverId,
          content,
          productId
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          product: {
            select: {
              id: true,
              title: true,
              imageUrls: true,
              price: true,
              status: true
            }
          }
        }
      })

      // Create notification for receiver
      await tx.notification.create({
        data: {
          userId: receiverId,
          type: 'MESSAGE_RECEIVED',
          title: 'New Message',
          message: `You have a new message from ${receiver.firstName || receiver.email}`,
          data: {
            messageId: newMessage.id,
            senderId,
            productId
          }
        }
      })

      return newMessage
    })

    logger.info(`Message sent: ${message.id} from ${senderId} to ${receiverId}`)
    return message
  }

  async getConversations(userId: string, query: ConversationQuery) {
    const { page, limit } = query
    const skip = (page - 1) * limit

    // Get unique conversations with latest message
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT ON (
        CASE 
          WHEN "senderId" = ${userId} THEN "receiverId"
          ELSE "senderId"
        END
      )
        CASE 
          WHEN "senderId" = ${userId} THEN "receiverId"
          ELSE "senderId"
        END as "otherUserId",
        "sentAt" as "lastMessageAt",
        "content" as "lastMessage",
        "isRead",
        "productId"
      FROM "messages"
      WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
      ORDER BY 
        CASE 
          WHEN "senderId" = ${userId} THEN "receiverId"
          ELSE "senderId"
        END,
        "sentAt" DESC
      LIMIT ${limit}
      OFFSET ${skip}
    ` as any[]

    // Get user details for each conversation
    const conversationsWithUsers = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = await prisma.user.findUnique({
          where: { id: conv.otherUserId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        })

        const product = conv.productId ? await prisma.product.findUnique({
          where: { id: conv.productId },
          select: {
            id: true,
            title: true,
            imageUrls: true,
            price: true,
            status: true
          }
        }) : null

        // Count unread messages from this user
        const unreadCount = await prisma.message.count({
          where: {
            senderId: conv.otherUserId,
            receiverId: userId,
            isRead: false
          }
        })

        return {
          otherUser,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
          product
        }
      })
    )

    const total = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT 
        CASE 
          WHEN "senderId" = ${userId} THEN "receiverId"
          ELSE "senderId"
        END
      ) as count
      FROM "messages"
      WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
    ` as any[]

    return {
      conversations: conversationsWithUsers,
      pagination: {
        page,
        limit,
        total: Number(total[0]?.count || 0),
        pages: Math.ceil(Number(total[0]?.count || 0) / limit)
      }
    }
  }

  async getMessages(userId: string, otherUserId: string, query: MessageQuery) {
    const { productId, page, limit } = query
    const skip = (page - 1) * limit

    const where: any = {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }

    if (productId) {
      where.productId = productId
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true
            }
          },
          product: {
            select: {
              id: true,
              title: true,
              imageUrls: true,
              price: true,
              status: true
            }
          }
        },
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.message.count({ where })
    ])

    // Mark messages from other user as read
    await this.markMessagesAsRead(userId, otherUserId)

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async markMessagesAsRead(userId: string, otherUserId: string) {
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    logger.info(`Messages marked as read for user ${userId} from ${otherUserId}`)
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    })

    return count
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      throw new AppError('Message not found', 404)
    }

    if (message.senderId !== userId) {
      throw new AppError('Can only delete your own messages', 403)
    }

    await prisma.message.delete({
      where: { id: messageId }
    })

    logger.info(`Message deleted: ${messageId} by user ${userId}`)
  }
} 