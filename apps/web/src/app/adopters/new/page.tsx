'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateAdopter } from '@/hooks/useAdopters'
import { AdopterForm } from '@/components/adopters/AdopterForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import type { CreateAdopterInput } from '@amigo-animal/shared'

export default function NewAdopterPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const mutation = useCreateAdopter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  if (authLoading) return <p className="text-gray-500">Carregando...</p>

  const handleSubmit = async (data: CreateAdopterInput) => {
    await mutation.mutateAsync(data)
    toast('Adotante cadastrado com sucesso!')
    router.push('/adopters')
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Novo adotante</h1>
      <AdopterForm
        onSubmit={handleSubmit}
        isLoading={mutation.isPending}
        onCancel={() => router.push('/adopters')}
      />
    </div>
  )
}
