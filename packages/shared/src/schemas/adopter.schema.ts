import { z } from 'zod'

const adopterAnimalInput = z.object({
  animalId: z.string().uuid(),
  adoptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de adoção inválida'),
  adoptionLocation: z.string().max(200).optional(),
})

export const createAdopterSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(120),
  address: z.string().min(1, 'Endereço é obrigatório').max(300),
  email: z.string().email('E-mail inválido').max(255).optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  description: z.string().max(1000).optional(),
  attachmentKeys: z.array(z.string()).optional(),
  photoKey: z.string().optional(),
  animals: z.array(adopterAnimalInput).optional(),
})

export const updateAdopterSchema = createAdopterSchema.partial()

export const adopterQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
})

export const manageAdopterAnimalSchema = z.object({
  animalId: z.string().uuid(),
  adoptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de adoção inválida'),
  adoptionLocation: z.string().max(200).optional(),
})

export const updateAdopterAnimalSchema = z.object({
  adoptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de adoção inválida').optional(),
  adoptionLocation: z.string().max(200).optional(),
})

export type CreateAdopterInput = z.infer<typeof createAdopterSchema>
export type UpdateAdopterInput = z.infer<typeof updateAdopterSchema>
export type AdopterQuery = z.infer<typeof adopterQuerySchema>
export type ManageAdopterAnimalInput = z.infer<typeof manageAdopterAnimalSchema>
export type UpdateAdopterAnimalInput = z.infer<typeof updateAdopterAnimalSchema>

export const adopterAnimalResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  photoUrl: z.string().nullable(),
  breed: z.string().nullable(),
  adoptionDate: z.string(),
  adoptionLocation: z.string().nullable(),
})

export const adopterResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  description: z.string().nullable(),
  attachmentKeys: z.array(z.string()),
  photoUrl: z.string().nullable(),
  animals: z.array(adopterAnimalResponseSchema),
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type AdopterAnimalResponse = z.infer<typeof adopterAnimalResponseSchema>
export type AdopterResponse = z.infer<typeof adopterResponseSchema>
