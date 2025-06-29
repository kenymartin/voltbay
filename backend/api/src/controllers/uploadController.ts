import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors'
import { logger } from '../utils/logger'
import path from 'path'
import fs from 'fs/promises'

export class UploadController {
  uploadImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError('No images uploaded', 400)
      }

      const files = req.files as Express.Multer.File[]
      const baseUrl = `${req.protocol}://${req.get('host')}`
      
      const imageUrls = files.map(file => {
        return `${baseUrl}/uploads/${file.filename}`
      })

      logger.info(`${files.length} images uploaded successfully`)

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
          imageUrls,
          count: files.length
        }
      })
    } catch (error) {
      // Clean up uploaded files if error occurs
      if (req.files && Array.isArray(req.files)) {
        const files = req.files as Express.Multer.File[]
        for (const file of files) {
          try {
            await fs.unlink(file.path)
          } catch (unlinkError) {
            logger.error('Error deleting file:', unlinkError)
          }
        }
      }
      next(error)
    }
  }

  uploadSingleImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No image uploaded', 400)
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`

      logger.info(`Image uploaded successfully: ${req.file.filename}`)

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          imageUrl,
          filename: req.file.filename,
          size: req.file.size
        }
      })
    } catch (error) {
      // Clean up uploaded file if error occurs
      if (req.file) {
        try {
          await fs.unlink(req.file.path)
        } catch (unlinkError) {
          logger.error('Error deleting file:', unlinkError)
        }
      }
      next(error)
    }
  }

  deleteImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filename } = req.params
      
      if (!filename) {
        throw new AppError('Filename is required', 400)
      }

      // Validate filename to prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        throw new AppError('Invalid filename', 400)
      }

      const uploadDir = process.env.UPLOAD_DIR || './uploads'
      const filePath = path.join(uploadDir, filename)

      try {
        await fs.access(filePath)
        await fs.unlink(filePath)
        
        logger.info(`Image deleted successfully: ${filename}`)
        
        res.json({
          success: true,
          message: 'Image deleted successfully'
        })
      } catch (error) {
        throw new AppError('Image not found', 404)
      }
    } catch (error) {
      next(error)
    }
  }

  uploadQuoteDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No document uploaded', 400)
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`
      const documentUrl = `${baseUrl}/uploads/${req.file.filename}`

      logger.info(`Document uploaded successfully: ${req.file.filename}`)

      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          documentUrl,
          filename: req.file.filename,
          size: req.file.size
        }
      })
    } catch (error) {
      // Clean up uploaded file if error occurs
      if (req.file) {
        try {
          await fs.unlink(req.file.path)
        } catch (unlinkError) {
          logger.error('Error deleting file:', unlinkError)
        }
      }
      next(error)
    }
  }
} 