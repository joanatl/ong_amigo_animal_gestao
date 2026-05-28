'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@amigo-animal/shared'
import { useAuth } from '@/contexts/AuthContext'
import { PawPrint } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data)
      router.push('/animals')
    } catch {
      setError('root', { message: 'E-mail ou senha inválidos' })
    }
  }

  const inputClass =
    'mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-200'

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg">
            <PawPrint className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-gray-500">Entre na sua conta para continuar</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <input id="email" {...register('email')} type="email" className={inputClass} />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                {...register('password')}
                type="password"
                className={inputClass}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {errors.root && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Não tem conta?{' '}
          <Link href="/register" className="font-semibold text-brand-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
