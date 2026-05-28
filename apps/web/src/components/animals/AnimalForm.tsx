'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { DateInput } from '@/components/ui/DateInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { createAnimalSchema, animalSizeEnum, type CreateAnimalInput } from '@amigo-animal/shared'
import { z } from 'zod'
import { Paperclip, X } from 'lucide-react'
import { uploadAnimalPhoto, uploadAttachment } from '@/hooks/useUpload'

const animalFormSchema = createAnimalSchema.extend({
  size: z.preprocess((v) => (v === '' ? undefined : v), animalSizeEnum.optional()),
  weightKg: z.preprocess(
    (v) => (v === '' || v === null ? undefined : Number(v)),
    z.number().positive('Peso deve ser maior que zero').max(200).optional(),
  ),
})

interface AttachmentItem {
  file: File
  key?: string
  uploading: boolean
  error?: string
}

interface Props {
  defaultValues?: Partial<CreateAnimalInput>
  onSubmit: (data: CreateAnimalInput) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
}

export function AnimalForm({ defaultValues, onSubmit, isLoading, onCancel }: Props) {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<AttachmentItem[]>([])
  const attachInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateAnimalInput>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      species: 'dog',
      status: 'available',
      entryDate: new Date().toISOString().slice(0, 10),
      attachmentKeys: [],
      ...defaultValues,
    },
  })

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
      const keys = next.filter((a) => a.key).map((a) => a.key!)
      setValue('attachmentKeys', keys)
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

  const handleFormSubmit = async (data: CreateAnimalInput) => {
    try {
      if (photoFile) {
        setUploadingPhoto(true)
        const objectKey = await uploadAnimalPhoto(photoFile)
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
        'Erro ao salvar animal'
      setError('root', { message: msg })
    }
  }

  const inputClass =
    'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome *</label>
        <input id="name" {...register('name')} type="text" className={inputClass} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Data de nascimento *</label>
          <DateInput
            id="birthDate"
            value={watch('birthDate') ?? ''}
            onChange={(iso) => setValue('birthDate', iso, { shouldValidate: true })}
            className={inputClass}
          />
          {errors.birthDate && <p className="mt-1 text-xs text-red-600">{errors.birthDate.message}</p>}
        </div>

        <div>
          <label htmlFor="breed" className="block text-sm font-medium text-gray-700">Raça</label>
          <input id="breed" {...register('breed')} type="text" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="species" className="block text-sm font-medium text-gray-700">Espécie</label>
          <select id="species" {...register('species')} className={inputClass}>
            <option value="dog">Cachorro</option>
            <option value="cat">Gato</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-700">Porte</label>
          <select id="size" {...register('size')} className={inputClass}>
            <option value="">Não informado</option>
            <option value="small">Pequeno</option>
            <option value="medium">Médio</option>
            <option value="large">Grande</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700">Peso (kg)</label>
          <input id="weightKg" {...register('weightKg')} type="number" min={0} step={0.1} placeholder="Ex: 4.5" className={inputClass} />
          {errors.weightKg && <p className="mt-1 text-xs text-red-600">{errors.weightKg.message}</p>}
        </div>

        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">Cor</label>
          <input id="color" {...register('color')} type="text" placeholder="Ex: caramelo, preto e branco" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select id="status" {...register('status')} className={inputClass}>
            <option value="available">Disponível</option>
            <option value="adopted">Adotado</option>
            <option value="under_treatment">Em tratamento</option>
          </select>
        </div>

        <div>
          <label htmlFor="fosterHome" className="block text-sm font-medium text-gray-700">Lar temporário</label>
          <input id="fosterHome" {...register('fosterHome')} type="text" placeholder="Nome ou contato do responsável" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700">Data de entrada *</label>
        <DateInput
          id="entryDate"
          value={watch('entryDate') ?? ''}
          onChange={(iso) => setValue('entryDate', iso, { shouldValidate: true })}
          className={inputClass}
        />
        {errors.entryDate && <p className="mt-1 text-xs text-red-600">{errors.entryDate.message}</p>}
      </div>

      {/* Descrição + clip de anexos */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
          <button
            type="button"
            onClick={() => attachInputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600"
            title="Adicionar anexo"
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

      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700">Foto</label>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
          className="mt-1 text-sm text-gray-600"
        />
        {photoPreview && (
          <img src={photoPreview} alt="Preview" className="mt-2 h-32 w-32 rounded-md object-cover" />
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
