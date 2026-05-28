'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Search, X, Check, Dog, Cat, PawPrint, ChevronDown, ChevronUp } from 'lucide-react'
import type { AnimalResponse } from '@amigo-animal/shared'

type AnimalOption = Pick<AnimalResponse, 'id' | 'name' | 'breed' | 'species' | 'photoUrl'>

interface Props {
  animals: AnimalOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

function SpeciesIcon({ species }: { species: string }) {
  const cls = 'h-8 w-8 text-brand-300'
  if (species === 'dog') return <Dog className={cls} />
  if (species === 'cat') return <Cat className={cls} />
  return <PawPrint className={cls} />
}

export function AnimalPicker({ animals, selectedIds, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return animals
    return animals.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.breed?.toLowerCase().includes(q) ?? false),
    )
  }, [animals, search])

  const selectedAnimals = useMemo(
    () => animals.filter((a) => selectedIds.includes(a.id)),
    [animals, selectedIds],
  )

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((sid) => sid !== id)
        : [...selectedIds, id],
    )
  }

  return (
    <div>
      {/* Botão trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-1 flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <span className={selectedIds.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
          {selectedIds.length === 0
            ? 'Selecionar animais…'
            : `${selectedIds.length} animal${selectedIds.length > 1 ? 'is' : ''} selecionado${selectedIds.length > 1 ? 's' : ''}`}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </button>

      {/* Chips dos selecionados */}
      {selectedAnimals.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedAnimals.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
            >
              {a.name.charAt(0).toUpperCase() + a.name.slice(1)}
              <button
                type="button"
                onClick={() => toggle(a.id)}
                className="ml-0.5 text-brand-400 hover:text-brand-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Painel de seleção */}
      {open && (
        <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Busca */}
          <div className="border-b border-gray-100 p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou raça…"
                className="w-full rounded-md border border-gray-200 py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                autoFocus
              />
            </div>
          </div>

          {/* Grid de cards */}
          <div className="max-h-72 overflow-y-auto p-3">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">Nenhum animal encontrado</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {filtered.map((animal) => {
                  const selected = selectedIds.includes(animal.id)
                  const displayName =
                    animal.name.charAt(0).toUpperCase() + animal.name.slice(1)
                  return (
                    <button
                      key={animal.id}
                      type="button"
                      onClick={() => toggle(animal.id)}
                      className={`relative flex flex-col items-center rounded-xl border-2 p-2 text-center transition-all focus:outline-none ${
                        selected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                      }`}
                    >
                      {selected && (
                        <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm">
                          <Check className="h-3 w-3" />
                        </span>
                      )}

                      <div className="relative mb-1.5 h-16 w-16 overflow-hidden rounded-lg bg-brand-100">
                        {animal.photoUrl ? (
                          <Image
                            src={animal.photoUrl}
                            alt={animal.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <SpeciesIcon species={animal.species} />
                          </div>
                        )}
                      </div>

                      <p className="w-full truncate text-xs font-semibold text-gray-800">
                        {displayName}
                      </p>
                      {animal.breed && (
                        <p className="w-full truncate text-[10px] text-gray-400">{animal.breed}</p>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
            <span className="text-xs text-gray-400">
              {selectedIds.length} selecionado{selectedIds.length !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
