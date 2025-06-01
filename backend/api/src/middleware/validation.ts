import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../types/api'

const { validationResult } = require('express-validator')

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Validation failed',
      data: null
    }
    
    return res.status(400).json({
      ...response,
      errors: errors.array()
    })
  }
  
  next()
} 