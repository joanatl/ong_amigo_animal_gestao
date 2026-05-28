import { z } from 'zod'

export const eventVisibilityEnum = z.enum(['public', 'private'])

export const createEventSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  description: z.string().max(2000).optional(),
  eventDate: z.string().datetime({ message: 'Selecione uma data e hora válidas' }),
  location: z.string().max(255).optional(),
  visibility: eventVisibilityEnum.default('public'),
})

export const updateEventSchema = createEventSchema.partial()

export const eventQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  visibility: eventVisibilityEnum.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type EventQuery = z.infer<typeof eventQuerySchema>

export const eventResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  eventDate: z.string().datetime(),
  location: z.string().nullable(),
  visibility: eventVisibilityEnum,
  createdBy: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type EventResponse = z.infer<typeof eventResponseSchema>
