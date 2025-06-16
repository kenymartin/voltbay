import { z } from 'zod'

const baseProductSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  imageUrls: z.array(z.string()).optional().default([]),
  
  // Auction fields - allow zero or undefined for non-auction items
  isAuction: z.boolean().optional().default(false),
  auctionEndDate: z.string().datetime().optional(),
  minimumBid: z.number().min(0).optional(), // Allow zero for non-auction items
  buyNowPrice: z.number().min(0).optional(), // Allow zero for non-auction items
  
  // Location
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  
  // Specifications
  specifications: z.array(z.object({
    name: z.string().min(1, 'Specification name required'),
    value: z.string().min(1, 'Specification value required'),
    unit: z.string().optional()
  })).optional().default([])
})

export const createProductSchema = baseProductSchema.refine((data) => {
  // If it's an auction, validate auction-specific fields
  if (data.isAuction) {
    if (!data.auctionEndDate) {
      return false
    }
    if (!data.minimumBid || data.minimumBid <= 0) {
      return false
    }
  }
  return true
}, {
  message: "Auction items must have an end date and minimum bid greater than 0"
})

export const updateProductSchema = baseProductSchema.partial()

export const searchProductsSchema = z.object({
  q: z.string().optional(), // Search query
  category: z.string().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  minPrice: z.string().transform(val => parseFloat(val)).optional(),
  maxPrice: z.string().transform(val => parseFloat(val)).optional(),
  isAuction: z.string().transform(val => val === 'true').optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SOLD', 'EXPIRED', 'SUSPENDED']).optional(),
  sortBy: z.enum(['price', 'createdAt', 'title', 'endDate', 'endingSoon']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.string().transform(val => parseInt(val, 10)).optional().default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).optional().default('20'),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional()
})

export const bidSchema = z.object({
  amount: z.number().positive('Bid amount must be positive')
})

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional()
})

export const updateCategorySchema = createCategorySchema.partial()

export const uploadImageSchema = z.object({
  productId: z.string().min(1, 'Product ID is required')
}) 