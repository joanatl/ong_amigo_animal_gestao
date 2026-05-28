import type { FastifyInstance } from 'fastify'
import { registerSchema, loginSchema, changePasswordSchema } from '@amigo-animal/shared'
import { authenticate } from '../../middleware/authenticate'
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changePassword,
} from './auth.service'
import { env } from '../../config/env'

const REFRESH_COOKIE = 'refreshToken'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/v1/auth/refresh',
  maxAge: 30 * 24 * 60 * 60, // 30 dias em segundos
}

export async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/register
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body)
    const { user, accessToken, refreshToken } = await registerUser(fastify, body)

    reply.setCookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS)
    return reply.status(201).send({
      user,
      accessToken,
      expiresIn: 900,
    })
  })

  // POST /auth/login
  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body)
    const { user, accessToken, refreshToken } = await loginUser(fastify, body)

    reply.setCookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS)
    return reply.send({ user, accessToken, expiresIn: 900 })
  })

  // POST /auth/refresh
  fastify.post('/refresh', async (request, reply) => {
    const rawToken = request.cookies[REFRESH_COOKIE]
    if (!rawToken) {
      return reply.status(401).send({ error: 'Refresh token ausente' })
    }

    const { accessToken, refreshToken } = await refreshAccessToken(fastify, rawToken)

    reply.setCookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTIONS)
    return reply.send({ accessToken, expiresIn: 900 })
  })

  // POST /auth/logout
  fastify.post('/logout', { preHandler: [authenticate] }, async (request, reply) => {
    const rawToken = request.cookies[REFRESH_COOKIE]
    await logoutUser(fastify, rawToken)

    reply.clearCookie(REFRESH_COOKIE, { path: '/v1/auth/refresh' })
    return reply.status(204).send()
  })

  // PATCH /auth/password
  fastify.patch('/password', { preHandler: [authenticate] }, async (request, reply) => {
    const body = changePasswordSchema.parse(request.body)
    await changePassword(fastify, request.user.sub, body.currentPassword, body.newPassword)
    return reply.status(204).send()
  })

  // GET /auth/me
  fastify.get('/me', { preHandler: [authenticate] }, async (request) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.sub },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return user
  })
}
