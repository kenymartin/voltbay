import { logger } from '../utils/logger'

export interface EnvConfig {
  NODE_ENV: string
  PORT: number
  DATABASE_URL: string
  REDIS_URL: string
  JWT_SECRET: string
  JWT_REFRESH_SECRET: string
  JWT_EXPIRES_IN: string
  JWT_REFRESH_EXPIRES_IN: string
  CORS_ORIGIN: string
  RATE_LIMIT_WINDOW_MS: number
  RATE_LIMIT_MAX_REQUESTS: number
}

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
]

const validateEnv = (): EnvConfig => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`)
    process.exit(1)
  }

  // Validate JWT secrets are not empty
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    logger.error('JWT_SECRET is empty or undefined')
    process.exit(1)
  }

  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.trim() === '') {
    logger.error('JWT_REFRESH_SECRET is empty or undefined')
    process.exit(1)
  }

  logger.info('Environment validation passed')

  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '4000', 10),
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  }
}

export const envConfig = validateEnv()

export const isDevelopment = envConfig.NODE_ENV === 'development'
export const isProduction = envConfig.NODE_ENV === 'production'
export const isTest = envConfig.NODE_ENV === 'test' 