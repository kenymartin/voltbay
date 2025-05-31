import { prisma } from '../config/database'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'

interface CreateCategoryData {
  name: string
  description?: string
  parentId?: string
  imageUrl?: string
}

export class CategoryService {
  async getCategories() {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return categories
  }

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            _count: {
              select: {
                bids: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        },
        _count: {
          select: {
            products: true
          }
        }
      }
    })

    return category
  }

  async createCategory(data: CreateCategoryData) {
    const { name, description, parentId, imageUrl } = data

    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name }
    })

    if (existingCategory) {
      throw new AppError('Category with this name already exists', 409)
    }

    // Validate parent category if provided
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
        parentId,
        imageUrl
      },
      include: {
        parent: true,
        children: true
      }
    })

    logger.info(`Category created: ${category.id} - ${category.name}`)
    return category
  }

  async updateCategory(id: string, updateData: Partial<CreateCategoryData>) {
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      throw new AppError('Category not found', 404)
    }

    // Check if new name conflicts with existing categories
    if (updateData.name && updateData.name !== existingCategory.name) {
      const nameConflict = await prisma.category.findUnique({
        where: { name: updateData.name }
      })

      if (nameConflict) {
        throw new AppError('Category with this name already exists', 409)
      }
    }

    // Validate parent category if provided
    if (updateData.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: updateData.parentId }
      })

      if (!parentCategory) {
        throw new AppError('Parent category not found', 404)
      }

      // Prevent circular references
      if (updateData.parentId === id) {
        throw new AppError('Category cannot be its own parent', 400)
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true
      }
    })

    logger.info(`Category updated: ${id}`)
    return category
  }

  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        children: true
      }
    })

    if (!category) {
      throw new AppError('Category not found', 404)
    }

    // Check if category has products
    if (category.products.length > 0) {
      throw new AppError('Cannot delete category with existing products', 400)
    }

    // Check if category has child categories
    if (category.children.length > 0) {
      throw new AppError('Cannot delete category with child categories', 400)
    }

    await prisma.category.delete({
      where: { id }
    })

    logger.info(`Category deleted: ${id}`)
  }

  async getCategoryTree() {
    // Get all root categories (no parent) with their children
    const rootCategories = await prisma.category.findMany({
      where: {
        parentId: null
      },
      include: {
        children: {
          include: {
            children: true,
            _count: {
              select: {
                products: true
              }
            }
          }
        },
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return rootCategories
  }
} 