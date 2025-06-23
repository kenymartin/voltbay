import { prisma } from '../config/database'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'

interface SendMessageData {
  senderId: string
  receiverId: string
  content: string
  productId?: string | null
  messageType?: 'GENERAL' | 'PRODUCT_INQUIRY' | 'QUOTE_DISCUSSION' | 'VENDOR_INQUIRY' | 'SUPPORT'
  context?: {
    quoteRequestId?: string | null
    vendorId?: string | null
    projectType?: string | null
    urgency?: 'LOW' | 'MEDIUM' | 'HIGH'
  }
  attachments?: Array<{
    filename: string
    url: string
    size: number
    type: string
  }> | null
}

interface MessageQuery {
  productId?: string
  conversationId?: string
  messageType?: string
  page: number
  limit: number
}

interface ConversationQuery {
  type: 'ALL' | 'VENDOR' | 'CUSTOMER' | 'PRODUCT' | 'QUOTE'
  status: 'ALL' | 'ACTIVE' | 'ARCHIVED'
  page: number
  limit: number
}

interface CreateConversationData {
  initiatorId: string
  participantId: string
  subject: string
  initialMessage: string
  context: {
    type: 'VENDOR_INQUIRY' | 'PRODUCT_INQUIRY' | 'QUOTE_DISCUSSION' | 'GENERAL'
    productId?: string
    quoteRequestId?: string
    vendorId?: string
  }
}

export class MessageService {
  async sendMessage(data: SendMessageData) {
    const { 
      senderId, 
      receiverId, 
      content, 
      productId, 
      messageType = 'GENERAL',
      context,
      attachments
    } = data

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
          productId,
          messageType,
          context: context ? JSON.stringify(context) : null,
          attachments: attachments ? JSON.stringify(attachments) : null
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isEnterprise: true,
              companyName: true
            }
          },
          receiver: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isEnterprise: true,
              companyName: true
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
      const notificationTitle = messageType === 'VENDOR_INQUIRY' ? 'New Vendor Inquiry' :
                               messageType === 'PRODUCT_INQUIRY' ? 'Product Inquiry' :
                               messageType === 'QUOTE_DISCUSSION' ? 'Quote Discussion' :
                               'New Message'

      await tx.notification.create({
        data: {
          userId: receiverId,
          type: 'MESSAGE_RECEIVED',
          title: notificationTitle,
          message: `You have a new message from ${newMessage.sender.firstName || newMessage.sender.email}`,
          data: {
            messageId: newMessage.id,
            senderId,
            productId,
            messageType,
            context
          }
        }
      })

      return {
        ...newMessage,
        context: newMessage.context ? JSON.parse(newMessage.context) : null,
        attachments: newMessage.attachments ? JSON.parse(newMessage.attachments) : null
      }
    })

    logger.info(`Message sent: ${message.id} from ${senderId} to ${receiverId} (${messageType})`)
    return message
  }

  async createConversation(data: CreateConversationData) {
    const { initiatorId, participantId, subject, initialMessage, context } = data

    // Validate users exist
    await this.getUserById(initiatorId)
    await this.getUserById(participantId)

    // Map context type to ConversationType
    const getConversationType = (contextType: string): string => {
      switch (contextType) {
        case 'VENDOR_INQUIRY':
          return 'VENDOR_INQUIRY'
        case 'PRODUCT_INQUIRY':
          return 'PRODUCT_INQUIRY'
        case 'QUOTE_DISCUSSION':
          return 'QUOTE_DISCUSSION'
        case 'GENERAL':
        default:
          return 'GENERAL'
      }
    }

    const conversation = await prisma.$transaction(async (tx) => {
      // Create conversation
      const newConversation = await tx.conversation.create({
        data: {
          subject,
          type: getConversationType(context.type) as any,
          status: 'ACTIVE',
          context: JSON.stringify(context),
          participants: {
            create: [
              { userId: initiatorId, role: 'INITIATOR' },
              { userId: participantId, role: 'PARTICIPANT' }
            ]
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  isEnterprise: true,
                  companyName: true
                }
              }
            }
          }
        }
      })

      // Send initial message
      await tx.message.create({
        data: {
          senderId: initiatorId,
          receiverId: participantId,
          content: initialMessage,
          conversationId: newConversation.id,
          messageType: context.type === 'VENDOR_INQUIRY' ? 'VENDOR_INQUIRY' : 
                      context.type === 'PRODUCT_INQUIRY' ? 'PRODUCT_INQUIRY' :
                      context.type === 'QUOTE_DISCUSSION' ? 'QUOTE_DISCUSSION' : 'GENERAL',
          productId: context.productId,
          context: JSON.stringify(context)
        }
      })

      return {
        ...newConversation,
        context: newConversation.context ? JSON.parse(newConversation.context) : null
      }
    })

    logger.info(`Conversation created: ${conversation.id} by ${initiatorId} with ${participantId}`)
    return conversation
  }

  async getConversations(userId: string, query: ConversationQuery) {
    const { type, status, page, limit } = query
    const skip = (page - 1) * limit

    const whereClause: any = {
      participants: {
        some: { userId }
      }
    }

    if (status !== 'ALL') {
      whereClause.status = status
    }

    if (type !== 'ALL') {
      if (type === 'VENDOR') {
        whereClause.type = { in: ['VENDOR_INQUIRY', 'QUOTE_DISCUSSION'] }
      } else if (type === 'PRODUCT') {
        whereClause.type = 'PRODUCT_INQUIRY'
      } else if (type === 'QUOTE') {
        whereClause.type = 'QUOTE_DISCUSSION'
      }
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                isEnterprise: true,
                companyName: true
              }
            }
          }
        },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                receiverId: userId,
                isRead: false
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.conversation.count({
      where: whereClause
    })

    const formattedConversations = conversations.map(conv => ({
      ...conv,
      context: conv.context ? JSON.parse(conv.context) : null,
      otherParticipant: conv.participants.find(p => p.userId !== userId)?.user,
      lastMessage: conv.messages[0] || null,
      unreadCount: conv._count.messages
    }))

    return {
      conversations: formattedConversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async getConversationMessages(userId: string, conversationId: string, query: { page: number; limit: number }) {
    const { page, limit } = query
    const skip = (page - 1) * limit

    // Verify user is participant in conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                isEnterprise: true,
                companyName: true
              }
            }
          }
        }
      }
    })

    if (!conversation) {
      throw new AppError('Conversation not found or access denied', 404)
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isEnterprise: true,
            companyName: true
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
    })

    const total = await prisma.message.count({
      where: { conversationId }
    })

    const formattedMessages = messages.map(msg => ({
      ...msg,
      context: msg.context ? JSON.parse(msg.context) : null,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : null
    }))

    return {
      conversation: {
        ...conversation,
        context: conversation.context ? JSON.parse(conversation.context) : null
      },
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async getMessages(userId: string, otherUserId: string, query: MessageQuery) {
    const { productId, page, limit } = query
    const skip = (page - 1) * limit

    const whereClause: any = {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }

    if (productId) {
      whereClause.productId = productId
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isEnterprise: true,
            companyName: true
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isEnterprise: true,
            companyName: true
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
    })

    const total = await prisma.message.count({
      where: whereClause
    })

    const formattedMessages = messages.map(msg => ({
      ...msg,
      context: msg.context ? JSON.parse(msg.context) : null,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : null
    }))

    return {
      messages: formattedMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async markMessagesAsRead(userId: string, messageIds: string[]) {
    await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    logger.info(`Messages marked as read: ${messageIds.length} messages for user: ${userId}`)
  }

  async markConversationAsRead(userId: string, conversationId: string) {
    await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    logger.info(`Conversation marked as read: ${conversationId} for user: ${userId}`)
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

  async getMessageById(userId: string, messageId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isEnterprise: true,
            companyName: true
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isEnterprise: true,
            companyName: true
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

    if (!message) {
      throw new AppError('Message not found', 404)
    }

    // Check if user is authorized to view this message
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new AppError('Access denied', 403)
    }

    return {
      ...message,
      context: message.context ? JSON.parse(message.context) : null,
      attachments: message.attachments ? JSON.parse(message.attachments) : null
    }
  }

  async getVendorInquiries(vendorId: string, query: { page: number; limit: number; status: string }) {
    const { page, limit, status } = query
    const skip = (page - 1) * limit

    const whereClause: any = {
      receiverId: vendorId,
      messageType: { in: ['VENDOR_INQUIRY', 'QUOTE_DISCUSSION'] }
    }

    if (status === 'UNREAD') {
      whereClause.isRead = false
    } else if (status === 'READ') {
      whereClause.isRead = true
    }

    const inquiries = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            companyName: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            imageUrls: true,
            price: true
          }
        }
      },
      orderBy: { sentAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.message.count({
      where: whereClause
    })

    const formattedInquiries = inquiries.map(inquiry => ({
      ...inquiry,
      context: inquiry.context ? JSON.parse(inquiry.context) : null,
      attachments: inquiry.attachments ? JSON.parse(inquiry.attachments) : null
    }))

    return {
      inquiries: formattedInquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async archiveConversation(userId: string, conversationId: string) {
    // Verify user is participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: { userId }
        }
      }
    })

    if (!conversation) {
      throw new AppError('Conversation not found or access denied', 404)
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'ARCHIVED' }
    })

    logger.info(`Conversation archived: ${conversationId} by user: ${userId}`)
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    })

    if (!message) {
      throw new AppError('Message not found', 404)
    }

    if (message.senderId !== userId) {
      throw new AppError('You can only delete your own messages', 403)
    }

    await prisma.message.delete({
      where: { id: messageId }
    })

    logger.info(`Message deleted: ${messageId} by user: ${userId}`)
  }

  async getUserById(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEnterprise: true,
        companyName: true
      }
    })
  }
} 