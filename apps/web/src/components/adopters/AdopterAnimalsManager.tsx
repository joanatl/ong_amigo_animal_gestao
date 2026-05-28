'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Check, X, MapPin } from 'lucide-react'
import { mapsUrl } from '@/lib/maps'
import type { AdopterAnimalResponse } from '@amigo-animal/shared'
import { useAnimals } from '@/hooks/useAnimals'
import {
  useAddAdopterAnimal,
  useUpdateAdopterAnimal,
  useRemoveAdopterAnimal,
} from '@/hooks/useAdopters'
import { useToast } from '@/contexts/ToastContext'
import { AnimalPicker } from './AnimalPicker'

interface Props {
  adopterId: string
  animals: AdopterAnimalResponse[]
  canEdit: boolean
}

interface EditState {
  animalId: string
  adoptionDate: string
  adoptionLocation: string
}

export function AdopterAnimalsManager({ adopterId, animals, canEdit }: Props) {
  const { toast } = useToast()
  const { data: allAnimals } = useAnimals({ limit: 50 })
  const addMutation = useAddAdopterAnimal(adopterId)
  const updateMutation = useUpdateAdopterAnimal(adopterId)
  const removeMutation = useRemoveAdopterAnimal(adopterId)

  const [showPicker, setShowPicker] = useState(false)
  const [pickerAnimalId, setPickerAnimalId] = useState<string | null>(null)
  const [pickerDate, setPickerDate] = useState('')
  const [pickerLocation, setPickerLocation] = useState('')
  const [editState, setEditState] = useState<EditState | null>(null)

  const linkedIds = animals.map((a) => a.id)
  const availableAnimals = (allAnimals?.data ?? []).filter((a) => !linkedIds.includes(a.id))

  async function handleAdd() {
    if (!pickerAnimalId || !pickerDate) {
      toast('Selecione um animal e a data de adoção.', 'error')
      return
    }
    try {
      await addMutation.mutateAsync({
        animalId: pickerAnimalId,
        adoptionDate: pickerDate,
        adoptionLocation: pickerLocation || undefined,
      })
      toast('Animal vinculado com sucesso!')
      setShowPicker(false)
      setPickerAnimalId(null)
      setPickerDate('')
      setPickerLocation('')
    } catch {
      toast('Não foi possível vincular o animal.', 'error')
    }
  }

  async function handleUpdate() {
    if (!editState) return
    try {
      await updateMutation.mutateAsync({
        animalId: editState.animalId,
        adoptionDate: editState.adoptionDate,
        adoptionLocation: editState.adoptionLocation || undefined,
      })
      toast('Vínculo atualizado!')
      setEditState(null)
    } catch {
      toast('Não foi possível atualizar o vínculo.', 'error')
    }
  }

  async function handleRemove(animalId: string, animalName: string) {
    if (!confirm(`Remover ${animalName} deste adotante?`)) return
    try {
      await removeMutation.mutateAsync(animalId)
      toast('Animal removido.')
    } catch {
      toast('Não foi possível remover o animal.', 'error')
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {animals.length === 1 ? 'Animal adotado' : 'Animais adotados'}
          {animals.length > 0 && ` (${animals.length})`}
        </p>
        {canEdit && (
          <button
            onClick={() => setShowPicker((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar animal
          </button>
        )}
      </div>

      {/* Painel de adição */}
      {showPicker && canEdit && (
        <div className="mb-3 rounded-xl border border-brand-200 bg-brand-50 p-4 space-y-3">
          <p className="text-xs font-medium text-brand-700">Vincular animal</p>

          <AnimalPicker
            animals={availableAnimals}
            selectedIds={pickerAnimalId ? [pickerAnimalId] : []}
            onChange={(ids) => setPickerAnimalId(ids[ids.length - 1] ?? null)}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data de adoção *</label>
              <input
                type="date"
                value={pickerDate}
                onChange={(e) => setPickerDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Local de adoção</label>
              <input
                type="text"
                value={pickerLocation}
                onChange={(e) => setPickerLocation(e.target.value)}
                placeholder="Ex: Feira de adoção"
                maxLength={200}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowPicker(false)
                setPickerAnimalId(null)
                setPickerDate('')
                setPickerLocation('')
              }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdd}
              disabled={addMutation.isPending}
              className="flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {addMutation.isPending ? 'Salvando…' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de animais */}
      {animals.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">Nenhum animal vinculado.</p>
      ) : (
        <div className="space-y-2">
          {animals.map((animal) => {
            const isEditing = editState?.animalId === animal.id
            const displayName = animal.name.charAt(0).toUpperCase() + animal.name.slice(1)

            return (
              <div
                key={animal.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-3"
              >
                {isEditing ? (
                  /* Modo edição inline */
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative h-8 w-8 shrink-0 rounded-lg overflow-hidden bg-brand-100">
                        {animal.photoUrl ? (
                          <Image src={animal.photoUrl} alt={animal.name} fill className="object-cover" sizes="32px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm">🐾</div>
                        )}
                      </div>
                      <p className="font-medium text-sm text-gray-800">{displayName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Data de adoção</label>
                        <input
                          type="date"
                          value={editState.adoptionDate}
                          onChange={(e) =>
                            setEditState((s) => s && { ...s, adoptionDate: e.target.value })
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Local de adoção</label>
                        <input
                          type="text"
                          value={editState.adoptionLocation}
                          onChange={(e) =>
                            setEditState((s) => s && { ...s, adoptionLocation: e.target.value })
                          }
                          placeholder="Ex: Feira de adoção"
                          maxLength={200}
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 mt-1">
                      <button
                        onClick={() => setEditState(null)}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100"
                      >
                        <X className="h-3 w-3" /> Cancelar
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" />
                        {updateMutation.isPending ? 'Salvando…' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Modo exibição */
                  <div className="flex items-center gap-3">
                    <Link href={`/animals/${animal.id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80">
                      <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-brand-100">
                        {animal.photoUrl ? (
                          <Image src={animal.photoUrl} alt={animal.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl">🐾</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800">{displayName}</p>
                        {animal.breed && <p className="text-xs text-gray-400">{animal.breed}</p>}
                        <p className="text-xs text-gray-400">
                          Adotado em{' '}
                          {new Date(animal.adoptionDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        {animal.adoptionLocation && (
                          <a
                            href={mapsUrl(animal.adoptionLocation)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600"
                          >
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{animal.adoptionLocation}</span>
                          </a>
                        )}
                      </div>
                    </Link>

                    {canEdit && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() =>
                            setEditState({
                              animalId: animal.id,
                              adoptionDate: animal.adoptionDate,
                              adoptionLocation: animal.adoptionLocation ?? '',
                            })
                          }
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-brand-300 hover:text-brand-600"
                          title="Editar vínculo"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(animal.id, animal.name)}
                          disabled={removeMutation.isPending}
                          className="rounded-lg border border-red-100 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Remover vínculo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
