import type { FastifyInstance } from 'fastify'
import type {
  CreateAdopterInput,
  UpdateAdopterInput,
  AdopterQuery,
  ManageAdopterAnimalInput,
  UpdateAdopterAnimalInput,
} from '@amigo-animal/shared'
import { env } from '../../config/env'

function buildPhotoUrl(photoKey: string): string {
  return `${env.MINIO_PUBLIC_URL}/${env.MINIO_BUCKET}/${photoKey}`
}

const adopterSelect = {
  id: true,
  name: true,
  address: true,
  email: true,
  phone: true,
  description: true,
  attachmentKeys: true,
  photoUrl: true,
  animals: {
    select: {
      adoptionDate: true,
      adoptionLocation: true,
      animal: { select: { id: true, name: true, photoUrl: true, breed: true } },
    },
  },
  createdBy: true,
  createdAt: true,
  updatedAt: true,
} as const

function mapAdopter(raw: {
  id: string
  name: string
  address: string
  email: string | null
  phone: string | null
  description: string | null
  attachmentKeys: string[]
  photoUrl: string | null
  animals: Array<{
    adoptionDate: Date
    adoptionLocation: string | null
    animal: { id: string; name: string; photoUrl: string | null; breed: string | null }
  }>
  createdBy: string | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    ...raw,
    animals: raw.animals.map((aa) => ({
      id: aa.animal.id,
      name: aa.animal.name,
      photoUrl: aa.animal.photoUrl,
      breed: aa.animal.breed,
      adoptionDate: aa.adoptionDate.toISOString().slice(0, 10),
      adoptionLocation: aa.adoptionLocation,
    })),
  }
}

export async function listAdopters(fastify: FastifyInstance, query: AdopterQuery) {
  const { page, limit, search } = query
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [data, total] = await Promise.all([
    fastify.prisma.adopter.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: adopterSelect,
    }),
    fastify.prisma.adopter.count({ where }),
  ])

  return {
    data: data.map(mapAdopter),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getAdopterById(fastify: FastifyInstance, id: string) {
  const adopter = await fastify.prisma.adopter.findUnique({
    where: { id },
    select: adopterSelect,
  })
  if (!adopter) throw { statusCode: 404, message: 'Adotante não encontrado' }
  return mapAdopter(adopter)
}

export async function createAdopter(
  fastify: FastifyInstance,
  input: CreateAdopterInput,
  userId: string,
) {
  const photoUrl = input.photoKey ? buildPhotoUrl(input.photoKey) : null

  const raw = await fastify.prisma.adopter.create({
    data: {
      name: input.name,
      address: input.address,
      email: input.email || null,
      phone: input.phone || null,
      description: input.description ?? null,
      attachmentKeys: input.attachmentKeys ?? [],
      photoUrl,
      photoKey: input.photoKey ?? null,
      createdBy: userId,
      ...(input.animals?.length && {
        animals: {
          create: input.animals.map(({ animalId, adoptionDate, adoptionLocation }) => ({
            animal: { connect: { id: animalId } },
            adoptionDate: new Date(adoptionDate),
            adoptionLocation: adoptionLocation ?? null,
          })),
        },
      }),
    },
    select: adopterSelect,
  })
  return mapAdopter(raw)
}

export async function updateAdopter(
  fastify: FastifyInstance,
  id: string,
  input: UpdateAdopterInput,
) {
  await getAdopterById(fastify, id)

  const photoUrl =
    input.photoKey !== undefined
      ? input.photoKey
        ? buildPhotoUrl(input.photoKey)
        : null
      : undefined

  const raw = await fastify.prisma.adopter.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.email !== undefined && { email: input.email || null }),
      ...(input.phone !== undefined && { phone: input.phone || null }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.attachmentKeys !== undefined && { attachmentKeys: input.attachmentKeys }),
      ...(input.photoKey !== undefined && { photoKey: input.photoKey }),
      ...(photoUrl !== undefined && { photoUrl }),
      ...(input.animals !== undefined && {
        animals: {
          deleteMany: {},
          create: input.animals.map(({ animalId, adoptionDate, adoptionLocation }) => ({
            animal: { connect: { id: animalId } },
            adoptionDate: new Date(adoptionDate),
            adoptionLocation: adoptionLocation ?? null,
          })),
        },
      }),
    },
    select: adopterSelect,
  })
  return mapAdopter(raw)
}

export async function deleteAdopter(
  fastify: FastifyInstance,
  id: string,
  _userId: string,
  _userRole: string,
) {
  const adopter = await fastify.prisma.adopter.findUnique({ where: { id } })
  if (!adopter) throw { statusCode: 404, message: 'Adotante não encontrado' }

  await fastify.prisma.adopter.delete({ where: { id } })
}

export async function addAnimalToAdopter(
  fastify: FastifyInstance,
  adopterId: string,
  input: ManageAdopterAnimalInput,
) {
  await getAdopterById(fastify, adopterId)

  const existing = await fastify.prisma.adopterAnimal.findUnique({
    where: { adopterId_animalId: { adopterId, animalId: input.animalId } },
  })
  if (existing) throw { statusCode: 409, message: 'Animal já vinculado a este adotante' }

  await fastify.prisma.adopterAnimal.create({
    data: {
      adopterId,
      animalId: input.animalId,
      adoptionDate: new Date(input.adoptionDate),
      adoptionLocation: input.adoptionLocation ?? null,
    },
  })

  return getAdopterById(fastify, adopterId)
}

export async function updateAdopterAnimal(
  fastify: FastifyInstance,
  adopterId: string,
  animalId: string,
  input: UpdateAdopterAnimalInput,
) {
  const link = await fastify.prisma.adopterAnimal.findUnique({
    where: { adopterId_animalId: { adopterId, animalId } },
  })
  if (!link) throw { statusCode: 404, message: 'Vínculo não encontrado' }

  await fastify.prisma.adopterAnimal.update({
    where: { adopterId_animalId: { adopterId, animalId } },
    data: {
      ...(input.adoptionDate !== undefined && { adoptionDate: new Date(input.adoptionDate) }),
      ...(input.adoptionLocation !== undefined && { adoptionLocation: input.adoptionLocation }),
    },
  })

  return getAdopterById(fastify, adopterId)
}

export async function removeAnimalFromAdopter(
  fastify: FastifyInstance,
  adopterId: string,
  animalId: string,
) {
  const link = await fastify.prisma.adopterAnimal.findUnique({
    where: { adopterId_animalId: { adopterId, animalId } },
  })
  if (!link) throw { statusCode: 404, message: 'Vínculo não encontrado' }

  await fastify.prisma.adopterAnimal.delete({
    where: { adopterId_animalId: { adopterId, animalId } },
  })

  return getAdopterById(fastify, adopterId)
}
