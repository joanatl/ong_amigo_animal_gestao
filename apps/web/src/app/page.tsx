import Link from 'next/link'
import { PawPrint, ArrowRight, Heart, Calendar, Users } from 'lucide-react'
import { AnimalCard } from '@/components/animals/AnimalCard'
import type { AnimalResponse } from '@amigo-animal/shared'

async function getPublicAnimals() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/animals?status=available&limit=8`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) return { data: [], meta: { total: 0 } }
  return res.json()
}

const quickLinks = [
  {
    href: '/animals',
    icon: PawPrint,
    label: 'Animais',
    desc: 'Gerencie fichas e fotos',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    href: '/adopters',
    icon: Heart,
    label: 'Adotantes',
    desc: 'Cadastre e acompanhe',
    color: 'bg-rose-50 text-rose-500',
  },
  {
    href: '/events',
    icon: Calendar,
    label: 'Eventos',
    desc: 'Organize a agenda da ONG',
    color: 'bg-amber-50 text-amber-500',
  },
]

export default async function HomePage() {
  const { data: animals, meta } = await getPublicAnimals()

  return (
    <div className="space-y-10">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 px-8 py-14 text-white sm:px-12 sm:py-20">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-8 right-1/3 h-48 w-48 rounded-full bg-brand-400/20 blur-2xl" />
          <PawPrint className="absolute -right-4 -top-4 h-52 w-52 rotate-12 text-white/[.07]" />
          <PawPrint className="absolute bottom-4 right-32 h-32 w-32 -rotate-6 text-white/[.07]" />
          <PawPrint className="absolute bottom-10 right-8 h-16 w-16 rotate-45 text-white/[.07]" />
        </div>

        <div className="relative z-10 max-w-lg">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <PawPrint className="h-3 w-3" /> ONG Amigo Animal
          </span>
          <h1 className="mt-3 text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
            Painel dos<br />
            <span className="text-brand-200">Voluntários</span>
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-brand-100/90">
            Gerencie animais, acompanhe adoções e organize os eventos da ONG em um só lugar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/animals"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl active:scale-[.98]"
            >
              Gerenciar animais <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[.98]"
            >
              Ver eventos
            </Link>
          </div>
        </div>
      </section>

      {/* ── Quick-links ──────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Acesso rápido</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickLinks.map(({ href, icon: Icon, label, desc, color }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color} transition-transform duration-200 group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-brand-500" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Animals grid ─────────────────────────────────────────── */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Disponíveis para adoção</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {meta.total === 0
                ? 'Nenhum animal disponível no momento'
                : `${meta.total} ${meta.total === 1 ? 'animal esperando' : 'animais esperando'} um lar`}
            </p>
          </div>
          <Link
            href="/animals"
            className="hidden items-center gap-1 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700 sm:flex"
          >
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {animals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <PawPrint className="h-7 w-7 text-gray-300" />
            </div>
            <p className="font-medium text-gray-500">Nenhum animal disponível no momento.</p>
            <p className="mt-1 text-sm text-gray-400">Cadastre animais para que apareçam aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {animals.map((animal: Pick<AnimalResponse, 'id' | 'name' | 'breed' | 'ageMonths' | 'species' | 'status' | 'photoUrl' | 'createdBy'>) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
