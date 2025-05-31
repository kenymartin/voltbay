import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
      }
    }
  }
}

export class AuthMiddleware {
  private authServiceUrl: string

  constructor() {
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4000'
  }

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Access token required', 401)
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      
      // Verify token with auth service
      const response = await axios.get(`${this.authServiceUrl}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.data.success) {
        throw new AppError('Invalid token', 401)
      }

      req.user = {
        id: response.data.data.user.id,
        email: response.data.data.user.email,
        role: response.data.data.user.role
      }

      next()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          next(new AppError('Invalid or expired token', 401))
        } else {
          logger.error('Auth service error:', error.message)
          next(new AppError('Authentication service unavailable', 503))
        }
      } else {
        next(error)
      }
    }
  }

  requireVerified = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401)
      }

      // Additional verification check could be added here
      // For now, we trust the auth service verification
      next()
    } catch (error) {
      next(error)
    }
  }

  requireRole = (roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new AppError('Authentication required', 401)
        }

        if (!roles.includes(req.user.role)) {
          throw new AppError('Insufficient permissions', 403)
        }

        next()
      } catch (error) {
        next(error)
      }
    }
  }

  requireAdmin = this.requireRole(['ADMIN'])
  requireModerator = this.requireRole(['ADMIN', 'MODERATOR'])
}

// Create singleton instance
export const authMiddleware = new AuthMiddleware() 