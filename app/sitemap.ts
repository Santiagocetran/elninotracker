import type { MetadataRoute } from 'next'
import { site } from '@/site.config'
import { LOCALES_ACTIVOS } from '@/lib/i18n'
import { regionesPublicas } from '@/lib/regiones'

/**
 * Sitemap (Plan 02 D0.2 / D6).
 *
 * Sólo entra contenido `revisado` o `validado`. Los borradores quedan fuera —es
 * lo que efectivamente los mantiene fuera del índice— pero NO se bloquean en
 * `robots.txt`: el crawler necesita entrar para leer el `noindex`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entradas: MetadataRoute.Sitemap = []

  for (const lang of LOCALES_ACTIVOS) {
    entradas.push({ url: `${site.url}/${lang}`, changeFrequency: 'daily', priority: 1 })
    for (const clima of regionesPublicas()) {
      entradas.push({
        url: `${site.url}/${lang}/regiones/${clima.id}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }
  }

  return entradas
}
