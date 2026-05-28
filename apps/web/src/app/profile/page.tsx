'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { api } from '@/lib/api'

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [passwordOpen, setPasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    if (!user) router.replace('/login')
  }, [user, router])

  if (!user) return null

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast('As senhas não coincidem', 'error')
      return
    }
    setPasswordLoading(true)
    try {
      await api.patch('/auth/password', { currentPassword, newPassword })
      toast('Senha alterada com sucesso', 'success')
      setPasswordOpen(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao alterar senha'
      toast(msg, 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <main className="container mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Meus dados</h1>

      {/* Dados de acesso */}
      <section className="mb-6 rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Dados de acesso
          </h2>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <Mail className="h-4 w-4 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400">E-mail</p>
            <p className="truncate text-sm font-medium text-gray-800">{user.email}</p>
          </div>
        </div>

        {/* Senha */}
        <div className="px-6 py-4">
          <button
            onClick={() => setPasswordOpen((o) => !o)}
            className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Lock className="h-4 w-4" />
            {passwordOpen ? 'Cancelar troca de senha' : 'Trocar senha'}
          </button>

          {passwordOpen && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
              <PasswordField
                label="Senha atual"
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrent}
                onToggleShow={() => setShowCurrent((v) => !v)}
                autoComplete="current-password"
              />
              <PasswordField
                label="Nova senha"
                value={newPassword}
                onChange={setNewPassword}
                show={showNew}
                onToggleShow={() => setShowNew((v) => !v)}
                autoComplete="new-password"
              />
              <PasswordField
                label="Confirmar nova senha"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showNew}
                onToggleShow={() => setShowNew((v) => !v)}
                autoComplete="new-password"
              />
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full rounded-md bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {passwordLoading ? 'Salvando…' : 'Salvar nova senha'}
              </button>
            </form>
          )}
        </div>
      </section>

    </main>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggleShow: () => void
  autoComplete: string
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-gray-500">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggleShow}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
