import { prisma } from '../config/database'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'

interface CreateProductData {
  title: string
  description: string
  price: number
  categoryId: string
  condition: string
  ownerId: string
  imageUrls?: string[]
  isAuction?: boolean
  auctionEndDate?: string
  minimumBid?: number
  buyNowPrice?: number
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  specifications?: Array<{
    name: string
    value: string
    unit?: string
  }>
}

interface SearchProductsQuery {
  q?: string
  category?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  isAuction?: boolean
  status?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  limit?: number
  city?: string
  state?: string
  country?: string
}

export class ProductService {
  async createProduct(data: CreateProductData) {
    const {
      title,
      description,
      price,
      categoryId,
      condition,
      ownerId,
      imageUrls = [],
      isAuction = false,
      auctionEndDate,
      minimumBid,
      buyNowPrice,
      street,
      city,
      state,
      zipCode,
      country,
      specifications = []
    } = data

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      throw new AppError('Category not found', 404)
    }

    // Validate auction data
    if (isAuction) {
      if (!auctionEndDate) {
        throw new AppError('Auction end date is required for auction items', 400)
      }
      
      const endDate = new Date(auctionEndDate)
      if (endDate <= new Date()) {
        throw new AppError('Auction end date must be in the future', 400)
      }

      if (minimumBid && minimumBid >= price) {
        throw new AppError('Minimum bid must be less than starting price', 400)
      }
    }

    // Create product with specifications
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        categoryId,
        condition: condition as any,
        ownerId,
        imageUrls,
        isAuction,
        auctionEndDate: auctionEndDate ? new Date(auctionEndDate) : null,
        minimumBid,
        buyNowPrice,
        currentBid: isAuction ? minimumBid : null,
        street,
        city,
        state,
        zipCode,
        country,
        status: 'ACTIVE',
        specifications: {
          create: specifications.map(spec => ({
            name: spec.name,
            value: spec.value,
            unit: spec.unit
          }))
        }
      },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        specifications: true
      }
    })

    logger.info(`Product created: ${product.id}`)
    return product
  }

  async getProducts(query: SearchProductsQuery) {
    const {
      q,
      category,
      condition,
      minPrice,
      maxPrice,
      isAuction,
      status = 'ACTIVE',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      city,
      state,
      country
    } = query

    const skip = (page - 1) * limit
    const where: any = {
      status: status as any
    }

    // Text search
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ]
    }

    // Category filter
    if (category) {
      where.categoryId = category
    }

    // Condition filter
    if (condition) {
      where.condition = condition as any
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    // Auction filter
    if (isAuction !== undefined) {
      where.isAuction = isAuction
    }

    // Location filters
    if (city) where.city = { contains: city, mode: 'insensitive' }
    if (state) where.state = { contains: state, mode: 'insensitive' }
    if (country) where.country = { contains: country, mode: 'insensitive' }

    // Sorting
    const orderBy: any = {}
    if (sortBy === 'endDate') {
      orderBy.auctionEndDate = sortOrder
    } else {
      orderBy[sortBy] = sortOrder
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          specifications: true,
          _count: {
            select: {
              bids: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        specifications: true,
        bids: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            amount: 'desc'
          }
        },
        _count: {
          select: {
            bids: true,
            reviews: true
          }
        }
      }
    })

    return product
  }

  async updateProduct(id: string, userId: string, updateData: Partial<CreateProductData>) {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { bids: true }
    })

    if (!existingProduct) {
      throw new AppError('Product not found', 404)
    }

    if (existingProduct.ownerId !== userId) {
      throw new AppError('You can only update your own products', 403)
    }

    if (existingProduct.bids.length > 0) {
      throw new AppError('Cannot update product with existing bids', 400)
    }

    const { specifications, categoryId, ...productData } = updateData

    const updatePayload: any = {
      ...productData,
      ...(categoryId && { categoryId }),
      ...(updateData.auctionEndDate && {
        auctionEndDate: new Date(updateData.auctionEndDate)
      }),
      ...(specifications && {
        specifications: {
          deleteMany: {},
          create: specifications.map(spec => ({
            name: spec.name,
            value: spec.value,
            unit: spec.unit
          }))
        }
      })
    }

    const product = await prisma.product.update({
      where: { id },
      data: updatePayload,
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        specifications: true
      }
    })

    logger.info(`Product updated: ${id}`)
    return product
  }

  async deleteProduct(id: string, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { bids: true }
    })

    if (!product) {
      throw new AppError('Product not found', 404)
    }

    if (product.ownerId !== userId) {
      throw new AppError('You can only delete your own products', 403)
    }

    if (product.bids.length > 0) {
      throw new AppError('Cannot delete product with existing bids', 400)
    }

    await prisma.product.delete({
      where: { id }
    })

    logger.info(`Product deleted: ${id}`)
  }

  async getUserProducts(userId: string) {
    const products = await prisma.product.findMany({
      where: { ownerId: userId },
      include: {
        category: true,
        specifications: true,
        _count: {
          select: {
            bids: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return products
  }

  async placeBid(productId: string, userId: string, amount: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1
        }
      }
    })

    if (!product) {
      throw new AppError('Product not found', 404)
    }

    if (!product.isAuction) {
      throw new AppError('This product is not an auction', 400)
    }

    if (product.status !== 'ACTIVE') {
      throw new AppError('Auction is not active', 400)
    }

    if (product.auctionEndDate && product.auctionEndDate <= new Date()) {
      throw new AppError('Auction has ended', 400)
    }

    if (product.ownerId === userId) {
      throw new AppError('You cannot bid on your own product', 400)
    }

    // Check minimum bid requirements
    const currentHighestBidAmount = product.bids[0]?.amount ? Number(product.bids[0].amount) : 0
    const minimumBidAmount = product.minimumBid ? Number(product.minimumBid) : 0
    const currentHighestBid = Math.max(currentHighestBidAmount, minimumBidAmount)
    const minimumNextBid = currentHighestBid + 1 // At least $1 more

    if (amount <= currentHighestBid) {
      throw new AppError(`Bid must be higher than current bid of $${currentHighestBid}`, 400)
    }

    if (amount < minimumNextBid) {
      throw new AppError(`Minimum bid is $${minimumNextBid}`, 400)
    }

    // Create bid and update product
    const [bid] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          userId,
          productId,
          amount
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      // Update all previous bids to not winning
      prisma.bid.updateMany({
        where: {
          productId,
          userId: { not: userId }
        },
        data: { isWinning: false }
      }),
      // Update current bid to winning
      prisma.bid.updateMany({
        where: {
          productId,
          userId,
          amount
        },
        data: { isWinning: true }
      }),
      // Update product current bid
      prisma.product.update({
        where: { id: productId },
        data: { currentBid: amount }
      })
    ])

    logger.info(`Bid placed: $${amount} on product ${productId} by user ${userId}`)
    return bid
  }

  async getProductBids(productId: string) {
    const bids = await prisma.bid.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        amount: 'desc'
      }
    })

    return bids
  }

  async getFeaturedProducts() {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        category: true,
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
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: 12
    })

    return products
  }

  async getAuctionProducts() {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        isAuction: true,
        auctionEndDate: {
          gt: new Date()
        }
      },
      include: {
        category: true,
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
        auctionEndDate: 'asc'
      },
      take: 20
    })

    return products
  }

  async getUserBids(userId: string) {
    const bids = await prisma.bid.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return bids
  }
} 