import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Literata, IBM_Plex_Mono } from 'next/font/google'
import { site } from '@/site.config'
import { LOCALES_ACTIVOS, esLocaleActivo } from '@/lib/i18n'
import '../tracker.css'

/**
 * Layout raíz. Vive bajo `[lang]` porque el idioma es parte de la ruta desde v1
 * (Plan 02 D1). `generateStaticParams` + `dynamicParams = false` hacen que
 * cualquier idioma que no esté activo —hoy, `/pt`— devuelva 404 en vez de
 * servir castellano bajo otra bandera.
 *
 * Dos familias, sin sans (DESIGN.md §3). Serif = palabras nuestras. Mono =
 * valores medidos. El subset `latin` cubre español y portugués completos.
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

export function generateStaticParams() {
  return LOCALES_ACTIVOS.map((lang) => ({ lang }))
}

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

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!esLocaleActivo(lang)) notFound()

  return (
    <html lang={lang} className={`${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
