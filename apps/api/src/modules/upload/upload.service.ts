import type { FastifyInstance } from 'fastify'
import { env } from '../../config/env'
import crypto from 'crypto'
import path from 'path'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_ATTACHMENT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]
const MAX_EXPIRY_SECONDS = 300

export async function generatePresignedUrl(
  fastify: FastifyInstance,
  filename: string,
  contentType: string,
  context: string,
) {
  const allowed = context === 'attachments' ? ALLOWED_ATTACHMENT_TYPES : ALLOWED_IMAGE_TYPES
  if (!allowed.includes(contentType)) {
    throw { statusCode: 400, message: 'Tipo de arquivo não permitido.' }
  }

  const ext = path.extname(filename) || '.jpg'
  const uniqueId = crypto.randomUUID()
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  const objectKey = `${context}/${year}/${month}/${uniqueId}${ext}`

  const presignedUrl = await fastify.minio.presignedPutObject(
    env.MINIO_BUCKET,
    objectKey,
    MAX_EXPIRY_SECONDS,
  )

  return {
    presignedUrl,
    objectKey,
    expiresIn: MAX_EXPIRY_SECONDS,
  }
}
