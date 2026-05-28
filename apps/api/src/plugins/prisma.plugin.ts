import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import type { FastifyPluginAsync } from 'fastify'

const prismaPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const prisma = new PrismaClient({
    log: fastify.log.level === 'debug' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  })

  await prisma.$connect()

  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
})

export default prismaPlugin

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}
