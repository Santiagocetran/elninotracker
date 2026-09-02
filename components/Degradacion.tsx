import { connection } from 'next/server'
import type { FrescuraItem } from '@/lib/armado'
import type { Diccionario } from '@/lib/diccionarios'
import { fechaCorta } from '@/lib/formato'
import { diasDesde } from '@/lib/validacion'

/**
 * Aviso de dato desactualizado (B1.3). Vive en un Suspense con `connection()`
 * para que la antigüedad se calcule a request-time y el resto de la portada
 * siga siendo estático.
 */
export async function Degradacion({
  frescura,
  d,
}: {
  frescura: FrescuraItem[]
  d: Diccionario
}) {
  await connection()
  const ahora = Date.now()
  const vencidos = frescura.filter((f) => diasDesde(f.fecha, ahora) > f.cadenciaDias)

  if (vencidos.length === 0) return null

  return (
    <aside className="degradado" role="status">
      <p className="etiqueta degradado__titulo">{d.degradado.titulo}</p>
      <ul className="degradado__lista">
        {vencidos.map((v) => (
          <li key={v.indice}>
            <span className="dato">{v.indice}</span>
            {d.degradado.ultimaLectura}
            {fechaCorta(v.fecha)}
            {d.degradado.hace}
            {diasDesde(v.fecha, ahora)}
            {d.degradado.dias}
          </li>
        ))}
      </ul>
    </aside>
  )
}
