import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1'

// Rotas que NÃO devem acionar o silent refresh (são elas próprias de auth)
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Token em memória — nunca no localStorage
let accessToken: string | null = null
let refreshPromise: Promise<string> | null = null

export function setAccessToken(token: string) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
}

// Injeta o access token em cada requisição
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Silent refresh: se receber 401, tenta renovar o token uma vez
// — exceto nas rotas de autenticação (login/register/refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const url: string = originalRequest?.url ?? ''

    const isAuthRoute = AUTH_ROUTES.some((r) => url.includes(r))

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true

      if (!refreshPromise) {
        refreshPromise = api
          .post<{ accessToken: string }>('/auth/refresh')
          .then((res) => {
            setAccessToken(res.data.accessToken)
            return res.data.accessToken
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      try {
        const newToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch {
        clearAccessToken()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)
