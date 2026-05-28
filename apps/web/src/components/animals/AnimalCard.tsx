import Image from 'next/image'
import Link from 'next/link'
import { Dog, Cat, PawPrint } from 'lucide-react'
import type { AnimalResponse } from '@amigo-animal/shared'

const STATUS_LABEL: Record<string, string> = {
  available:       'Disponível',
  adopted:         'Adotado',
  under_treatment: 'Em tratamento',
}

const STATUS_COLOR: Record<string, string> = {
  available:       'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  adopted:         'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  under_treatment: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
}

const SPECIES_LABEL: Record<string, string> = {
  dog: 'Cachorro',
  cat: 'Gato',
  other: 'Outro',
}

function SpeciesIcon({ species }: { species: string }) {
  const cls = 'h-16 w-16 text-brand-200'
  if (species === 'dog') return <Dog className={cls} />
  if (species === 'cat') return <Cat className={cls} />
  return <PawPrint className={cls} />
}

interface Props {
  animal: Pick<AnimalResponse, 'id' | 'name' | 'breed' | 'birthDate' | 'species' | 'status' | 'photoUrl' | 'createdBy'>
  showActions?: boolean
  onDelete?: () => void
}

export function AnimalCard({ animal, showActions, onDelete }: Props) {
  const ageLabel = (() => {
    const birth = new Date(animal.birthDate)
    const now = new Date()
    const months =
      (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    if (months < 12) return `${months} ${months === 1 ? 'mês' : 'meses'}`
    const years = Math.floor(months / 12)
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  })()

  const displayName = animal.name.charAt(0).toUpperCase() + animal.name.slice(1)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
      <Link href={`/animals/${animal.id}`} className="block">
        {/* Imagem */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
          {animal.photoUrl ? (
            <Image
              src={animal.photoUrl}
              alt={animal.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <SpeciesIcon species={animal.species} />
            </div>
          )}

          {/* Badge de status */}
          <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[animal.status]}`}>
            {STATUS_LABEL[animal.status]}
          </span>
        </div>

        {/* Conteúdo */}
        <div className="px-4 pt-3.5 pb-3">
          <h3 className="font-semibold text-gray-900 leading-tight">{displayName}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {SPECIES_LABEL[animal.species]}
            {animal.breed ? ` · ${animal.breed}` : ''} · {ageLabel}
          </p>
        </div>
      </Link>

      {/* Ações */}
      {showActions && (
        <div className="mt-auto flex gap-2 px-4 pb-4">
          <Link
            href={`/animals/${animal.id}/edit`}
            className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-center text-xs font-semibold text-gray-600 transition-all hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
          >
            Editar
          </Link>
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded-xl border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 transition-all hover:bg-red-50 hover:text-red-700"
            >
              Excluir
            </button>
          )}
        </div>
      )}
    </div>
  )
}
