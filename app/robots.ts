import type { MetadataRoute } from 'next'
import { site } from '@/site.config'

/**
 * robots.txt (Plan 02 D6).
 *
 * NO se bloquea nada. Los borradores se mantienen fuera del índice con
 * `noindex` + ausencia de sitemap y de enlaces internos; bloquearlos acá
 * conseguiría lo contrario, porque el crawler no podría entrar a leer el
 * `noindex`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
