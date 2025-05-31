import { z } from 'zod'

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
  productId: z.string().optional()
})

export const getMessagesSchema = z.object({
  productId: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50)
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type GetMessagesInput = z.infer<typeof getMessagesSchema> 