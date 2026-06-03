'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAdopterSchema, type CreateAdopterInput } from '@amigo-animal/shared'
import { Paperclip, X } from 'lucide-react'
import { uploadAdopterPhoto, uploadAttachment } from '@/hooks/useUpload'
import { useAnimals } from '@/hooks/useAnimals'
import { AnimalPicker } from './AnimalPicker'
import { DateInput } from '@/components/ui/DateInput'

interface AttachmentItem {
  file: File
  key?: string
  uploading: boolean
  error?: string
}

interface Props {
  defaultValues?: Partial<CreateAdopterInput>
  onSubmit: (data: CreateAdopterInput) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function AdopterForm({ defaultValues, onSubmit, isLoading, onCancel }: Props) {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const attachInputRef = useRef<HTMLInputElement>(null)

  const { data: animalsData } = useAnimals({ limit: 500 })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateAdopterInput>({
    resolver: zodResolver(createAdopterSchema),
    defaultValues: {
      attachmentKeys: [],
      animals: [],
      ...defaultValues,
    },
  })

  const animalFields = watch('animals') ?? []
  const selectedAnimalIds = animalFields.map((a) => a.animalId)

  const handleAnimalIdsChange = (ids: string[]) => {
    const current = watch('animals') ?? []
    const next = ids.map((id) => {
      const existing = current.find((a) => a.animalId === id)
      return existing ?? { animalId: id, adoptionDate: '', adoptionLocation: '' }
    })
    setValue('animals', next)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleAttachmentAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''

    const newItems: AttachmentItem[] = files.map((file) => ({ file, uploading: true }))
    setAttachments((prev) => [...prev, ...newItems])

    const uploaded = await Promise.all(
      files.map(async (file, i) => {
        try {
          const key = await uploadAttachment(file)
          return { index: i, key }
        } catch {
          return { index: i, key: null }
        }
      }),
    )

    setAttachments((prev) => {
      const next = [...prev]
      const startIdx = next.length - files.length
      uploaded.forEach(({ index, key }) => {
        next[startIdx + index] = {
          ...next[startIdx + index],
          uploading: false,
          key: key ?? undefined,
          error: key ? undefined : 'Falha no upload',
        }
      })
      setValue('attachmentKeys', next.filter((a) => a.key).map((a) => a.key!))
      return next
    })
  }

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      setValue('attachmentKeys', next.filter((a) => a.key).map((a) => a.key!))
      return next
    })
  }

  const handleFormSubmit = async (data: CreateAdopterInput) => {
    try {
      if (photoFile) {
        setUploadingPhoto(true)
        const objectKey = await uploadAdopterPhoto(photoFile)
        setValue('photoKey', objectKey)
        data.photoKey = objectKey
        setUploadingPhoto(false)
      }
      data.attachmentKeys = attachments.filter((a) => a.key).map((a) => a.key!)
      await onSubmit(data)
    } catch (err: unknown) {
      setUploadingPhoto(false)
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Erro ao salvar adotante'
      setError('root', { message: msg })
    }
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Foto */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Foto</label>
        <div className="mt-1 flex items-center gap-4">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="h-20 w-20 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xs text-center">
              sem foto
            </div>
          )}
          <label className="cursor-pointer rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">
            Escolher foto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome *</label>
        <input id="name" {...register('name')} type="text" className={inputClass} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço *</label>
        <input id="address" {...register('address')} type="text" placeholder="Rua, número, bairro, cidade" className={inputClass} />
        {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail <span className="text-gray-400">(opcional)</span>
          </label>
          <input id="email" {...register('email')} type="email" className={inputClass} />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefone <span className="text-gray-400">(opcional)</span>
          </label>
          <input id="phone" {...register('phone')} type="tel" placeholder="(00) 00000-0000" className={inputClass} />
        </div>
      </div>

      {/* Animais adotados */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Animais adotados <span className="text-gray-400">(opcional)</span>
        </label>
        <AnimalPicker
          animals={animalsData?.data ?? []}
          selectedIds={selectedAnimalIds}
          onChange={handleAnimalIdsChange}
        />

        {/* Datas de adoção por animal */}
        {animalFields.length > 0 && (
          <ul className="mt-3 space-y-2">
            {animalFields.map((af, idx) => {
              const animal = animalsData?.data.find((a) => a.id === af.animalId)
              const displayName = animal
                ? animal.name.charAt(0).toUpperCase() + animal.name.slice(1)
                : af.animalId
              return (
                <li
                  key={af.animalId}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 space-y-2"
                >
                  <span className="block text-sm font-medium text-gray-800 truncate">
                    {displayName}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Data de adoção *</label>
                      <DateInput
                        value={af.adoptionDate}
                        onChange={(iso) => {
                          const next = [...animalFields]
                          next[idx] = { ...next[idx], adoptionDate: iso }
                          setValue('animals', next)
                        }}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Local de adoção</label>
                      <input
                        type="text"
                        value={af.adoptionLocation ?? ''}
                        onChange={(e) => {
                          const next = [...animalFields]
                          next[idx] = { ...next[idx], adoptionLocation: e.target.value }
                          setValue('animals', next)
                        }}
                        placeholder="Ex: Feira de adoção"
                        maxLength={200}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Descrição + clip de anexos */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
          <button
            type="button"
            onClick={() => attachInputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Anexar arquivo
          </button>
          <input
            ref={attachInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.txt"
            onChange={handleAttachmentAdd}
            className="hidden"
          />
        </div>
        <textarea id="description" {...register('description')} rows={3} className={inputClass} />

        {attachments.length > 0 && (
          <ul className="mt-2 space-y-1">
            {attachments.map((a, i) => (
              <li key={i} className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700">
                <Paperclip className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="flex-1 truncate">{a.file.name}</span>
                {a.uploading && <span className="text-gray-400">Enviando…</span>}
                {a.error && <span className="text-red-500">{a.error}</span>}
                {!a.uploading && !a.error && <span className="text-green-600">OK</span>}
                <button type="button" onClick={() => removeAttachment(i)} className="ml-1 text-gray-400 hover:text-red-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {errors.root && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{errors.root.message}</p>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || uploadingPhoto || attachments.some((a) => a.uploading)}
          className="flex-1 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {uploadingPhoto ? 'Enviando foto...' : isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
