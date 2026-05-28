import Fastify from 'fastify'
import { env } from './config/env'
import prismaPlugin from './plugins/prisma.plugin'
import minioPlugin from './plugins/minio.plugin'
import jwtPlugin from './plugins/jwt.plugin'
import corsPlugin from './plugins/cors.plugin'
import { authRoutes } from './modules/auth/auth.routes'
import { animalRoutes } from './modules/animals/animal.routes'
import { adopterRoutes } from './modules/adopters/adopter.routes'
import { eventRoutes } from './modules/events/event.routes'
import { uploadRoutes } from './modules/upload/upload.routes'

export async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
  })

  // Plugins
  await fastify.register(corsPlugin)
  await fastify.register(jwtPlugin)
  await fastify.register(prismaPlugin)
  await fastify.register(minioPlugin)

  // Tratamento global de erros de validação Zod / erros de serviço
  fastify.setErrorHandler((error, _request, reply) => {
    // Erros de negócio lançados com { statusCode, message }
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return reply.status(error.statusCode).send({ error: error.message })
    }

    // Erros Zod (ZodError)
    if (error.name === 'ZodError') {
      return reply.status(400).send({ error: 'Dados inválidos', details: JSON.parse(error.message) })
    }

    fastify.log.error(error)
    return reply.status(500).send({ error: 'Erro interno do servidor' })
  })

  // Rotas
  await fastify.register(authRoutes, { prefix: '/v1/auth' })
  await fastify.register(animalRoutes, { prefix: '/v1/animals' })
  await fastify.register(adopterRoutes, { prefix: '/v1/adopters' })
  await fastify.register(eventRoutes, { prefix: '/v1/events' })
  await fastify.register(uploadRoutes, { prefix: '/v1/upload' })

  // Health check
  fastify.get('/health', async () => ({ status: 'ok' }))

  return fastify
}
