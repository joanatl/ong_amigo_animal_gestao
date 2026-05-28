'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEvent, useUpdateEvent } from '@/hooks/useEvents'
import { EventForm } from '@/components/events/EventForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import type { CreateEventInput } from '@amigo-animal/shared'

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { data: event, isLoading } = useEvent(params.id)
  const mutation = useUpdateEvent(params.id)
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login')
  }, [authLoading, user, router])

  if (authLoading || isLoading) return <p className="text-gray-500">Carregando...</p>
  if (!event) return <p className="text-red-600">Evento não encontrado.</p>

  const handleSubmit = async (data: CreateEventInput) => {
    await mutation.mutateAsync(data)
    toast('Evento atualizado com sucesso!')
    router.push('/events')
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar evento</h1>
      <EventForm
        defaultValues={{
          title: event.title,
          description: event.description ?? undefined,
          eventDate: event.eventDate,
          location: event.location ?? undefined,
          visibility: event.visibility,
        }}
        onSubmit={handleSubmit}
        isLoading={mutation.isPending}
        onCancel={() => router.push('/events')}
      />
    </div>
  )
}
