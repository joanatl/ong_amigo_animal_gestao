'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, MapPin, Mail, Phone, Paperclip, Pencil, Trash2 } from 'lucide-react'
import { useAdopter, useDeleteAdopter } from '@/hooks/useAdopters'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { AdopterAnimalsManager } from '@/components/adopters/AdopterAnimalsManager'
import { mapsUrl } from '@/lib/maps'

function attachmentName(key: string) {
  return key.split('/').pop() ?? key
}

function attachmentUrl(key: string) {
  return `${process.env.NEXT_PUBLIC_MINIO_URL}/${key}`
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-gray-100 last:border-0">
      <span className="w-28 shrink-0 text-xs font-medium text-gray-400 uppercase tracking-wide pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}

export default function AdopterDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: adopter, isLoading, isError } = useAdopter(params.id)
  const deleteMutation = useDeleteAdopter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  if (isError || !adopter) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600">Adotante não encontrado.</p>
        <Link href="/adopters" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Voltar para a lista
        </Link>
      </div>
    )
  }

  const canEdit = !!user

  const handleDelete = async () => {
    if (!confirm(`Excluir ${adopter.name}? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteMutation.mutateAsync(adopter.id)
      toast('Adotante excluído com sucesso!')
      router.push('/adopters')
    } catch {
      toast('Não foi possível excluir o adotante.', 'error')
    }
  }

  const displayName = adopter.name.charAt(0).toUpperCase() + adopter.name.slice(1)

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Cabeçalho com foto */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden bg-brand-50 border border-gray-200">
              {adopter.photoUrl ? (
                <Image
                  src={adopter.photoUrl}
                  alt={adopter.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-8 w-8 text-brand-400" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
              <a
                href={mapsUrl(adopter.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {adopter.address}
              </a>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2 shrink-0">
              <Link
                href={`/adopters/${adopter.id}/edit`}
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

        <div className="px-6 py-4 space-y-4">
          {/* Dados de contato */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-1">
            {adopter.email && (
              <InfoRow
                label="E-mail"
                value={
                  <a href={`mailto:${adopter.email}`} className="text-brand-600 hover:underline">
                    {adopter.email}
                  </a>
                }
              />
            )}
            {adopter.phone && (
              <InfoRow
                label="Telefone"
                value={
                  <a href={`tel:${adopter.phone}`} className="text-brand-600 hover:underline">
                    {adopter.phone}
                  </a>
                }
              />
            )}
            <InfoRow
              label="Cadastrado em"
              value={new Date(adopter.createdAt).toLocaleDateString('pt-BR')}
            />
          </div>

          {/* Animais adotados */}
          <AdopterAnimalsManager
            adopterId={adopter.id}
            animals={adopter.animals}
            canEdit={canEdit}
          />

          {/* Descrição */}
          {adopter.description && (
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">Descrição</p>
              <p className="whitespace-pre-line text-sm text-gray-700">{adopter.description}</p>
            </div>
          )}

          {/* Anexos */}
          {adopter.attachmentKeys && adopter.attachmentKeys.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Anexos</p>
              <ul className="space-y-1.5">
                {adopter.attachmentKeys.map((key) => (
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
