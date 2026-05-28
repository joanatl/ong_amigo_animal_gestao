import type { FastifyRequest, FastifyReply } from 'fastify'

export interface JwtPayload {
  sub: string
  email: string
  role: 'admin' | 'volunteer'
}

/**
 * preHandler que exige JWT válido.
 * Popula request.user com o payload do token.
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify<JwtPayload>()
  } catch {
    reply.status(401).send({ error: 'Token inválido ou ausente' })
  }
}

/**
 * preHandler que exige role 'admin'.
 * Deve ser usado após `authenticate`.
 */
export async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const user = request.user as JwtPayload
  if (user?.role !== 'admin') {
    reply.status(403).send({ error: 'Acesso restrito a administradores' })
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload
  }
}
