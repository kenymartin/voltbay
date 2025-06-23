import { z } from 'zod'

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  content: z.string().min(1, 'Message content is required').max(2000, 'Message too long'),
  productId: z.string().optional().nullable(),
  // Enhanced messaging context
  messageType: z.enum(['GENERAL', 'PRODUCT_INQUIRY', 'QUOTE_DISCUSSION', 'VENDOR_INQUIRY', 'SUPPORT']).default('GENERAL'),
  context: z.object({
    quoteRequestId: z.string().optional().nullable(),
    vendorId: z.string().optional().nullable(),
    projectType: z.string().optional().nullable(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM')
  }).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string()
  })).optional().nullable()
})

export const getMessagesSchema = z.object({
  productId: z.string().optional(),
  conversationId: z.string().optional(),
  messageType: z.enum(['GENERAL', 'PRODUCT_INQUIRY', 'QUOTE_DISCUSSION', 'VENDOR_INQUIRY', 'SUPPORT']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50)
})

export const getConversationsSchema = z.object({
  type: z.enum(['ALL', 'VENDOR', 'CUSTOMER', 'PRODUCT', 'QUOTE']).default('ALL'),
  status: z.enum(['ALL', 'ACTIVE', 'ARCHIVED']).default('ACTIVE'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20)
})

export const markMessageReadSchema = z.object({
  messageIds: z.array(z.string()).min(1, 'At least one message ID is required')
})

export const createConversationSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  initialMessage: z.string().min(1, 'Initial message is required').max(2000, 'Message too long'),
  context: z.object({
    type: z.enum(['VENDOR_INQUIRY', 'PRODUCT_INQUIRY', 'QUOTE_DISCUSSION', 'GENERAL']),
    productId: z.string().optional(),
    quoteRequestId: z.string().optional(),
    vendorId: z.string().optional()
  })
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type GetMessagesInput = z.infer<typeof getMessagesSchema>
export type GetConversationsInput = z.infer<typeof getConversationsSchema>
export type MarkMessageReadInput = z.infer<typeof markMessageReadSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema> 