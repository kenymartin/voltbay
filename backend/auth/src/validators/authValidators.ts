import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['BUYER', 'VENDOR', 'ADMIN']).default('BUYER'),
  isEnterprise: z.boolean().default(false),
  // Company information for vendors or enterprise accounts
  companyName: z.string().optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]*$/, 'Invalid phone number format').optional().or(z.literal('')),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  // Enterprise specific fields
  businessLicense: z.string().optional(),
  certifications: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional()
}).refine((data) => {
  // If vendor or enterprise account, require company name
  if ((data.role === 'VENDOR' || data.isEnterprise) && !data.companyName) {
    return false
  }
  return true
}, {
  message: 'Company name is required for vendors and enterprise accounts',
  path: ['companyName']
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
})

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]*$/, 'Invalid phone number format').optional().or(z.literal('')),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional()
}) 