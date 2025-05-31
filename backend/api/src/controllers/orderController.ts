import { Request, Response, NextFunction } from 'express'
import { OrderService } from '../services/orderService'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'
import { 
  createOrderSchema, 
  updateOrderStatusSchema,
  updateShippingSchema 
} from '../validators/orderValidators'

export class OrderController {
  private orderService: OrderService

  constructor() {
    this.orderService = new OrderService()
  }

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const validatedData = createOrderSchema.parse(req.body)
      
      const order = await this.orderService.createOrder({
        ...validatedData,
        buyerId: userId
      })
      
      logger.info(`Order created: ${order.id} by user: ${userId}`)
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { order }
      })
    } catch (error) {
      next(error)
    }
  }

  getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { type = 'all', status, page = 1, limit = 20 } = req.query
      
      const result = await this.orderService.getUserOrders(userId, {
        type: type as string,
        status: status as string,
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

  getOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const order = await this.orderService.getOrderById(id, userId)
      
      if (!order) {
        throw new AppError('Order not found', 404)
      }
      
      res.json({
        success: true,
        data: { order }
      })
    } catch (error) {
      next(error)
    }
  }

  updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { status, notes } = updateOrderStatusSchema.parse(req.body)
      
      const order = await this.orderService.updateOrderStatus(id, userId, status, notes)
      
      logger.info(`Order status updated: ${id} to ${status} by user: ${userId}`)
      
      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: { order }
      })
    } catch (error) {
      next(error)
    }
  }

  updateShipping = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const shippingData = updateShippingSchema.parse(req.body)
      
      const order = await this.orderService.updateShipping(id, userId, shippingData)
      
      logger.info(`Order shipping updated: ${id} by user: ${userId}`)
      
      res.json({
        success: true,
        message: 'Shipping information updated successfully',
        data: { order }
      })
    } catch (error) {
      next(error)
    }
  }

  cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { reason } = req.body
      
      const order = await this.orderService.cancelOrder(id, userId, reason)
      
      logger.info(`Order cancelled: ${id} by user: ${userId}`)
      
      res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: { order }
      })
    } catch (error) {
      next(error)
    }
  }

  confirmDelivery = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const order = await this.orderService.confirmDelivery(id, userId)
      
      logger.info(`Order delivery confirmed: ${id} by user: ${userId}`)
      
      res.json({
        success: true,
        message: 'Delivery confirmed successfully',
        data: { order }
      })
    } catch (error) {
      next(error)
    }
  }

  getOrderStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const stats = await this.orderService.getOrderStats(userId)
      
      res.json({
        success: true,
        data: { stats }
      })
    } catch (error) {
      next(error)
    }
  }
} 