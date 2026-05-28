import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Amigo Animal',
  description: 'Sistema de gestão interna da ONG Amigo Animal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-[#f8f8fa]">
        <Providers>
          <Navbar />
          <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
