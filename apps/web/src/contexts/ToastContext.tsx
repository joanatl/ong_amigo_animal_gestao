'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import * as RadixToast from '@radix-ui/react-toast'

interface ToastContextValue {
  toast: (message: string, variant?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [variant, setVariant] = useState<'success' | 'error'>('success')

  const toast = useCallback((msg: string, v: 'success' | 'error' = 'success') => {
    setMessage(msg)
    setVariant(v)
    setOpen(false)
    // Pequeno delay para permitir re-animação caso já estivesse aberto
    requestAnimationFrame(() => setOpen(true))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right" duration={3500}>
        {children}
        <RadixToast.Root
          open={open}
          onOpenChange={setOpen}
          className={`
            fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg
            data-[state=open]:animate-slide-in data-[state=closed]:animate-fade-out
            ${variant === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
          `}
        >
          <RadixToast.Description className="text-sm font-medium">
            {message}
          </RadixToast.Description>
          <RadixToast.Close className="ml-2 rounded p-0.5 opacity-70 hover:opacity-100">
            ✕
          </RadixToast.Close>
        </RadixToast.Root>
        <RadixToast.Viewport />
      </RadixToast.Provider>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}
