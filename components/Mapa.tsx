import type { Diccionario } from '@/lib/diccionarios'
import { fechaCorta } from '@/lib/formato'
import { GIBS } from '@/lib/sources/gibs'
import { MapaLazy } from './MapaLazy'
import { MapaVacio } from './MapaVacio'

/**
 * Bloque del mapa (Plan 03 D5). Server component: el texto —atribución, fecha,
 * leyenda— existe con o sin JS. Con tile resuelto monta `MapaLazy` (cliente);
 * sin tile, `MapaVacio` (server).
 */
export function Mapa({ tile, d }: { tile: string | null; d: Diccionario }) {
  return (
    <section className="bloque">
      <h2>{d.mapa.titulo}</h2>
      <p className="mapa__intro">{d.mapa.intro}</p>

      <figure className="mapa">
        {tile ? (
          <div className="mapa__fecha">
            {d.mapa.fechaPrefijo}
            {fechaCorta(tile)}
          </div>
        ) : null}
        {tile ? <MapaLazy tile={tile} fallback={<MapaVacio d={d} />} /> : <MapaVacio d={d} />}
        <figcaption className="mapa__atribucion">
          {d.mapa.atribucion(GIBS.dataset.nombre, GIBS.servicio.nombre, GIBS.osm.nombre)}
          <a className="fuente" href={GIBS.dataset.doiUrl}>
            {d.mapa.datasetEnlace}
          </a>
        </figcaption>
      </figure>

      <div className="mapa__leyenda">
        <img className="mapa__leyenda-img" src={GIBS.leyendaUrl} alt={d.mapa.leyendaAlt} />
        <p className="mapa__leyenda-texto">{d.mapa.leyendaTexto}</p>
      </div>
    </section>
  )
}
