import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  EventResponse,
  CreateEventInput,
  UpdateEventInput,
  EventQuery,
} from '@amigo-animal/shared'

interface PaginatedEvents {
  data: EventResponse[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export function useEvents(params?: Partial<EventQuery>) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      const res = await api.get<PaginatedEvents>('/events', { params })
      return res.data
    },
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const res = await api.get<EventResponse>(`/events/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateEventInput) => {
      const res = await api.post<EventResponse>('/events', data)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateEventInput) => {
      const res = await api.patch<EventResponse>(`/events/${id}`, data)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] }),
  })
}
