import { z } from 'zod'

export const createOrderSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  shippingStreet: z.string().min(1, 'Shipping street is required'),
  shippingCity: z.string().min(1, 'Shipping city is required'),
  shippingState: z.string().min(1, 'Shipping state is required'),
  shippingZipCode: z.string().min(1, 'Shipping zip code is required'),
  shippingCountry: z.string().min(1, 'Shipping country is required'),
  paymentType: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER']).optional(),
  paymentLast4: z.string().length(4).optional(),
  paymentExpiryMonth: z.number().min(1).max(12).optional(),
  paymentExpiryYear: z.number().min(new Date().getFullYear()).optional(),
  paymentBrand: z.string().optional(),
  notes: z.string().max(500).optional()
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  notes: z.string().max(500).optional()
})

export const updateShippingSchema = z.object({
  trackingNumber: z.string().min(1).max(100).optional(),
  notes: z.string().max(500).optional()
})

export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional()
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type UpdateShippingInput = z.infer<typeof updateShippingSchema>
export type CancelOrderInput = z.infer<typeof cancelOrderSchema> 