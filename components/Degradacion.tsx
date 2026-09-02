import { connection } from 'next/server'
import type { FrescuraItem } from '@/lib/armado'
import { fechaCorta } from '@/lib/formato'
import { diasDesde } from '@/lib/validacion'

/**
 * Aviso de dato desactualizado (B1.3). Vive en un Suspense con `connection()`
 * para que la antigüedad se calcule a request-time y el resto de la portada
 * siga siendo estático.
 */
export async function Degradacion({ frescura }: { frescura: FrescuraItem[] }) {
  await connection()
  const ahora = Date.now()
  const vencidos = frescura.filter((f) => diasDesde(f.fecha, ahora) > f.cadenciaDias)

  if (vencidos.length === 0) return null

  return (
    <aside className="degradado" role="status">
      <p className="etiqueta degradado__titulo">Dato desactualizado</p>
      <ul className="degradado__lista">
        {vencidos.map((v) => (
          <li key={v.indice}>
            <span className="dato">{v.indice}</span> — última lectura {fechaCorta(v.fecha)} (hace{' '}
            {diasDesde(v.fecha, ahora)} días).
          </li>
        ))}
      </ul>
    </aside>
  )
}
