import type { FastifyInstance } from 'fastify'
import {
  createAdopterSchema,
  updateAdopterSchema,
  adopterQuerySchema,
  manageAdopterAnimalSchema,
  updateAdopterAnimalSchema,
} from '@amigo-animal/shared'
import { authenticate } from '../../middleware/authenticate'
import {
  listAdopters,
  getAdopterById,
  createAdopter,
  updateAdopter,
  deleteAdopter,
  addAnimalToAdopter,
  updateAdopterAnimal,
  removeAnimalFromAdopter,
} from './adopter.service'

export async function adopterRoutes(fastify: FastifyInstance) {
  // GET /adopters — autenticado
  fastify.get('/', { preHandler: [authenticate] }, async (request) => {
    const query = adopterQuerySchema.parse(request.query)
    return listAdopters(fastify, query)
  })

  // GET /adopters/:id — autenticado
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const adopter = await getAdopterById(fastify, request.params.id)
      return reply.send(adopter)
    },
  )

  // POST /adopters — autenticado
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const body = createAdopterSchema.parse(request.body)
    const adopter = await createAdopter(fastify, body, request.user.sub)
    return reply.status(201).send(adopter)
  })

  // PATCH /adopters/:id — autenticado
  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = updateAdopterSchema.parse(request.body)
      const adopter = await updateAdopter(fastify, request.params.id, body)
      return reply.send(adopter)
    },
  )

  // DELETE /adopters/:id — criador ou admin
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      await deleteAdopter(fastify, request.params.id, request.user.sub, request.user.role)
      return reply.status(204).send()
    },
  )

  // POST /adopters/:id/animals — vincular animal ao adotante
  fastify.post<{ Params: { id: string } }>(
    '/:id/animals',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = manageAdopterAnimalSchema.parse(request.body)
      const adopter = await addAnimalToAdopter(fastify, request.params.id, body)
      return reply.status(201).send(adopter)
    },
  )

  // PATCH /adopters/:id/animals/:animalId — atualizar vínculo
  fastify.patch<{ Params: { id: string; animalId: string } }>(
    '/:id/animals/:animalId',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = updateAdopterAnimalSchema.parse(request.body)
      const adopter = await updateAdopterAnimal(
        fastify,
        request.params.id,
        request.params.animalId,
        body,
      )
      return reply.send(adopter)
    },
  )

  // DELETE /adopters/:id/animals/:animalId — remover vínculo
  fastify.delete<{ Params: { id: string; animalId: string } }>(
    '/:id/animals/:animalId',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const adopter = await removeAnimalFromAdopter(
        fastify,
        request.params.id,
        request.params.animalId,
      )
      return reply.send(adopter)
    },
  )
}
