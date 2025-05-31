import { Router } from 'express'
import { CategoryController } from '../controllers/categoryController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const categoryController = new CategoryController()

// Public routes
router.get('/', categoryController.getCategories)
router.get('/:id', categoryController.getCategory)

// Admin only routes
router.post('/', authMiddleware.authenticate, authMiddleware.requireAdmin, categoryController.createCategory)
router.put('/:id', authMiddleware.authenticate, authMiddleware.requireAdmin, categoryController.updateCategory)
router.delete('/:id', authMiddleware.authenticate, authMiddleware.requireAdmin, categoryController.deleteCategory)

export default router 