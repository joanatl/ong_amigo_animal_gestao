'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEventSchema, type CreateEventInput } from '@amigo-animal/shared'

interface Props {
  defaultValues?: Partial<CreateEventInput>
  onSubmit: (data: CreateEventInput) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function EventForm({ defaultValues, onSubmit, isLoading, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      visibility: 'public',
      ...defaultValues,
    },
  })

  const handleFormSubmit = async (data: CreateEventInput) => {
    try {
      await onSubmit(data)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Erro ao salvar evento'
      setError('root', { message: msg })
    }
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título *</label>
        <input id="title" {...register('title')} type="text" className={inputClass} />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">Data e hora *</label>
        <input
          id="eventDate"
          {...register('eventDate', {
            // datetime-local retorna "2026-06-15T10:00" — converte para ISO antes do Zod validar
            setValueAs: (v: string) => (v ? new Date(v).toISOString() : v),
          })}
          type="datetime-local"
          className={inputClass}
        />
        {errors.eventDate && <p className="mt-1 text-xs text-red-600">{errors.eventDate.message}</p>}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Local</label>
        <input id="location" {...register('location')} type="text" className={inputClass} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea id="description" {...register('description')} rows={4} className={inputClass} />
      </div>

      <div>
        <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">Visibilidade</label>
        <select id="visibility" {...register('visibility')} className={inputClass}>
          <option value="public">Público — visível para todos</option>
          <option value="private">Privado — apenas para mim</option>
        </select>
      </div>

      {errors.root && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{errors.root.message}</p>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
