import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFoundHandler'
import authRoutes from './routes/authRoutes'
import { connectRedis } from './config/redis'
import { logger } from './utils/logger'
import { envConfig } from './config/env'

const app = express()
const PORT = envConfig.PORT

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
  windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
  max: envConfig.NODE_ENV === 'development' ? 10000 : envConfig.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health'
  }
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`)
  next()
})

// Routes
app.use('/api/auth', authRoutes)

// Global health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString(),
    service: 'voltbay-auth',
    version: '1.0.0',
    environment: process.env.NODE_ENV
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

// Initialize services and start server
async function startServer() {
  try {
    // Connect to Redis
    await connectRedis()
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`[${new Date().toISOString()}] INFO: Auth service running on port ${PORT}`)
      logger.info(`[${new Date().toISOString()}] INFO: Environment: ${process.env.NODE_ENV}`)
      logger.info(`[${new Date().toISOString()}] INFO: CORS origins: ${process.env.NODE_ENV === 'production' ? 'production domains' : 'localhost:3000, localhost:3001, localhost:5173'}`)
    })
  } catch (error) {
    logger.error('Failed to start auth service:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

startServer() 