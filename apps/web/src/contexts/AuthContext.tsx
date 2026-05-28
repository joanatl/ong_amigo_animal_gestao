'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import { api, setAccessToken, clearAccessToken } from '@/lib/api'
import type { UserResponse, LoginInput, RegisterInput } from '@amigo-animal/shared'

interface AuthContextValue {
  user: UserResponse | null
  isLoading: boolean
  login: (data: LoginInput) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const didInit = useRef(false)

  // Ao montar, tenta recuperar sessão via silent refresh
  // A ref evita dupla chamada no React 18 Strict Mode
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    api
      .post<{ accessToken: string }>('/auth/refresh')
      .then(async (res) => {
        setAccessToken(res.data.accessToken)
        const me = await api.get<UserResponse>('/auth/me')
        setUser(me.data)
      })
      .catch(() => {
        // Sem sessão ativa — ok
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (data: LoginInput) => {
    const res = await api.post<{ user: UserResponse; accessToken: string }>('/auth/login', data)
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
  }, [])

  const register = useCallback(async (data: RegisterInput) => {
    const res = await api.post<{ user: UserResponse; accessToken: string }>('/auth/register', data)
    setAccessToken(res.data.accessToken)
    setUser(res.data.user)
  }, [])

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {})
    clearAccessToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
