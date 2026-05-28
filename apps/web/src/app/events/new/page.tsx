'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EventForm } from '@/components/events/EventForm'
import { useCreateEvent } from '@/hooks/useEvents'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import type { CreateEventInput } from '@amigo-animal/shared'

export default function NewEventPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const mutation = useCreateEvent()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  if (authLoading) return <p className="text-gray-500">Carregando...</p>

  const handleSubmit = async (data: CreateEventInput) => {
    await mutation.mutateAsync(data)
    toast('Evento criado com sucesso!')
    router.push('/events')
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Novo evento</h1>
      <EventForm
        onSubmit={handleSubmit}
        isLoading={mutation.isPending}
        onCancel={() => router.push('/events')}
      />
    </div>
  )
}
