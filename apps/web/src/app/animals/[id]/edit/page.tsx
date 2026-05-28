'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAnimal, useUpdateAnimal } from '@/hooks/useAnimals'
import { AnimalForm } from '@/components/animals/AnimalForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import type { CreateAnimalInput } from '@amigo-animal/shared'

export default function EditAnimalPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: animal, isLoading } = useAnimal(params.id)
  const mutation = useUpdateAnimal(params.id)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  if (authLoading || isLoading) return <p className="text-gray-500">Carregando...</p>
  if (!animal) return <p className="text-red-600">Animal não encontrado.</p>

  const handleSubmit = async (data: CreateAnimalInput) => {
    await mutation.mutateAsync(data)
    toast('Animal atualizado com sucesso!')
    router.push('/animals')
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar animal</h1>
      <AnimalForm
        defaultValues={{
          name: animal.name,
          birthDate: animal.birthDate.slice(0, 10),
          breed: animal.breed ?? undefined,
          species: animal.species,
          status: animal.status,
          size: animal.size ?? undefined,
          weightKg: animal.weightKg ?? undefined,
          color: animal.color ?? undefined,
          fosterHome: animal.fosterHome ?? undefined,
          entryDate: animal.entryDate.slice(0, 10),
          description: animal.description ?? undefined,
          attachmentKeys: animal.attachmentKeys ?? [],
        }}
        onSubmit={handleSubmit}
        isLoading={mutation.isPending}
        onCancel={() => router.push('/animals')}
      />
    </div>
  )
}
