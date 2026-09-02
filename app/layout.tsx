import type { Metadata } from 'next'
import { Literata, IBM_Plex_Mono } from 'next/font/google'
import { site } from '@/site.config'
import './tracker.css'

/**
 * Dos familias, sin sans (DESIGN.md §3).
 * Serif = palabras nuestras. Mono = valores medidos.
 * El subset `latin` cubre español y portugués completos — verificado.
 */
const serif = Literata({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--fuente-serif',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--fuente-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nombre} — estado actual de El Niño y La Niña`,
    template: `%s · ${site.nombre}`,
  },
  description: site.descripcion,
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: site.nombre,
    title: site.nombre,
    description: site.descripcion,
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
