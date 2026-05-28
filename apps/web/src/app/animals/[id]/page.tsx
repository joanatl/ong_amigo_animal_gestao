'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Dog, Cat, PawPrint, Paperclip, Pencil, Trash2, MapPin } from 'lucide-react'
import { useAnimal, useDeleteAnimal } from '@/hooks/useAnimals'
import { mapsUrl } from '@/lib/maps'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

const STATUS_LABEL: Record<string, string> = {
  available: 'Disponível',
  adopted: 'Adotado',
  under_treatment: 'Em tratamento',
}
const STATUS_COLOR: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  adopted: 'bg-blue-100 text-blue-700',
  under_treatment: 'bg-amber-100 text-amber-700',
}
const SPECIES_LABEL: Record<string, string> = { dog: 'Cachorro', cat: 'Gato', other: 'Outro' }
const SIZE_LABEL: Record<string, string> = { small: 'Pequeno', medium: 'Médio', large: 'Grande' }

function SpeciesIcon({ species }: { species: string }) {
  const cls = 'h-24 w-24 text-brand-300'
  if (species === 'dog') return <Dog className={cls} />
  if (species === 'cat') return <Cat className={cls} />
  return <PawPrint className={cls} />
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-gray-100 last:border-0">
      <span className="w-36 shrink-0 text-xs font-medium text-gray-400 uppercase tracking-wide pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}

function attachmentName(key: string) {
  return key.split('/').pop() ?? key
}

function attachmentUrl(key: string) {
  return `${process.env.NEXT_PUBLIC_MINIO_URL}/${key}`
}

export default function AnimalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: animal, isLoading, isError } = useAnimal(params.id)
  const deleteMutation = useDeleteAnimal()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  if (isError || !animal) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600">Animal não encontrado.</p>
        <Link href="/animals" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Voltar para a lista
        </Link>
      </div>
    )
  }

  const canEdit = !!user && (user.role === 'admin' || user.id === animal.createdBy)

  const handleDelete = async () => {
    if (!confirm(`Excluir ${animal.name}? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteMutation.mutateAsync(animal.id)
      toast('Animal excluído com sucesso!')
      router.push('/animals')
    } catch {
      toast('Não foi possível excluir o animal.', 'error')
    }
  }

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
    <div className="mx-auto max-w-2xl">
      {/* Voltar */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Foto */}
        <div className="relative h-64 w-full sm:h-80">
          {animal.photoUrl ? (
            <Image
              src={animal.photoUrl}
              alt={animal.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
              <SpeciesIcon species={animal.species} />
            </div>
          )}
          <span
            className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow ${STATUS_COLOR[animal.status]}`}
          >
            {STATUS_LABEL[animal.status]}
          </span>
        </div>

        {/* Cabeçalho */}
        <div className="flex items-start justify-between px-6 pt-5 pb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {SPECIES_LABEL[animal.species]}
              {animal.breed ? ` · ${animal.breed}` : ''} · {ageLabel}
            </p>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <Link
                href={`/animals/${animal.id}/edit`}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            </div>
          )}
        </div>

        {/* Dados */}
        <div className="px-6 pb-6 pt-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-1">
            {animal.size && (
              <InfoRow label="Porte" value={SIZE_LABEL[animal.size]} />
            )}
            {animal.weightKg != null && (
              <InfoRow label="Peso" value={`${animal.weightKg} kg`} />
            )}
            {animal.color && (
              <InfoRow label="Cor" value={animal.color} />
            )}
            {animal.fosterHome && (
              <InfoRow
                label="Lar temporário"
                value={
                  <a
                    href={mapsUrl(animal.fosterHome)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brand-600 hover:underline"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {animal.fosterHome}
                  </a>
                }
              />
            )}
            <InfoRow
              label="Data de entrada"
              value={new Date(animal.entryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            />
          </div>

          {animal.description && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">Descrição</p>
              <p className="whitespace-pre-line text-sm text-gray-700">{animal.description}</p>
            </div>
          )}

          {animal.attachmentKeys && animal.attachmentKeys.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Anexos</p>
              <ul className="space-y-1.5">
                {animal.attachmentKeys.map((key) => (
                  <li key={key}>
                    <a
                      href={attachmentUrl(key)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-brand-600 hover:border-brand-300 hover:bg-brand-50"
                    >
                      <Paperclip className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="truncate">{attachmentName(key)}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
