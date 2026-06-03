'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Plus, Users, Search } from 'lucide-react'
import { useAdopters, useDeleteAdopter } from '@/hooks/useAdopters'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AdopterCard } from '@/components/adopters/AdopterCard'

export default function AdoptersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { data, isLoading, isError } = useAdopters(debouncedSearch ? { search: debouncedSearch } : {})
  const deleteMutation = useDeleteAdopter()

  const handleSearch = (value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedSearch(value), 350)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este adotante?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast('Adotante excluído com sucesso!')
    } catch {
      toast('Não foi possível excluir o adotante.', 'error')
    }
  }

  const canDelete = () => !!user

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Adotantes</h1>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">
              {data.meta.total} {data.meta.total === 1 ? 'adotante cadastrado' : 'adotantes cadastrados'}
            </p>
          )}
        </div>
        {user && (
          <Link href="/adopters/new" className="btn-primary rounded-xl px-4 py-2.5 text-sm">
            <Plus className="h-4 w-4" /> Novo adotante
          </Link>
        )}
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-700 shadow-card placeholder:text-gray-400 transition-colors hover:border-brand-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {isError && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Não foi possível carregar os adotantes. Tente novamente.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
            <Users className="h-7 w-7 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-600">Nenhum adotante encontrado</p>
          <p className="mt-1 text-sm text-gray-400">
            {search ? 'Tente ajustar a busca.' : 'Cadastre o primeiro adotante.'}
          </p>
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.data.map((adopter) => (
            <AdopterCard
              key={adopter.id}
              adopter={adopter}
              showActions={!!user}
              onDelete={canDelete() ? () => handleDelete(adopter.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
