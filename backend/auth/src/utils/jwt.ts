import jwt from 'jsonwebtoken'
import { logger } from './logger'

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

export const generateTokens = (payload: JwtPayload): TokenPair => {
  try {
    const secret = JWT_SECRET
    const refreshSecret = JWT_REFRESH_SECRET
    
    if (!secret || !refreshSecret) {
      throw new Error('JWT secrets are not configured')
    }
    
    const accessToken = jwt.sign(payload as object, secret as jwt.Secret, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'voltbay-auth',
      audience: 'voltbay-app'
    } as jwt.SignOptions)

    const refreshToken = jwt.sign(
      { userId: payload.userId } as object,
      refreshSecret as jwt.Secret,
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'voltbay-auth',
        audience: 'voltbay-app'
      } as jwt.SignOptions
    )

    return { accessToken, refreshToken }
  } catch (error) {
    logger.error('Error generating tokens:', error)
    throw new Error('Failed to generate tokens')
  }
}

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    const secret = JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET is not configured')
    }
    
    const decoded = jwt.verify(token, secret, {
      issuer: 'voltbay-auth',
      audience: 'voltbay-app'
    }) as JwtPayload

    return decoded
  } catch (error) {
    logger.error('Error verifying access token:', error)
    throw new Error('Invalid access token')
  }
}

export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const secret = JWT_REFRESH_SECRET
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not configured')
    }
    
    const decoded = jwt.verify(token, secret, {
      issuer: 'voltbay-auth',
      audience: 'voltbay-app'
    }) as { userId: string }

    return decoded
  } catch (error) {
    logger.error('Error verifying refresh token:', error)
    throw new Error('Invalid refresh token')
  }
}

export const getTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7)
} 