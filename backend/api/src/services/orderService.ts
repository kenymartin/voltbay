import { prisma } from '../config/database'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'

interface CreateOrderData {
  productId: string
  buyerId: string
  shippingStreet: string
  shippingCity: string
  shippingState: string
  shippingZipCode: string
  shippingCountry: string
  paymentType?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER'
  paymentLast4?: string
  paymentExpiryMonth?: number
  paymentExpiryYear?: number
  paymentBrand?: string
  notes?: string
}

interface OrderQuery {
  type: string
  status?: string
  page: number
  limit: number
}

interface ShippingData {
  trackingNumber?: string
  notes?: string
}

export class OrderService {
  async createOrder(data: CreateOrderData) {
    const { productId, buyerId, ...orderData } = data

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        owner: true,
        bids: {
          where: { isWinning: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!product) {
      throw new AppError('Product not found', 404)
    }

    if (product.status !== 'ACTIVE') {
      throw new AppError('Product is not available for purchase', 400)
    }

    if (product.ownerId === buyerId) {
      throw new AppError('Cannot purchase your own product', 400)
    }

    // Check if product is auction and has ended
    if (product.isAuction) {
      if (!product.auctionEndDate || product.auctionEndDate > new Date()) {
        throw new AppError('Auction is still active', 400)
      }

      // Verify buyer is the winning bidder
      const winningBid = product.bids[0]
      if (!winningBid || winningBid.userId !== buyerId) {
        throw new AppError('You are not the winning bidder', 400)
      }
    }

    // Determine order amount
    let totalAmount = product.price
    if (product.isAuction && product.currentBid) {
      totalAmount = product.currentBid
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          buyerId,
          sellerId: product.ownerId,
          productId,
          totalAmount,
          status: 'PENDING',
          shippingStreet: orderData.shippingStreet,
          shippingCity: orderData.shippingCity,
          shippingState: orderData.shippingState,
          shippingZipCode: orderData.shippingZipCode,
          shippingCountry: orderData.shippingCountry,
          paymentType: orderData.paymentType || null,
          paymentLast4: orderData.paymentLast4 || null,
          paymentExpiryMonth: orderData.paymentExpiryMonth || null,
          paymentExpiryYear: orderData.paymentExpiryYear || null,
          paymentBrand: orderData.paymentBrand || null,
          notes: orderData.notes || null
        },
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          seller: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          product: {
            include: {
              category: true,
              specifications: true
            }
          }
        }
      })

      // Update product status to SOLD
      await tx.product.update({
        where: { id: productId },
        data: { status: 'SOLD' }
      })

      // Create notifications
      await tx.notification.createMany({
        data: [
          {
            userId: buyerId,
            type: 'ORDER_CONFIRMED',
            title: 'Order Confirmed',
            message: `Your order for "${product.title}" has been confirmed.`,
            data: { orderId: newOrder.id, productId }
          },
          {
            userId: product.ownerId,
            type: 'ORDER_CONFIRMED',
            title: 'New Order Received',
            message: `You have received a new order for "${product.title}".`,
            data: { orderId: newOrder.id, productId }
          }
        ]
      })

      return newOrder
    })

    logger.info(`Order created: ${order.id} for product: ${productId}`)
    return order
  }

  async getUserOrders(userId: string, query: OrderQuery) {
    const { type, status, page, limit } = query
    const skip = (page - 1) * limit

    const where: any = {}

    // Filter by user role (buyer/seller)
    if (type === 'purchases') {
      where.buyerId = userId
    } else if (type === 'sales') {
      where.sellerId = userId
    } else {
      where.OR = [
        { buyerId: userId },
        { sellerId: userId }
      ]
    }

    // Filter by status
    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          seller: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          product: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        product: {
          include: {
            category: true,
            specifications: true
          }
        },
        reviews: true
      }
    })

    if (!order) {
      return null
    }

    // Check if user has access to this order
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('Access denied', 403)
    }

    return order
  }

  async updateOrderStatus(orderId: string, userId: string, status: string, notes?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    // Only seller can update most statuses
    if (order.sellerId !== userId && status !== 'CANCELLED') {
      throw new AppError('Only the seller can update order status', 403)
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'PENDING': ['CONFIRMED', 'CANCELLED'],
      'CONFIRMED': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED'],
      'DELIVERED': [],
      'CANCELLED': [],
      'REFUNDED': []
    }

    if (!validTransitions[order.status]?.includes(status)) {
      throw new AppError(`Cannot transition from ${order.status} to ${status}`, 400)
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: status as any,
          notes: notes || order.notes,
          updatedAt: new Date()
        },
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          seller: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          product: true
        }
      })

      // Create notifications
      const notificationData: any = {
        orderId,
        productId: order.productId,
        status
      }

      if (status === 'SHIPPED') {
        await tx.notification.create({
          data: {
            userId: order.buyerId,
            type: 'ORDER_SHIPPED',
            title: 'Order Shipped',
            message: `Your order for "${order.product.title}" has been shipped.`,
            data: notificationData
          }
        })
      } else if (status === 'DELIVERED') {
        await tx.notification.create({
          data: {
            userId: order.buyerId,
            type: 'ORDER_DELIVERED',
            title: 'Order Delivered',
            message: `Your order for "${order.product.title}" has been delivered.`,
            data: notificationData
          }
        })
      }

      return updated
    })

    logger.info(`Order status updated: ${orderId} to ${status}`)
    return updatedOrder
  }

  async updateShipping(orderId: string, userId: string, shippingData: ShippingData) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (order.sellerId !== userId) {
      throw new AppError('Only the seller can update shipping information', 403)
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: shippingData.trackingNumber,
        notes: shippingData.notes || order.notes,
        updatedAt: new Date()
      },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        seller: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        product: true
      }
    })

    logger.info(`Order shipping updated: ${orderId}`)
    return updatedOrder
  }

  async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new AppError('Access denied', 403)
    }

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled at this stage', 400)
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
          updatedAt: new Date()
        },
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          seller: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          product: true
        }
      })

      // Return product to active status if it was sold
      if (order.product.status === 'SOLD') {
        await tx.product.update({
          where: { id: order.productId },
          data: { status: 'ACTIVE' }
        })
      }

      return updated
    })

    logger.info(`Order cancelled: ${orderId}`)
    return updatedOrder
  }

  async confirmDelivery(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      throw new AppError('Order not found', 404)
    }

    if (order.buyerId !== userId) {
      throw new AppError('Only the buyer can confirm delivery', 403)
    }

    if (order.status !== 'SHIPPED') {
      throw new AppError('Order must be shipped before confirming delivery', 400)
    }

    const updatedOrder = await this.updateOrderStatus(orderId, order.sellerId, 'DELIVERED')

    logger.info(`Order delivery confirmed: ${orderId}`)
    return updatedOrder
  }

  async getOrderStats(userId: string) {
    const [purchaseStats, salesStats] = await Promise.all([
      // Purchase statistics
      prisma.order.groupBy({
        by: ['status'],
        where: { buyerId: userId },
        _count: { status: true },
        _sum: { totalAmount: true }
      }),
      // Sales statistics
      prisma.order.groupBy({
        by: ['status'],
        where: { sellerId: userId },
        _count: { status: true },
        _sum: { totalAmount: true }
      })
    ])

    const formatStats = (stats: any[]) => {
      return stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = {
          count: stat._count.status,
          total: stat._sum.totalAmount || 0
        }
        return acc
      }, {})
    }

    return {
      purchases: formatStats(purchaseStats),
      sales: formatStats(salesStats)
    }
  }
} 