import { Request, Response, NextFunction } from 'express'
import { ProductService } from '../services/productService'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'
import { 
  createProductSchema, 
  updateProductSchema,
  searchProductsSchema,
  bidSchema 
} from '../validators/productValidators'

export class ProductController {
  private productService: ProductService

  constructor() {
    this.productService = new ProductService()
  }

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const validatedData = createProductSchema.parse(req.body)
      
      const product = await this.productService.createProduct({
        ...validatedData,
        ownerId: userId
      })
      
      logger.info(`Product created: ${product.id} by user: ${userId}`)
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product }
      })
    } catch (error) {
      next(error)
    }
  }

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = searchProductsSchema.parse(req.query)
      
      const result = await this.productService.getProducts(validatedQuery)
      
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      next(error)
    }
  }

  getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      
      const product = await this.productService.getProductById(id)
      
      if (!product) {
        throw new AppError('Product not found', 404)
      }
      
      res.json({
        success: true,
        data: { product }
      })
    } catch (error) {
      next(error)
    }
  }

  updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const validatedData = updateProductSchema.parse(req.body)
      
      const product = await this.productService.updateProduct(id, userId, validatedData)
      
      logger.info(`Product updated: ${id} by user: ${userId}`)
      
      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product }
      })
    } catch (error) {
      next(error)
    }
  }

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      await this.productService.deleteProduct(id, userId)
      
      logger.info(`Product deleted: ${id} by user: ${userId}`)
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  getUserProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const products = await this.productService.getUserProducts(userId)
      
      res.json({
        success: true,
        data: { products }
      })
    } catch (error) {
      next(error)
    }
  }

  placeBid = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const { amount } = bidSchema.parse(req.body)
      
      const bid = await this.productService.placeBid(id, userId, amount)
      
      logger.info(`Bid placed: ${amount} on product ${id} by user: ${userId}`)
      
      res.status(201).json({
        success: true,
        message: 'Bid placed successfully',
        data: { bid }
      })
    } catch (error) {
      next(error)
    }
  }

  getProductBids = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      
      const bids = await this.productService.getProductBids(id)
      
      res.json({
        success: true,
        data: { bids }
      })
    } catch (error) {
      next(error)
    }
  }

  getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.productService.getFeaturedProducts()
      
      res.json({
        success: true,
        data: { products }
      })
    } catch (error) {
      next(error)
    }
  }

  getAuctionProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.productService.getAuctionProducts()
      
      res.json({
        success: true,
        data: { products }
      })
    } catch (error) {
      next(error)
    }
  }

  getUserBids = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('Authentication required', 401)
      }

      const bids = await this.productService.getUserBids(userId)
      
      res.json({
        success: true,
        data: { bids }
      })
    } catch (error) {
      next(error)
    }
  }
} 