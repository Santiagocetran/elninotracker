import type { Advisory } from '@/lib/sources/cpc-advisory'
import { CPC_ADVISORY } from '@/lib/sources/cpc-advisory'
import type { Diccionario } from '@/lib/diccionarios'
import { fechaCorta } from '@/lib/formato'

/**
 * Estado OFICIAL declarado por el CPC (Plan 01 B3.2).
 *
 * Va deliberadamente separado de nuestra clasificación por umbral: son dos
 * cosas distintas y pueden no coincidir. En agosto de 2026, por ejemplo,
 * nuestro umbral sobre RONI daba "débil" mientras el CPC mantenía Advertencia
 * de El Niño con >90% de probabilidad de un evento muy fuerte. Mostrar uno solo
 * de los dos desinforma en cualquiera de las dos direcciones.
 *
 * El texto es la traducción oficial de NOAA, citada textual. No traducimos ni
 * interpretamos nosotros (README §8.2).
 *
 * Si el comunicado no se pudo leer, `advisory` es null y el bloque se omite
 * dejando el enlace: nunca se inventa un estado.
 */
export function Oficial({ advisory, d }: { advisory: Advisory | null; d: Diccionario }) {
  if (!advisory) {
    return (
      <section className="bloque">
        <h2>{d.oficial.titulo}</h2>
        <p className="oficial__nota">
          {d.oficial.sinLeer}
          <a className="fuente" href={CPC_ADVISORY.url}>
            {d.oficial.sinLeerEnlace}
          </a>
        </p>
      </section>
    )
  }

  return (
    <section className="bloque">
      <h2>{d.oficial.titulo}</h2>

      <p className="etiqueta oficial__rotulo">{d.oficial.rotulo}</p>
      <p className="oficial__estado">{advisory.estado}</p>

      <blockquote className="oficial__sinopsis">{advisory.sinopsis}</blockquote>

      <p className="oficial__meta eje">
        {d.oficial.comunicadoDel}
        {fechaCorta(advisory.fecha)}
        {advisory.proxima ? `${d.oficial.proximaActualizacion}${fechaCorta(advisory.proxima)}` : ''}
      </p>

      <p className="oficial__nota">
        {d.oficial.nota}
        <a className="fuente" href={CPC_ADVISORY.url}>
          {d.oficial.notaEnlace}
        </a>
      </p>
    </section>
  )
}
