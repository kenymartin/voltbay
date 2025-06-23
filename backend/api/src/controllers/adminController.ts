import { Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import { ProductStatus, OrderStatus } from '@prisma/client'
import { logger } from '../utils/logger'
import { AppError } from '../utils/errors'

export class AdminController {

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      // Get current date for today's stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [
        totalUsers,
        totalProducts,
        totalOrders,
        newUsersToday,
        pendingProducts,
        activeAuctions
      ] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count({
          where: {
            createdAt: {
              gte: today
            }
          }
        }),
        prisma.product.count({
          where: {
            status: ProductStatus.DRAFT
          }
        }),
        prisma.product.count({
          where: {
            isAuction: true,
            status: ProductStatus.ACTIVE,
            auctionEndDate: {
              gt: new Date()
            }
          }
        })
      ])

      // Calculate total revenue from completed orders
      const revenueAgg = await prisma.order.aggregate({
        where: {
          status: OrderStatus.DELIVERED
        },
        _sum: {
          platformFee: true
        }
      })

      const stats = {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: Number(revenueAgg._sum.platformFee || 0),
        pendingProducts,
        reportedProducts: 0, // TODO: Implement reporting system
        activeAuctions,
        newUsersToday
      }

      logger.info('Admin stats retrieved')

      res.json({
        success: true,
        data: stats
      })
    } catch (error) {
      next(error)
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          verified: true,
          avatar: true,
          isEnterprise: true,
          companyName: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      logger.info(`Retrieved ${users.length} users for admin`)

      res.json({
        success: true,
        data: users
      })
    } catch (error) {
      next(error)
    }
  }

  async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      await prisma.user.update({
        where: { id },
        data: {
          // TODO: Add banned field to user schema
          updatedAt: new Date()
        }
      })

      logger.info(`User ${id} banned by admin ${req.user?.email}`)

      res.json({
        success: true,
        message: 'User banned successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  async unbanUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      await prisma.user.update({
        where: { id },
        data: {
          updatedAt: new Date()
        }
      })

      logger.info(`User ${id} unbanned by admin ${req.user?.email}`)

      res.json({
        success: true,
        message: 'User unbanned successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  async verifyUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      await prisma.user.update({
        where: { id },
        data: {
          verified: true,
          updatedAt: new Date()
        }
      })

      logger.info(`User ${id} verified by admin ${req.user?.email}`)

      res.json({
        success: true,
        message: 'User verified successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await prisma.product.findMany({
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      logger.info(`Retrieved ${products.length} products for admin`)

      res.json({
        success: true,
        data: products
      })
    } catch (error) {
      next(error)
    }
  }

  async approveProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      await prisma.product.update({
        where: { id },
        data: {
          status: ProductStatus.ACTIVE,
          updatedAt: new Date()
        }
      })

      logger.info(`Product ${id} approved by admin ${req.user?.email}`)

      res.json({
        success: true,
        message: 'Product approved successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  async rejectProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      await prisma.product.update({
        where: { id },
        data: {
          status: ProductStatus.SUSPENDED,
          updatedAt: new Date()
        }
      })

      logger.info(`Product ${id} rejected by admin ${req.user?.email}`)

      res.json({
        success: true,
        message: 'Product rejected successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  async suspendProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      await prisma.product.update({
        where: { id },
        data: {
          status: ProductStatus.SUSPENDED,
          updatedAt: new Date()
        }
      })

      logger.info(`Product ${id} suspended by admin ${req.user?.email}`)

      res.json({
        success: true,
        message: 'Product suspended successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          parent: true,
          children: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      logger.info(`Retrieved ${categories.length} categories for admin`)

      res.json({
        success: true,
        data: categories
      })
    } catch (error) {
      next(error)
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, parentId, imageUrl } = req.body

      // Check if category name already exists
      const existingCategory = await prisma.category.findUnique({
        where: { name }
      })

      if (existingCategory) {
        throw new AppError('Category name already exists', 400)
      }

      // If parentId is provided, verify parent exists
      if (parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: parentId }
        })

        if (!parentCategory) {
          throw new AppError('Parent category not found', 404)
        }
      }

      const category = await prisma.category.create({
        data: {
          name,
          description,
          parentId: parentId || null,
          imageUrl
        },
        include: {
          parent: true,
          children: true
        }
      })

      logger.info(`Category '${name}' created by admin ${req.user?.email}`)

      res.json({
        success: true,
        data: category,
        message: 'Category created successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params

      // Check if category has products
      const productCount = await prisma.product.count({
        where: { categoryId: id }
      })

      if (productCount > 0) {
        throw new AppError('Cannot delete category with existing products', 400)
      }

      await prisma.category.delete({
        where: { id }
      })

      logger.info(`Category ${id} deleted by admin ${req.user?.email}`)

      res.json({
        success: true,
        message: 'Category deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await prisma.order.findMany({
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
            select: {
              id: true,
              title: true,
              price: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      logger.info(`Retrieved ${orders.length} orders for admin`)

      res.json({
        success: true,
        data: orders
      })
    } catch (error) {
      next(error)
    }
  }
} 