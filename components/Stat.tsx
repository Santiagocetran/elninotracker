import type { Dato } from '@/lib/enso'
import { anomalia, fechaCorta } from '@/lib/formato'

/**
 * La cifra medida a tamaño display.
 *
 * Recibe un `Dato` completo — valor, índice, fecha y fuente — y los muestra los
 * cuatro juntos (DESIGN.md §6). No existe una cifra sin procedencia: el tipo lo
 * hace imposible de olvidar.
 *
 * Separa la coma decimal en su propio span porque `tabular-nums` le asigna una
 * celda del ancho de un dígito: a 8rem eso abre un hueco que hace leer
 * "+2 , 6".
 */
export function Stat({ dato, temporada }: { dato: Dato; temporada?: string }) {
  const [entera, decimal] = anomalia(dato.valor).split(',')
  const fecha = temporada ?? fechaCorta(dato.fecha)

  return (
    <div className="stat">
      <span className="stat__valor stat__valor--acento">
        {entera}
        <span className="stat__sep">,</span>
        {decimal}
      </span>
      <span className="stat__meta">
        <span className="stat__unidad dato">°C</span>
        <span className="etiqueta">
          {dato.indice} · {fecha}
        </span>
        <a className="fuente" href={dato.fuente.url}>
          FUENTE: {dato.fuente.nombre} →
        </a>
      </span>
    </div>
  )
}
