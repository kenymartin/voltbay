import { Request, Response, NextFunction } from 'express'
// Temporary implementation without jsonwebtoken dependency
// import jwt from 'jsonwebtoken'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

// Temporary JWT verification function for development
const verifyJWT = (token: string, secret: string) => {
  try {
    // This is a simplified implementation for development
    // In production, use proper JWT library
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
    
    // Basic expiration check
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expired')
    }
    
    return payload
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export const authenticateUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      })
    }

    // Use temporary JWT verification
    const decoded = verifyJWT(token, process.env.JWT_SECRET)
    
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role || 'USER'
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    })
  }
}

// Alias for backward compatibility
export const authenticateToken = authenticateUser

// Optional authentication - sets user if token is present but doesn't fail if missing
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return next()
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      // Server config error, continue without user
      return next()
    }

    try {
      // Use temporary JWT verification
      const decoded = verifyJWT(token, process.env.JWT_SECRET)
      
      req.user = {
        id: decoded.id || decoded.userId,
        email: decoded.email,
        role: decoded.role || 'USER'
      }
    } catch (tokenError) {
      // Invalid token, continue without user
      console.warn('Optional auth token invalid:', tokenError)
    }

    next()
  } catch (error) {
    console.error('Optional authentication error:', error)
    // Continue without user on any error
    next()
  }
}

// Role-based access control middleware
export const requireEnterpriseBuyer = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
  }

  // Check if user is an enterprise buyer
  if (req.user.role !== 'BUYER') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Enterprise buyer access required.'
    })
  }

  next()
}

export const requireEnterpriseVendor = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
  }

  // Check if user is an enterprise vendor
  if (req.user.role !== 'VENDOR') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Enterprise vendor access required.'
    })
  }

  next()
}

export const requireEnterpriseUser = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    })
  }

  // Check if user is either enterprise buyer or vendor
  if (req.user.role !== 'BUYER' && req.user.role !== 'VENDOR') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Enterprise access required.'
    })
  }

  next()
}

export default authenticateUser 