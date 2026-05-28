import fp from 'fastify-plugin'
import fastifyCors from '@fastify/cors'
import type { FastifyPluginAsync } from 'fastify'
import { env } from '../config/env'

const corsPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(fastifyCors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  })
})

export default corsPlugin
