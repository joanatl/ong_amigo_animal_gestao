import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { authenticate } from '../../middleware/authenticate'
import { generatePresignedUrl } from './upload.service'

const presignSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  context: z.enum(['animals', 'adopters', 'attachments']).default('animals'),
})

export async function uploadRoutes(fastify: FastifyInstance) {
  // POST /upload/presign — gera URL assinada para upload direto no MinIO
  fastify.post('/presign', { preHandler: [authenticate] }, async (request, reply) => {
    const body = presignSchema.parse(request.body)
    const result = await generatePresignedUrl(
      fastify,
      body.filename,
      body.contentType,
      body.context,
    )
    return reply.send(result)
  })
}
