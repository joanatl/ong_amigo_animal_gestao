import fp from 'fastify-plugin'
import * as Minio from 'minio'
import type { FastifyPluginAsync } from 'fastify'
import { env } from '../config/env'

const minioPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const client = new Minio.Client({
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
  })

  // Garante que o bucket existe na inicialização
  const bucketExists = await client.bucketExists(env.MINIO_BUCKET)
  if (!bucketExists) {
    await client.makeBucket(env.MINIO_BUCKET)
    fastify.log.info(`Bucket '${env.MINIO_BUCKET}' criado`)
  }

  fastify.decorate('minio', client)
})

export default minioPlugin

declare module 'fastify' {
  interface FastifyInstance {
    minio: Minio.Client
  }
}
