import type { Diccionario } from '@/lib/diccionarios'
import { GIBS } from '@/lib/sources/gibs'

/**
 * Estado vacío del mapa (Plan 03 D5, decisión 7). Server component puro: se usa
 * sin tile resuelto y como fallback del lado del cliente — un solo componente,
 * dos disparadores.
 */
export function MapaVacio({ d }: { d: Diccionario }) {
  return (
    <div className="mapa__vacio">
      <p>{d.mapa.vacio}</p>
      <a className="fuente" href={GIBS.worldviewUrl}>
        {d.mapa.vacioEnlace}
      </a>
    </div>
  )
}
