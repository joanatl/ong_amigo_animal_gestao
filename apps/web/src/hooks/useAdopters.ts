import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  AdopterResponse,
  CreateAdopterInput,
  UpdateAdopterInput,
  AdopterQuery,
  ManageAdopterAnimalInput,
  UpdateAdopterAnimalInput,
} from '@amigo-animal/shared'

interface PaginatedAdopters {
  data: AdopterResponse[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export function useAdopters(params?: Partial<AdopterQuery>) {
  return useQuery({
    queryKey: ['adopters', params],
    queryFn: async () => {
      const res = await api.get<PaginatedAdopters>('/adopters', { params })
      return res.data
    },
  })
}

export function useAdopter(id: string) {
  return useQuery({
    queryKey: ['adopters', id],
    queryFn: async () => {
      const res = await api.get<AdopterResponse>(`/adopters/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateAdopter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateAdopterInput) => {
      const res = await api.post<AdopterResponse>('/adopters', data)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adopters'] }),
  })
}

export function useUpdateAdopter(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateAdopterInput) => {
      const res = await api.patch<AdopterResponse>(`/adopters/${id}`, data)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adopters'] }),
  })
}

export function useDeleteAdopter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/adopters/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adopters'] }),
  })
}

export function useAddAdopterAnimal(adopterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ManageAdopterAnimalInput) => {
      const res = await api.post<AdopterResponse>(`/adopters/${adopterId}/animals`, data)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adopters', adopterId] }),
  })
}

export function useUpdateAdopterAnimal(adopterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ animalId, ...data }: UpdateAdopterAnimalInput & { animalId: string }) => {
      const res = await api.patch<AdopterResponse>(
        `/adopters/${adopterId}/animals/${animalId}`,
        data,
      )
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adopters', adopterId] }),
  })
}

export function useRemoveAdopterAnimal(adopterId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (animalId: string) => {
      const res = await api.delete<AdopterResponse>(
        `/adopters/${adopterId}/animals/${animalId}`,
      )
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adopters', adopterId] }),
  })
}
