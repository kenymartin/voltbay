import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

import { logger } from './utils/logger'
import { errorHandler } from './middleware/errorHandler'
import productRoutes from './routes/productRoutes'
import categoryRoutes from './routes/categoryRoutes'
import orderRoutes from './routes/orderRoutes'
import messageRoutes from './routes/messageRoutes'
import notificationRoutes from './routes/notificationRoutes'
import uploadRoutes from './routes/uploadRoutes'
import paymentRoutes from './routes/payments'
// import walletRoutes from './routes/walletRoutes'
import walletRoutes from './routes/walletRoutes'
import { auctionScheduler } from './services/auctionScheduler'

const app = express()
const PORT = process.env.PORT || 5001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://voltbay.com', 'https://www.voltbay.com']
    : [
        'http://localhost:3000', 
        'https://localhost:3000',
        'http://localhost:3001', 
        'https://localhost:3001',
        'http://localhost:5173',
        'https://localhost:5173'
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Static file serving for uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads'
app.use('/uploads', express.static(path.resolve(uploadDir)))

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// API Routes
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/wallet', walletRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API service is healthy',
    timestamp: new Date().toISOString(),
    service: 'voltbay-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    auctionScheduler: auctionScheduler.getStatus()
  })
})

// Global health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'VoltBay API Service',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      messages: '/api/messages',
      notifications: '/api/notifications',
      upload: '/api/upload',
      payments: '/api/payments',
      wallet: '/api/wallet',
      health: '/health'
    }
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    method: req.method,
    path: req.originalUrl
  })
})

// Error handler (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`[${new Date().toISOString()}] INFO: API service running on port ${PORT}`)
  logger.info(`[${new Date().toISOString()}] INFO: Environment: ${process.env.NODE_ENV}`)
  logger.info(`[${new Date().toISOString()}] INFO: CORS origins: ${process.env.NODE_ENV === 'production' ? 'production domains' : 'localhost:3000, localhost:3001, localhost:5173'}`)
  logger.info(`[${new Date().toISOString()}] INFO: Upload directory: ${uploadDir}`)
  logger.info(`[${new Date().toISOString()}] INFO: Payment processing enabled with Stripe`)
  
  // Start auction scheduler
  // auctionScheduler.start()
  // logger.info(`[${new Date().toISOString()}] INFO: Auction scheduler started`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  // auctionScheduler.stop()
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  // auctionScheduler.stop()
  process.exit(0)
})
