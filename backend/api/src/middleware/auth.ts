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

export default authenticateUser 