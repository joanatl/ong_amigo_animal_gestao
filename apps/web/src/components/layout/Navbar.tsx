'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, PawPrint, ChevronDown, User, LogOut, Heart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const isActive = (href: string) => pathname.startsWith(href)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { href: '/animals', label: 'Animais' },
    { href: '/adopters', label: 'Adotantes' },
    { href: '/events', label: 'Eventos' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow-brand-sm">
            <PawPrint className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold tracking-tight text-gray-900">
            Amigo <span className="text-brand-600">Animal</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                isActive(href)
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {label}
              {isActive(href) && (
                <span className="absolute bottom-1 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-brand-500" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100">
                  <User className="h-3.5 w-3.5 text-brand-700" />
                </div>
                <div className="text-left leading-tight">
                  <p className="font-semibold text-gray-800 text-xs">{user.name}</p>
                  {user.role === 'admin' && (
                    <p className="text-[10px] text-brand-600 font-medium">Admin</p>
                  )}
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 animate-scale-in rounded-xl border border-gray-100 bg-white py-1.5 shadow-card-hover">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    Meus dados
                  </Link>
                  <div className="my-1 mx-3 border-t border-gray-100" />
                  <button
                    onClick={() => { logout(); setProfileOpen(false) }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="btn-primary rounded-xl px-4 py-2 text-sm"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 animate-fade-up">
          <nav className="space-y-1 mb-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-100 pt-4">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100">
                    <User className="h-4 w-4 text-brand-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    {user.role === 'admin' && (
                      <p className="text-xs text-brand-600">Admin</p>
                    )}
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4 text-gray-400" />
                  Meus dados
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn-secondary w-full justify-center rounded-xl py-2.5 text-sm"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary w-full justify-center rounded-xl py-2.5 text-sm"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
