import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/authService'
import { AppError } from '../utils/errors'
import { prisma } from '../config/database'

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
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Access token required', 401)
      }

      const token = authHeader.substring(7) // Remove 'Bearer ' prefix
      
      const decoded = await this.authService.verifyAccessToken(token)
      
      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          verified: true
        }
      })

      if (!user) {
        throw new AppError('User not found', 401)
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      }

      next()
    } catch (error) {
      next(error)
    }
  }

  requireVerified = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401)
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { verified: true }
      })

      if (!user?.verified) {
        throw new AppError('Email verification required', 403)
      }

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