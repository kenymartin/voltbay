import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/authService'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema 
} from '../validators/authValidators'

export class AuthController {
  private authService: AuthService

  constructor() {
    this.authService = new AuthService()
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = registerSchema.parse(req.body)
      
      const result = await this.authService.register(validatedData)
      
      logger.info(`User registered: ${validatedData.email}`)
      
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      })
    } catch (error) {
      next(error)
    }
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body)
      
      const result = await this.authService.login(validatedData)
      
      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      logger.info(`User logged in: ${validatedData.email}`)
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      })
    } catch (error) {
      next(error)
    }
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken
      
      if (refreshToken) {
        await this.authService.logout(refreshToken)
      }
      
      res.clearCookie('refreshToken')
      
      res.json({
        success: true,
        message: 'Logout successful'
      })
    } catch (error) {
      next(error)
    }
  }

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken
      
      if (!refreshToken) {
        throw new AppError('Refresh token not provided', 401)
      }
      
      const result = await this.authService.refreshToken(refreshToken)
      
      // Set new refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      })
    } catch (error) {
      next(error)
    }
  }

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = verifyEmailSchema.parse(req.body)
      
      await this.authService.verifyEmail(token)
      
      res.json({
        success: true,
        message: 'Email verified successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body)
      
      await this.authService.forgotPassword(email)
      
      res.json({
        success: true,
        message: 'Password reset email sent'
      })
    } catch (error) {
      next(error)
    }
  }

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body)
      
      await this.authService.resetPassword(validatedData.token, validatedData.password)
      
      res.json({
        success: true,
        message: 'Password reset successful'
      })
    } catch (error) {
      next(error)
    }
  }

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }
      
      const user = await this.authService.getUserProfile(userId)
      
      res.json({
        success: true,
        data: { user }
      })
    } catch (error) {
      next(error)
    }
  }

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      
      if (!userId) {
        throw new AppError('User not authenticated', 401)
      }
      
      const user = await this.authService.updateUserProfile(userId, req.body)
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
      })
    } catch (error) {
      next(error)
    }
  }
} 