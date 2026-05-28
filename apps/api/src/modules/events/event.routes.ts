import type { FastifyInstance } from 'fastify'
import { createEventSchema, updateEventSchema, eventQuerySchema } from '@amigo-animal/shared'
import { authenticate } from '../../middleware/authenticate'
import type { JwtPayload } from '../../middleware/authenticate'
import {
  listEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from './event.service'

export async function eventRoutes(fastify: FastifyInstance) {
  // GET /events — público (mas usuário autenticado vê seus eventos privados)
  fastify.get('/', async (request) => {
    const query = eventQuerySchema.parse(request.query)

    // Tenta verificar JWT sem lançar erro se ausente
    let userId: string | undefined
    try {
      await request.jwtVerify<JwtPayload>()
      userId = request.user.sub
    } catch {
      userId = undefined
    }

    return listEvents(fastify, query, userId)
  })

  // GET /events/:id
  fastify.get<{ Params: { id: string } }>('/:id', async (request) => {
    let userId: string | undefined
    try {
      await request.jwtVerify<JwtPayload>()
      userId = request.user.sub
    } catch {
      userId = undefined
    }

    return getEventById(fastify, request.params.id, userId)
  })

  // POST /events — autenticado
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const body = createEventSchema.parse(request.body)
    const event = await createEvent(fastify, body, request.user.sub)
    return reply.status(201).send(event)
  })

  // PATCH /events/:id — autenticado
  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = updateEventSchema.parse(request.body)
      const event = await updateEvent(
        fastify,
        request.params.id,
        body,
        request.user.sub,
        request.user.role,
      )
      return reply.send(event)
    },
  )

  // DELETE /events/:id — autenticado (criador ou admin)
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      await deleteEvent(fastify, request.params.id, request.user.sub, request.user.role)
      return reply.status(204).send()
    },
  )
}
