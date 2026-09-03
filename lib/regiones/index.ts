/**
 * Registro de regiones (Plan 02 D3).
 *
 * En v1 hay una sola: el Litoral argentino, piloto del ciclo completo. Las otras
 * seis del README §5.2 entran en D4, una vez demostrado el ciclo.
 */

import { estadoEfectivo, esIndexable, type Climatologia } from './esquema'
import { assertClimatologiaValida } from './validar'
import { litoral } from './litoral'
import { surDeBrasil } from './sur-de-brasil'
import { pampaHumeda } from './pampa-humeda'
import { costaPeruana } from './costa-peruana'

const TODAS: readonly Climatologia[] = [litoral, surDeBrasil, pampaHumeda, costaPeruana]

// Falla al importar el módulo si una región no valida: mejor romper el build que
// publicar una afirmación sin fuente.
for (const clima of TODAS) assertClimatologiaValida(clima)

// Falla si dos regiones comparten `id`: `Object.fromEntries` los pisaría en
// silencio y una de las dos desaparecería del sitio sin ningún error (Plan 04
// D4a).
{
  const ids = new Set(TODAS.map((c) => c.id))
  if (ids.size !== TODAS.length) {
    throw new Error('Climatología inválida: hay ids de región duplicados en TODAS')
  }
}

export const REGIONES: Record<string, Climatologia> = Object.fromEntries(
  TODAS.map((c) => [c.id, c]),
)

export function getRegion(id: string): Climatologia | null {
  return REGIONES[id] ?? null
}

export function idsDeRegiones(): string[] {
  return Object.keys(REGIONES)
}

/** Sólo las que ya pasaron revisión: entran a sitemap, navegación y portada. */
export function regionesPublicas(): Climatologia[] {
  return TODAS.filter((c) => esIndexable(c))
}

export { estadoEfectivo, esIndexable }
export type { Climatologia }
