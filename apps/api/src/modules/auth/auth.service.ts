import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import type { FastifyInstance } from 'fastify'
import type { RegisterInput, LoginInput } from '@amigo-animal/shared'
import { env } from '../../config/env'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function refreshTokenExpiresAt(): Date {
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10)
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

export async function registerUser(
  fastify: FastifyInstance,
  input: RegisterInput,
) {
  const existing = await fastify.prisma.user.findUnique({
    where: { email: input.email },
  })
  if (existing) {
    throw { statusCode: 409, message: 'E-mail já cadastrado' }
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const user = await fastify.prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  const { accessToken, refreshToken } = await issueTokens(fastify, user.id, user.email, user.role)
  return { user, accessToken, refreshToken }
}

export async function loginUser(
  fastify: FastifyInstance,
  input: LoginInput,
) {
  const user = await fastify.prisma.user.findUnique({
    where: { email: input.email },
  })

  // Mensagem genérica para evitar enumeração de usuários
  const invalid = { statusCode: 401, message: 'Credenciais inválidas' }

  if (!user) throw invalid

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) throw invalid

  const { accessToken, refreshToken } = await issueTokens(fastify, user.id, user.email, user.role)

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }

  return { user: safeUser, accessToken, refreshToken }
}

export async function refreshAccessToken(
  fastify: FastifyInstance,
  rawRefreshToken: string,
) {
  const tokenHash = hashToken(rawRefreshToken)

  const record = await fastify.prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!record || record.revoked || record.expiresAt < new Date()) {
    // Se o token foi revogado (possível ataque de reuso), revogar todos
    if (record?.revoked) {
      await fastify.prisma.refreshToken.updateMany({
        where: { userId: record.userId },
        data: { revoked: true },
      })
    }
    throw { statusCode: 401, message: 'Refresh token inválido ou expirado' }
  }

  // Revogar token antigo (rotação)
  await fastify.prisma.refreshToken.update({
    where: { id: record.id },
    data: { revoked: true },
  })

  const { user } = record
  const { accessToken, refreshToken: newRefreshToken } = await issueTokens(
    fastify,
    user.id,
    user.email,
    user.role,
  )

  return { accessToken, refreshToken: newRefreshToken }
}

export async function changePassword(
  fastify: FastifyInstance,
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await fastify.prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw { statusCode: 404, message: 'Usuário não encontrado' }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) throw { statusCode: 400, message: 'Senha atual incorreta' }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await fastify.prisma.user.update({ where: { id: userId }, data: { passwordHash } })
}

export async function logoutUser(
  fastify: FastifyInstance,
  rawRefreshToken: string | undefined,
) {
  if (!rawRefreshToken) return

  const tokenHash = hashToken(rawRefreshToken)
  await fastify.prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  })
}

async function issueTokens(
  fastify: FastifyInstance,
  userId: string,
  email: string,
  role: string,
) {
  const accessToken = fastify.jwt.sign({ sub: userId, email, role })

  const rawRefreshToken = crypto.randomBytes(64).toString('hex')
  const tokenHash = hashToken(rawRefreshToken)

  await fastify.prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: refreshTokenExpiresAt(),
    },
  })

  return { accessToken, refreshToken: rawRefreshToken }
}
