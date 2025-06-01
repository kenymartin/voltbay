import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { ApiResponse } from '../types/api'

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