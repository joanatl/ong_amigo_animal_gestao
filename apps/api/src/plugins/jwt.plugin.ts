import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'
import type { FastifyPluginAsync } from 'fastify'
import { env } from '../config/env'

const jwtPlugin: FastifyPluginAsync = fp(async (fastify) => {
  await fastify.register(fastifyCookie)

  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    },
  })
})

export default jwtPlugin
