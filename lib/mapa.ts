/**
 * Acceso cacheado al tile del mapa (Plan 03 D5).
 *
 * Mismo contrato de cache que `lib/datos.ts`: `'use cache'` + `cacheLife('hours')`.
 * Un fallo de GIBS nunca tumba la portada: devuelve `null` y el bloque omite el
 * raster, quedando la vía accesible (atribución, fecha y link).
 */

import { cacheLife } from 'next/cache'
import { resolverTileGIBS } from './sources/gibs'

export async function getMapaGIBS(): Promise<string | null> {
  'use cache'
  cacheLife('hours')

  try {
    const tile = await resolverTileGIBS(new Date())
    if (tile === null) {
      console.error('[getMapaGIBS] GIBS no respondió en la ventana; el mapa se omite.')
    }
    return tile
  } catch (e) {
    console.error('[getMapaGIBS] GIBS no disponible; el mapa se omite.', e)
    return null
  }
}
