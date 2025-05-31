import { Request, Response, NextFunction } from 'express'
import { CategoryService } from '../services/categoryService'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'
import { createCategorySchema, updateCategorySchema } from '../validators/productValidators'

export class CategoryController {
  private categoryService: CategoryService

  constructor() {
    this.categoryService = new CategoryService()
  }

  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.categoryService.getCategories()
      
      res.json({
        success: true,
        data: { categories }
      })
    } catch (error) {
      next(error)
    }
  }

  getCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      
      const category = await this.categoryService.getCategoryById(id)
      
      if (!category) {
        throw new AppError('Category not found', 404)
      }
      
      res.json({
        success: true,
        data: { category }
      })
    } catch (error) {
      next(error)
    }
  }

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createCategorySchema.parse(req.body)
      
      const category = await this.categoryService.createCategory(validatedData)
      
      logger.info(`Category created: ${category.id}`)
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      })
    } catch (error) {
      next(error)
    }
  }

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const validatedData = updateCategorySchema.parse(req.body)
      
      const category = await this.categoryService.updateCategory(id, validatedData)
      
      logger.info(`Category updated: ${id}`)
      
      res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
      })
    } catch (error) {
      next(error)
    }
  }

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      
      await this.categoryService.deleteCategory(id)
      
      logger.info(`Category deleted: ${id}`)
      
      res.json({
        success: true,
        message: 'Category deleted successfully'
      })
    } catch (error) {
      next(error)
    }
  }
} 