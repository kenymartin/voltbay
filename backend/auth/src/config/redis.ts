import { createClient } from 'redis'
import { logger } from '../utils/logger'

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  logger.info('Connected to Redis')
})

redisClient.on('ready', () => {
  logger.info('Redis client ready')
})

redisClient.on('end', () => {
  logger.info('Redis connection ended')
})

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect()
    logger.info('Redis connected successfully')
  } catch (error) {
    logger.error('Failed to connect to Redis:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Disconnecting from Redis...')
  await redisClient.quit()
})

export { redisClient, connectRedis } 