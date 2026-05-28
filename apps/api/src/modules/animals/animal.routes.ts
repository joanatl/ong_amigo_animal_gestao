import type { FastifyInstance } from 'fastify'
import { createAnimalSchema, updateAnimalSchema, animalQuerySchema } from '@amigo-animal/shared'
import { authenticate } from '../../middleware/authenticate'
import {
  listAnimals,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from './animal.service'

export async function animalRoutes(fastify: FastifyInstance) {
  // GET /animals — público
  fastify.get('/', async (request) => {
    const query = animalQuerySchema.parse(request.query)
    return listAnimals(fastify, query)
  })

  // GET /animals/:id — público
  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const animal = await getAnimalById(fastify, request.params.id)
    return reply.send(animal)
  })

  // POST /animals — autenticado
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const body = createAnimalSchema.parse(request.body)
    const animal = await createAnimal(fastify, body, request.user.sub)
    return reply.status(201).send(animal)
  })

  // PATCH /animals/:id — autenticado
  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = updateAnimalSchema.parse(request.body)
      const animal = await updateAnimal(fastify, request.params.id, body)
      return reply.send(animal)
    },
  )

  // DELETE /animals/:id — criador ou admin
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      await deleteAnimal(fastify, request.params.id, request.user.sub, request.user.role)
      return reply.status(204).send()
    },
  )
}
