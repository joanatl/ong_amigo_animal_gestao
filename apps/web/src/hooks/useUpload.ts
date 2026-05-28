import { api } from '@/lib/api'

interface PresignResponse {
  presignedUrl: string
  objectKey: string
  expiresIn: number
}

async function uploadFile(file: File, context: 'animals' | 'adopters' | 'attachments'): Promise<string> {
  const { data } = await api.post<PresignResponse>('/upload/presign', {
    filename: file.name,
    contentType: file.type,
    context,
  })

  await fetch(data.presignedUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })

  return data.objectKey
}

export async function uploadAnimalPhoto(file: File): Promise<string> {
  return uploadFile(file, 'animals')
}

export async function uploadAdopterPhoto(file: File): Promise<string> {
  return uploadFile(file, 'adopters')
}

export async function uploadAttachment(file: File): Promise<string> {
  return uploadFile(file, 'attachments')
}
