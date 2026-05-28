import type { FastifyInstance } from 'fastify'
import type { CreateEventInput, UpdateEventInput, EventQuery } from '@amigo-animal/shared'

export async function listEvents(
  fastify: FastifyInstance,
  query: EventQuery,
  userId?: string,
) {
  const { from, to, page, limit } = query
  const skip = (page - 1) * limit

  const events = await fastify.prisma.event.findMany({
    where: {
      OR: [
        { visibility: 'public' },
        ...(userId ? [{ visibility: 'private' as const, createdBy: userId }] : []),
      ],
      ...(from || to
        ? {
            eventDate: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    },
    skip,
    take: limit,
    orderBy: { eventDate: 'asc' },
    include: {
      creator: { select: { id: true, name: true } },
    },
  })

  const total = await fastify.prisma.event.count({
    where: {
      OR: [
        { visibility: 'public' },
        ...(userId ? [{ visibility: 'private' as const, createdBy: userId }] : []),
      ],
    },
  })

  // Remapeia para que createdBy seja o objeto { id, name } conforme o schema compartilhado
  const data = events.map(({ creator, createdBy: _fk, ...rest }) => ({
    ...rest,
    createdBy: creator,
  }))

  return {
    data,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  }
}

export async function getEventById(
  fastify: FastifyInstance,
  id: string,
  userId?: string,
) {
  const event = await fastify.prisma.event.findUnique({
    where: { id },
    include: { creator: { select: { id: true, name: true } } },
  })

  if (!event) throw { statusCode: 404, message: 'Evento não encontrado' }

  if (event.visibility === 'private' && event.createdBy !== userId) {
    throw { statusCode: 403, message: 'Acesso negado' }
  }

  const { creator, createdBy: _fk, ...rest } = event
  return { ...rest, createdBy: creator }
}

export async function createEvent(
  fastify: FastifyInstance,
  input: CreateEventInput,
  userId: string,
) {
  const event = await fastify.prisma.event.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      eventDate: new Date(input.eventDate),
      location: input.location ?? null,
      visibility: input.visibility ?? 'public',
      createdBy: userId,
    },
    include: { creator: { select: { id: true, name: true } } },
  })

  const { creator, createdBy: _fk, ...rest } = event
  return { ...rest, createdBy: creator }
}

export async function updateEvent(
  fastify: FastifyInstance,
  id: string,
  input: UpdateEventInput,
  userId: string,
  userRole: string,
) {
  const event = await fastify.prisma.event.findUnique({ where: { id } })
  if (!event) throw { statusCode: 404, message: 'Evento não encontrado' }

  if (event.createdBy !== userId && userRole !== 'admin') {
    throw { statusCode: 403, message: 'Apenas o criador ou admin pode editar este evento' }
  }

  const updated = await fastify.prisma.event.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.eventDate !== undefined && { eventDate: new Date(input.eventDate) }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.visibility !== undefined && { visibility: input.visibility }),
    },
    include: { creator: { select: { id: true, name: true } } },
  })

  const { creator, createdBy: _fk, ...rest } = updated
  return { ...rest, createdBy: creator }
}

export async function deleteEvent(
  fastify: FastifyInstance,
  id: string,
  userId: string,
  userRole: string,
) {
  const event = await fastify.prisma.event.findUnique({ where: { id } })
  if (!event) throw { statusCode: 404, message: 'Evento não encontrado' }

  if (event.createdBy !== userId && userRole !== 'admin') {
    throw { statusCode: 403, message: 'Apenas o criador ou admin pode excluir este evento' }
  }

  await fastify.prisma.event.delete({ where: { id } })
}
