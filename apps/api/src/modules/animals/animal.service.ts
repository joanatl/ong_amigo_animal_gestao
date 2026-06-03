import type { FastifyInstance } from 'fastify'
import type { CreateAnimalInput, UpdateAnimalInput, AnimalQuery } from '@amigo-animal/shared'
import { env } from '../../config/env'

function buildPhotoUrl(photoKey: string): string {
  return `${env.MINIO_PUBLIC_URL}/${env.MINIO_BUCKET}/${photoKey}`
}

export async function listAnimals(fastify: FastifyInstance, query: AnimalQuery) {
  const { status, species, search, page, limit } = query
  const skip = (page - 1) * limit

  const where = {
    ...(status && { status }),
    ...(species && { species }),
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
  }

  const [data, total] = await Promise.all([
    fastify.prisma.animal.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        birthDate: true,
        breed: true,
        species: true,
        status: true,
        size: true,
        weightKg: true,
        color: true,
        fosterHome: true,
        entryDate: true,
        photoUrl: true,
        description: true,
        attachmentKeys: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    fastify.prisma.animal.count({ where }),
  ])

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getAnimalById(fastify: FastifyInstance, id: string) {
  const animal = await fastify.prisma.animal.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      birthDate: true,
      breed: true,
      species: true,
      status: true,
      size: true,
      weightKg: true,
      color: true,
      fosterHome: true,
      entryDate: true,
      photoUrl: true,
      description: true,
      attachmentKeys: true,
      createdBy: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  if (!animal) throw { statusCode: 404, message: 'Animal não encontrado' }
  return animal
}

export async function createAnimal(
  fastify: FastifyInstance,
  input: CreateAnimalInput,
  userId: string,
) {
  const photoUrl = input.photoKey ? buildPhotoUrl(input.photoKey) : null

  const animal = await fastify.prisma.animal.create({
    data: {
      name: input.name,
      birthDate: new Date(input.birthDate),
      breed: input.breed ?? null,
      species: input.species ?? 'dog',
      status: input.status ?? 'available',
      size: input.size ?? null,
      weightKg: input.weightKg ?? null,
      color: input.color ?? null,
      fosterHome: input.fosterHome ?? null,
      entryDate: new Date(input.entryDate),
      description: input.description ?? null,
      photoUrl,
      photoKey: input.photoKey ?? null,
      attachmentKeys: input.attachmentKeys ?? [],
      createdBy: userId,
    },
  })

  return animal
}

export async function updateAnimal(
  fastify: FastifyInstance,
  id: string,
  input: UpdateAnimalInput,
) {
  await getAnimalById(fastify, id)

  const photoUrl =
    input.photoKey !== undefined
      ? input.photoKey
        ? buildPhotoUrl(input.photoKey)
        : null
      : undefined

  const animal = await fastify.prisma.animal.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.birthDate !== undefined && { birthDate: new Date(input.birthDate) }),
      ...(input.breed !== undefined && { breed: input.breed }),
      ...(input.species !== undefined && { species: input.species }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.size !== undefined && { size: input.size }),
      ...(input.weightKg !== undefined && { weightKg: input.weightKg }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.fosterHome !== undefined && { fosterHome: input.fosterHome }),
      ...(input.entryDate !== undefined && { entryDate: new Date(input.entryDate) }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.photoKey !== undefined && { photoKey: input.photoKey }),
      ...(input.attachmentKeys !== undefined && { attachmentKeys: input.attachmentKeys }),
      ...(photoUrl !== undefined && { photoUrl }),
    },
  })

  return animal
}

export async function deleteAnimal(
  fastify: FastifyInstance,
  id: string,
  _userId: string,
  _userRole: string,
) {
  const animal = await fastify.prisma.animal.findUnique({ where: { id } })
  if (!animal) throw { statusCode: 404, message: 'Animal não encontrado' }

  // Remove foto do MinIO se existir
  if (animal.photoKey) {
    try {
      await fastify.minio.removeObject(env.MINIO_BUCKET, animal.photoKey)
    } catch (err) {
      fastify.log.warn({ err, photoKey: animal.photoKey }, 'Falha ao remover foto do MinIO')
    }
  }

  await fastify.prisma.animal.delete({ where: { id } })
}
