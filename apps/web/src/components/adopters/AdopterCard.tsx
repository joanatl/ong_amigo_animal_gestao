import Image from 'next/image'
import Link from 'next/link'
import { User, MapPin, Mail, Phone, PawPrint } from 'lucide-react'
import type { AdopterResponse } from '@amigo-animal/shared'
import { mapsUrl } from '@/lib/maps'

interface Props {
  adopter: AdopterResponse
  showActions?: boolean
  onDelete?: () => void
}

export function AdopterCard({ adopter, showActions, onDelete }: Props) {
  const displayName = adopter.name.charAt(0).toUpperCase() + adopter.name.slice(1)

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
      <Link href={`/adopters/${adopter.id}`} className="block p-5">
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-brand-50">
            {adopter.photoUrl ? (
              <Image
                src={adopter.photoUrl}
                alt={adopter.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-5.5 w-5.5 text-brand-400" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold leading-tight text-gray-900">{displayName}</h3>
            <a
              href={mapsUrl(adopter.address)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500 hover:text-brand-600"
            >
              <MapPin className="h-3 w-3 shrink-0" />
              {adopter.address}
            </a>
          </div>
        </div>

        {/* Contatos + animal */}
        <div className="mt-3.5 space-y-1.5">
          {adopter.email && (
            <p className="flex items-center gap-1.5 truncate text-xs text-gray-500">
              <Mail className="h-3.5 w-3.5 shrink-0 text-gray-300" />
              {adopter.email}
            </p>
          )}
          {adopter.phone && (
            <p className="flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="h-3.5 w-3.5 shrink-0 text-gray-300" />
              {adopter.phone}
            </p>
          )}
          {adopter.animals[0] && (
            <div className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-2 py-1">
              <PawPrint className="h-3 w-3 shrink-0 text-brand-500" />
              <span className="truncate text-xs font-medium text-brand-700">
                {adopter.animals[0].name.charAt(0).toUpperCase() + adopter.animals[0].name.slice(1)}
              </span>
            </div>
          )}
        </div>
      </Link>

      {showActions && (
        <div className="mt-auto flex gap-2 px-5 pb-5">
          <Link
            href={`/adopters/${adopter.id}/edit`}
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
