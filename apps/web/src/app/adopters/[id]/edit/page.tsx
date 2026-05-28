'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdopter, useUpdateAdopter } from '@/hooks/useAdopters'
import { AdopterForm } from '@/components/adopters/AdopterForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import type { CreateAdopterInput } from '@amigo-animal/shared'

export default function EditAdopterPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: adopter, isLoading } = useAdopter(params.id)
  const mutation = useUpdateAdopter(params.id)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  if (authLoading || isLoading) return <p className="text-gray-500">Carregando...</p>
  if (!adopter) return <p className="text-red-600">Adotante não encontrado.</p>

  const handleSubmit = async (data: CreateAdopterInput) => {
    await mutation.mutateAsync(data)
    toast('Adotante atualizado com sucesso!')
    router.push(`/adopters/${params.id}`)
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar adotante</h1>
      <AdopterForm
        defaultValues={{
          name: adopter.name,
          address: adopter.address,
          email: adopter.email ?? undefined,
          phone: adopter.phone ?? undefined,
          description: adopter.description ?? undefined,
          attachmentKeys: adopter.attachmentKeys ?? [],
          animals: adopter.animals?.map((a) => ({ animalId: a.id, adoptionDate: a.adoptionDate.slice(0, 10) })) ?? [],
        }}
        onSubmit={handleSubmit}
        isLoading={mutation.isPending}
        onCancel={() => router.push(`/adopters/${params.id}`)}
      />
    </div>
  )
}
