import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../config/database'
import { redisClient } from '../config/redis'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'
import { EmailService } from './emailService'
import { envConfig } from '../config/env'

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'BUYER' | 'VENDOR' | 'ADMIN'
  isEnterprise?: boolean
  // Company information for vendors or enterprise accounts
  companyName?: string
  phone?: string
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  locationCity?: string
  locationState?: string
  // Enterprise specific fields
  businessLicense?: string
  certifications?: string[]
  specialties?: string[]
}

interface LoginData {
  email: string
  password: string
}

interface AuthResult {
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    role: string
    verified: boolean
    isEnterprise: boolean
    companyName?: string
  }
  accessToken: string
  refreshToken: string
}

export class AuthService {
  private emailService: EmailService

  constructor() {
    this.emailService = new EmailService()
  }

  async register(data: RegisterData): Promise<AuthResult> {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      role = 'BUYER',
      isEnterprise = false,
      companyName,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      locationCity,
      locationState,
      businessLicense,
      certifications,
      specialties
    } = data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new AppError('User already exists with this email', 409)
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user with additional fields
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        isEnterprise,
        companyName,
        phone,
        street,
        city,
        state,
        zipCode,
        country,
        locationCity: locationCity || city,
        locationState: locationState || state,
        emailVerificationToken,
        emailVerificationExpires,
        // Enterprise accounts start unverified and require manual approval
        verified: !isEnterprise
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        isEnterprise: true,
        companyName: true
      }
    })

    // Send appropriate email based on user type
    if (isEnterprise) {
      // Send application received email for enterprise accounts
      await this.emailService.sendEnterpriseApplicationEmail(email, {
        firstName,
        lastName,
        companyName: companyName || '',
        businessLicense,
        certifications,
        specialties
      })
    } else {
      // Send regular verification email
      await this.emailService.sendVerificationEmail(email, emailVerificationToken)
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id)
    const refreshToken = await this.generateRefreshToken(user.id)

    logger.info(`User registered successfully: ${email} (${isEnterprise ? 'Enterprise' : 'Regular'} ${role})`)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role,
        verified: user.verified,
        isEnterprise: user.isEnterprise,
        companyName: user.companyName || undefined
      },
      accessToken,
      refreshToken
    }
  }

  async login(data: LoginData): Promise<AuthResult> {
    const { email, password } = data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        isEnterprise: true,
        isEmailVerified: true,
        companyName: true
      }
    })

    if (!user) {
      throw new AppError('Invalid credentials', 401)
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401)
    }

    // Check if enterprise account has verified email (they can login but with limited access)
    if (user.isEnterprise && !user.isEmailVerified) {
      throw new AppError('Please verify your email address before accessing your enterprise account.', 403)
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id)
    const refreshToken = await this.generateRefreshToken(user.id)

    logger.info(`User logged in successfully: ${email}`)

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role,
        verified: user.verified,
        isEnterprise: user.isEnterprise,
        companyName: user.companyName || undefined
      },
      accessToken,
      refreshToken
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      // Remove refresh token from database
      await prisma.refreshToken.delete({
        where: { token: refreshToken }
      })

      // Remove from Redis cache if exists
      await redisClient.del(`refresh_token:${refreshToken}`)
    } catch (error) {
      // Token might not exist, which is fine
      logger.warn('Refresh token not found during logout')
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    // Verify refresh token
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            verified: true,
            isEnterprise: true,
            companyName: true
          }
        }
      }
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401)
    }

    // Generate new tokens
    const newAccessToken = this.generateAccessToken(tokenRecord.user.id)
    const newRefreshToken = await this.generateRefreshToken(tokenRecord.user.id)

    // Remove old refresh token - use deleteMany to avoid error if token doesn't exist
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    })

    return {
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        firstName: tokenRecord.user.firstName || undefined,
        lastName: tokenRecord.user.lastName || undefined,
        role: tokenRecord.user.role,
        verified: tokenRecord.user.verified,
        isEnterprise: tokenRecord.user.isEnterprise,
        companyName: tokenRecord.user.companyName || undefined
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    // Send welcome email after verification
    await this.emailService.sendWelcomeEmail(user.email, user.firstName || undefined)

    logger.info(`Email verified for user: ${user.email}`)
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if email exists
      return
    }

    if (user.verified) {
      throw new AppError('Email is already verified', 400)
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex')
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires
      }
    })

    await this.emailService.sendVerificationEmail(email, emailVerificationToken)

    logger.info(`Verification email resent to: ${email}`)
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if email exists
      return
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    })

    await this.emailService.sendPasswordResetEmail(email, resetToken)

    logger.info(`Password reset email sent to: ${email}`)
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    })

    // Invalidate all refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id }
    })

    logger.info(`Password reset successfully for user: ${user.email}`)
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        avatar: true,
        phone: true,
        street: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    return user
  }

  async updateUserProfile(userId: string, updateData: any) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        verified: true,
        avatar: true,
        phone: true,
        street: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return user
  }

  private generateAccessToken(userId: string): string {
    const secret = envConfig.JWT_SECRET
    const expiresIn = envConfig.JWT_EXPIRES_IN
    
    if (!secret) {
      throw new Error('JWT_SECRET is not configured')
    }
    
    return jwt.sign({ userId } as object, secret as jwt.Secret, { expiresIn } as jwt.SignOptions)
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt
      }
    })

    return token
  }

  async verifyAccessToken(token: string): Promise<{ userId: string }> {
    try {
      const secret = envConfig.JWT_SECRET
      if (!secret) {
        throw new Error('JWT_SECRET is not configured')
      }
      
      const decoded = jwt.verify(token, secret) as { userId: string }
      return decoded
    } catch (error) {
      throw new AppError('Invalid access token', 401)
    }
  }
} 