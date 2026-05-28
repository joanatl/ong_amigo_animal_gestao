'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronDown, PawPrint, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useAnimals, useDeleteAnimal } from '@/hooks/useAnimals'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AnimalCard } from '@/components/animals/AnimalCard'
import type { AnimalQuery } from '@amigo-animal/shared'

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-xl border border-gray-200 bg-white pl-3 pr-8 text-sm font-medium text-gray-700 shadow-card transition-colors hover:border-brand-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
    </div>
  )
}

export default function AnimalsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [filters, setFilters] = useState<Partial<AnimalQuery>>({})
  const [search, setSearch] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { data, isLoading, isError } = useAnimals(filters)
  const deleteMutation = useDeleteAnimal()

  const handleSearch = (value: string) => {
    setSearch(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value || undefined }))
    }, 350)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este animal?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast('Animal excluído com sucesso!')
    } catch {
      toast('Não foi possível excluir o animal.', 'error')
    }
  }

  const canDelete = (createdBy: string | null) =>
    !!user && (user.role === 'admin' || user.id === createdBy)

  const hasActiveFilters = !!filters.status || !!filters.species || !!filters.search

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Animais</h1>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">
              {data.meta.total} {data.meta.total === 1 ? 'animal cadastrado' : 'animais cadastrados'}
            </p>
          )}
        </div>
        {user && (
          <Link
            href="/animals/new"
            className="btn-primary rounded-xl px-4 py-2.5 text-sm"
          >
            <Plus className="h-4 w-4" /> Novo animal
          </Link>
        )}
      </div>

      {/* Barra de busca + filtros */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {/* Campo de busca */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar por nome…"
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-700 shadow-card placeholder:text-gray-400 transition-colors hover:border-brand-300 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <FilterSelect
            value={filters.status ?? ''}
            onChange={(v) =>
              setFilters((f) => ({ ...f, status: (v as AnimalQuery['status']) || undefined }))
            }
          >
            <option value="">Todos os status</option>
            <option value="available">Disponível</option>
            <option value="adopted">Adotado</option>
            <option value="under_treatment">Em tratamento</option>
          </FilterSelect>

          <FilterSelect
            value={filters.species ?? ''}
            onChange={(v) =>
              setFilters((f) => ({ ...f, species: (v as AnimalQuery['species']) || undefined }))
            }
          >
            <option value="">Todas as espécies</option>
            <option value="dog">Cachorro</option>
            <option value="cat">Gato</option>
            <option value="other">Outro</option>
          </FilterSelect>

          {hasActiveFilters && (
            <button
              onClick={() => { setFilters({}); setSearch('') }}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-card transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {isError && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          Não foi possível carregar os animais. Tente novamente.
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600" />
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
            <PawPrint className="h-7 w-7 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-600">Nenhum animal encontrado</p>
          <p className="mt-1 text-sm text-gray-400">
            {hasActiveFilters ? 'Tente ajustar os filtros ou a busca.' : 'Cadastre o primeiro animal.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => { setFilters({}); setSearch('') }}
              className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.data.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              showActions={!!user}
              onDelete={canDelete(animal.createdBy) ? () => handleDelete(animal.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
