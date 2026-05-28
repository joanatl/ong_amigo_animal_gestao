'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEvents, useDeleteEvent } from '@/hooks/useEvents'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Lock, Globe, MapPin, User, Plus, CalendarX } from 'lucide-react'
import { mapsUrl } from '@/lib/maps'

export default function EventsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data, isLoading, isError } = useEvents()
  const deleteMutation = useDeleteEvent()

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este evento?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast('Evento excluído com sucesso!')
    } catch {
      toast('Não foi possível excluir o evento.', 'error')
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendário de Eventos</h1>
          <p className="mt-1 text-sm text-gray-500">Feiras de adoção e eventos da ONG</p>
        </div>
        {user && (
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md"
          >
            <Plus className="h-4 w-4" /> Novo evento
          </Link>
        )}
      </div>

      {isError && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Não foi possível carregar os eventos. Tente novamente.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data.map((event) => {
            const date = new Date(event.eventDate)
            const day = format(date, 'd')
            const month = format(date, 'MMM', { locale: ptBR })
            const time = format(date, 'HH:mm')
            const weekday = format(date, 'EEE', { locale: ptBR })
            const canEdit = !!user && (user.id === event.createdBy.id || user.role === 'admin')

            return (
              <div
                key={event.id}
                className="group flex gap-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                {/* Date chip */}
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-center">
                  <span className="text-2xl font-bold leading-none text-brand-700">{day}</span>
                  <span className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-brand-500">
                    {month}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-center gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {event.visibility === 'private' ? (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400" title="Privado" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-500" title="Público" />
                    )}
                    <h2 className="truncate font-semibold text-gray-900">{event.title}</h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span className="capitalize">{weekday}</span>
                    <span>às {time}</span>
                    {event.location && (
                      <a
                        href={mapsUrl(event.location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 hover:text-brand-600 hover:underline"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </a>
                    )}
                  </div>

                  {event.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">{event.description}</p>
                  )}

                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <User className="h-3 w-3" /> {event.createdBy.name}
                  </p>
                </div>

                {/* Actions */}
                {canEdit && (
                  <div className="flex shrink-0 flex-col justify-center gap-2">
                    <Link
                      href={`/events/${event.id}/edit`}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {data?.data.length === 0 && !isError && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CalendarX className="mb-4 h-14 w-14 text-gray-200" />
              <p className="font-medium text-gray-500">Nenhum evento encontrado.</p>
              {user && (
                <Link href="/events/new" className="mt-3 text-sm text-brand-600 hover:underline">
                  Criar o primeiro evento
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
