import nodemailer from 'nodemailer'
import { logger } from '../utils/logger'

export class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    // Only initialize transporter if not in development mode and email credentials are provided
    if (process.env.NODE_ENV !== 'development' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`

    // In development mode, just log the verification link
    if (process.env.NODE_ENV === 'development') {
      logger.info(`📧 Email verification link for ${email}: ${verificationUrl}`)
      logger.info(`🔑 Verification token: ${token}`)
      return
    }

    // If no transporter in production, throw error
    if (!this.transporter) {
      throw new Error('Email service not configured')
    }

    const mailOptions = {
      from: `"VoltBay" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - VoltBay',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">VoltBay</h1>
            <p style="color: #6b7280; margin: 5px 0;">Solar Products Marketplace</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for signing up for VoltBay! To complete your registration and start buying and selling solar products, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with VoltBay, you can safely ignore this email.</p>
          </div>
        </div>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      logger.info(`Verification email sent to: ${email}`)
    } catch (error) {
      logger.error('Failed to send verification email:', error)
      throw new Error('Failed to send verification email')
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`

    // In development mode, just log the reset link
    if (process.env.NODE_ENV === 'development') {
      logger.info(`🔒 Password reset link for ${email}: ${resetUrl}`)
      logger.info(`🔑 Reset token: ${token}`)
      return
    }

    // If no transporter in production, throw error
    if (!this.transporter) {
      throw new Error('Email service not configured')
    }

    const mailOptions = {
      from: `"VoltBay" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - VoltBay',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">VoltBay</h1>
            <p style="color: #6b7280; margin: 5px 0;">Solar Products Marketplace</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              We received a request to reset your password for your VoltBay account. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>This password reset link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        </div>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      logger.info(`Password reset email sent to: ${email}`)
    } catch (error) {
      logger.error('Failed to send password reset email:', error)
      throw new Error('Failed to send password reset email')
    }
  }

  async sendWelcomeEmail(email: string, firstName?: string): Promise<void> {
    // In development mode, just log
    if (process.env.NODE_ENV === 'development') {
      logger.info(`🎉 Welcome email would be sent to: ${email}`)
      return
    }

    // If no transporter in production, throw error
    if (!this.transporter) {
      throw new Error('Email service not configured')
    }

    const mailOptions = {
      from: `"VoltBay" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to VoltBay!',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">VoltBay</h1>
            <p style="color: #6b7280; margin: 5px 0;">Solar Products Marketplace</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome${firstName ? `, ${firstName}` : ''}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Your email has been verified and your VoltBay account is now active! You can now start exploring our marketplace for solar products.
            </p>
            
            <div style="margin: 30px 0;">
              <h3 style="color: #1f2937; margin-bottom: 15px;">What you can do now:</h3>
              <ul style="color: #4b5563; line-height: 1.8;">
                <li>Browse thousands of solar products</li>
                <li>List your own solar equipment for sale</li>
                <li>Participate in auctions</li>
                <li>Connect with other solar enthusiasts</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                Start Exploring
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #9ca3af; font-size: 12px;">
            <p>Thank you for joining the VoltBay community!</p>
          </div>
        </div>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      logger.info(`Welcome email sent to: ${email}`)
    } catch (error) {
      logger.error('Failed to send welcome email:', error)
      // Don't throw error for welcome email as it's not critical
    }
  }
} 