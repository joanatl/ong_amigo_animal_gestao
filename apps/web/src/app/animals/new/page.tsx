'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimalForm } from '@/components/animals/AnimalForm'
import { useCreateAnimal } from '@/hooks/useAnimals'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import type { CreateAnimalInput } from '@amigo-animal/shared'

export default function NewAnimalPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const mutation = useCreateAnimal()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  if (authLoading) return <p className="text-gray-500">Carregando...</p>

  const handleSubmit = async (data: CreateAnimalInput) => {
    await mutation.mutateAsync(data)
    toast('Animal cadastrado com sucesso!')
    router.push('/animals')
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Novo animal</h1>
      <AnimalForm
        onSubmit={handleSubmit}
        isLoading={mutation.isPending}
        onCancel={() => router.push('/animals')}
      />
    </div>
  )
}
