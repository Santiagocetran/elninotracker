import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PanelRegion } from '@/components/PanelRegion'
import type { Fase } from '@/lib/enso'
import { getDatos } from '@/lib/datos'
import { esLocaleActivo, LOCALES_ACTIVOS } from '@/lib/i18n'
import { getDiccionario } from '@/lib/diccionarios'
import { getRegion, idsDeRegiones, esIndexable } from '@/lib/regiones'
import { site } from '@/site.config'

/**
 * Panel de impacto regional (Plan 02 D3).
 *
 * La fase la elige el RONI (D0.3) y el panel se presenta como asociación
 * histórica, no como pronóstico. El Advisory conserva su bloque en la portada y
 * no selecciona nada acá.
 *
 * `borrador` → `noindex`, fuera de sitemap y de todo enlace interno, pero
 * alcanzable por URL directa. NO se bloquea en `robots.txt`: el crawler necesita
 * entrar para leer el `noindex` (D6).
 */

type Params = { lang: string; region: string }

export function generateStaticParams(): Params[] {
  return LOCALES_ACTIVOS.flatMap((lang) => idsDeRegiones().map((region) => ({ lang, region })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { lang, region } = await params
  const clima = getRegion(region)
  if (!esLocaleActivo(lang) || !clima) return {}

  const nombre = clima.nombre[lang] ?? clima.id
  const indexable = esIndexable(clima)

  return {
    title: `${nombre} — El Niño y La Niña en la región`,
    description: `Qué suele implicar cada fase del ENSO en ${nombre}, según fuentes oficiales.`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
    alternates: indexable ? { canonical: `${site.url}/${lang}/regiones/${region}` } : undefined,
  }
}

export default async function RegionPage({ params }: { params: Promise<Params> }) {
  const { lang, region } = await params
  if (!esLocaleActivo(lang)) notFound()

  const clima = getRegion(region)
  if (!clima) notFound()

  const d = getDiccionario(lang)

  // La fase la fija el RONI (vía el estado agregado). Si ni el seed está
  // disponible, no se adivina: se muestran las tres.
  let faseActual: Fase | null = null
  try {
    const { estado } = await getDatos()
    faseActual = estado.fase
  } catch {
    faseActual = null
  }

  return <PanelRegion clima={clima} lang={lang} faseActual={faseActual} d={d} />
}
