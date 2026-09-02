import type { Diccionario } from '@/lib/diccionarios'

/**
 * Distintivo de contenido en borrador (Plan 02 D0.1 / D3).
 *
 * Un panel en `borrador` se despliega —el dueño lo pidió— pero declara en la
 * cara que todavía no pasó revisión editorial. El `noindex` lo pone la ruta;
 * esto lo pone frente al lector humano.
 */
export function DistintivoBorrador({ d }: { d: Diccionario }) {
  return (
    <aside className="distintivo" role="note">
      <span className="etiqueta distintivo__sello">{d.region.borrador.distintivo}</span>
      <p className="distintivo__texto">{d.region.borrador.explicacion}</p>
    </aside>
  )
}
