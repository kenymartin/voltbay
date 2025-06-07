import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { authMiddleware } from '../middleware/authMiddleware'
import { validate } from '../middleware/validation'
import { updateProfileSchema } from '../validators/authValidators'

const router = Router()
const authController = new AuthController()

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.post('/refresh-token', authController.refreshToken)
router.post('/verify-email', authController.verifyEmail)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

// Protected routes
router.get('/profile', authMiddleware.authenticate, authController.getProfile)
router.put('/profile', authMiddleware.authenticate, validate(updateProfileSchema), authController.updateProfile)

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString(),
    service: 'voltbay-auth',
    version: '1.0.0'
  })
})

export default router 