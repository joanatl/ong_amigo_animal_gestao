import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AnimalResponse,
  CreateAnimalInput,
  UpdateAnimalInput,
  AnimalQuery,
} from '@amigo-animal/shared'

interface PaginatedAnimals {
  data: AnimalResponse[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export function useAnimals(params?: Partial<AnimalQuery>) {
  return useQuery({
    queryKey: ['animals', params],
    queryFn: async () => {
      const res = await api.get<PaginatedAnimals>('/animals', { params })
      return res.data
    },
  })
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ['animals', id],
    queryFn: async () => {
      const res = await api.get<AnimalResponse>(`/animals/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateAnimal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateAnimalInput) => {
      const res = await api.post<AnimalResponse>('/animals', data)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['animals'] }),
  })
}

export function useUpdateAnimal(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateAnimalInput) => {
      const res = await api.patch<AnimalResponse>(`/animals/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['animals'] })
    },
  })
}

export function useDeleteAnimal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/animals/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['animals'] }),
  })
}
