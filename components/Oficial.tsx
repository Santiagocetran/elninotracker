import type { Advisory } from '@/lib/sources/cpc-advisory'
import { CPC_ADVISORY } from '@/lib/sources/cpc-advisory'
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
export function Oficial({ advisory }: { advisory: Advisory | null }) {
  if (!advisory) {
    return (
      <section className="bloque">
        <h2>Qué dice el CPC</h2>
        <p className="oficial__nota">
          No pudimos leer el último comunicado automáticamente.{' '}
          <a className="fuente" href={CPC_ADVISORY.url}>
            LEERLO EN LA FUENTE →
          </a>
        </p>
      </section>
    )
  }

  return (
    <section className="bloque">
      <h2>Qué dice el CPC</h2>

      <p className="etiqueta oficial__rotulo">Estado oficial declarado</p>
      <p className="oficial__estado">{advisory.estado}</p>

      <blockquote className="oficial__sinopsis">{advisory.sinopsis}</blockquote>

      <p className="oficial__meta eje">
        Comunicado del {fechaCorta(advisory.fecha)}
        {advisory.proxima ? ` · próxima actualización ${fechaCorta(advisory.proxima)}` : ''}
      </p>

      <p className="oficial__nota">
        Es la traducción oficial de NOAA, citada textualmente. La clasificación de
        arriba, en cambio, es nuestra lectura por umbral del RONI: pueden no
        coincidir, porque el CPC pondera además atmósfera, pronósticos y juicio
        experto.{' '}
        <a className="fuente" href={CPC_ADVISORY.url}>
          COMUNICADO COMPLETO →
        </a>
      </p>
    </section>
  )
}
