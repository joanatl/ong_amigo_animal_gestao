import { z } from 'zod'

export const animalSpeciesEnum = z.enum(['dog', 'cat', 'other'])
export const animalStatusEnum = z.enum(['available', 'adopted', 'under_treatment'])
export const animalSizeEnum = z.enum(['small', 'medium', 'large'])

export const createAnimalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento inválida'),
  breed: z.string().max(100).optional(),
  species: animalSpeciesEnum.default('dog'),
  status: animalStatusEnum.default('available'),
  size: animalSizeEnum.optional(),
  weightKg: z.number().positive('Peso deve ser maior que zero').max(200, 'Peso máximo de 200 kg').optional(),
  color: z.string().max(50).optional(),
  fosterHome: z.string().max(200).optional(),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de entrada inválida'),
  description: z.string().max(1000).optional(),
  photoKey: z.string().optional(),
  attachmentKeys: z.array(z.string()).optional(),
})

export const updateAnimalSchema = createAnimalSchema.partial()

export const animalQuerySchema = z.object({
  status: animalStatusEnum.optional(),
  species: animalSpeciesEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(12),
})

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>
export type AnimalQuery = z.infer<typeof animalQuerySchema>

export const animalResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  birthDate: z.string(),
  breed: z.string().nullable(),
  species: animalSpeciesEnum,
  status: animalStatusEnum,
  size: animalSizeEnum.nullable(),
  weightKg: z.number().nullable(),
  color: z.string().nullable(),
  fosterHome: z.string().nullable(),
  entryDate: z.string(),
  photoUrl: z.string().nullable(),
  description: z.string().nullable(),
  attachmentKeys: z.array(z.string()),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type AnimalResponse = z.infer<typeof animalResponseSchema>
