import { Router } from 'express'
import { UploadController } from '../controllers/uploadController'
import { authMiddleware } from '../middleware/authMiddleware'
import { uploadProductImages, uploadSingle } from '../middleware/uploadMiddleware'

const router = Router()
const uploadController = new UploadController()

// All upload routes require authentication
router.use(authMiddleware.authenticate)

// Upload multiple images
router.post('/images', uploadProductImages, uploadController.uploadImages)

// Upload single image
router.post('/image', uploadSingle, uploadController.uploadSingleImage)

// Delete image
router.delete('/image/:filename', uploadController.deleteImage)

export default router 