import type { Fase } from '@/lib/enso'
import type { Diccionario } from '@/lib/diccionarios'

/**
 * "El motor" — corte transversal del Pacífico ecuatorial (DESIGN.md §6.1).
 *
 * Explica POR QUÉ el océano se calienta, que es lo que un mapa no puede mostrar:
 * la historia pasa en profundidad, en la inclinación de la termoclina.
 *
 * Sin JavaScript: tres radios y selectores hermanos de CSS. Es un esquema, no
 * un dato en vivo, y lo declara. Tres etiquetas, no quince.
 */

type EstadoMotor = 'normal' | 'nino' | 'nina'

const ORDEN: EstadoMotor[] = ['nina', 'normal', 'nino']

/**
 * Geometría por estado.
 *
 * La clave física: el agua caliente ES la capa que está por encima de la
 * termoclina. Así que una sola curva gobierna el dibujo entero — la inclinación
 * de esa curva es literalmente el fenómeno. No hay una "pileta" aparte.
 */
const FORMA: Record<
  EstadoMotor,
  {
    /** Profundidad de la termoclina en el oeste y en el este. */
    termoclina: [number, number]
    /** Flechas de viento: cuántas y qué largo. */
    viento: { n: number; largo: number }
    /** Intensidad del afloramiento frente a Perú (0 = no hay). */
    aflora: number
  }
> = {
  nina:   { termoclina: [214, 104], viento: { n: 5, largo: 108 }, aflora: 1 },
  normal: { termoclina: [198, 118], viento: { n: 4, largo: 78 },  aflora: 0.7 },
  nino:   { termoclina: [162, 168], viento: { n: 2, largo: 34 },  aflora: 0 },
}

const W = 820
const H = 292
const SUP = 88          // superficie del mar
const FONDO = 250       // lecho
const IZQ = 92          // costa de Indonesia
const DER = 728         // costa de Perú

function Corte({ estado, t }: { estado: EstadoMotor; t: Diccionario['motor'] }) {
  const f = FORMA[estado]
  const [oeste, este] = f.termoclina
  // De oeste a este, para dibujar la termoclina.
  const curva = `C ${IZQ + 240} ${oeste}, ${DER - 240} ${este}, ${DER} ${este}`
  // La misma curva al revés, para cerrar el relleno del agua caliente.
  const curvaInv = `C ${DER - 240} ${este}, ${IZQ + 240} ${oeste}, ${IZQ} ${oeste}`

  return (
    <g>
      {/* agua fría: todo el cuerpo de agua */}
      <rect className="motor__agua" x={IZQ} y={SUP} width={DER - IZQ} height={FONDO - SUP} />

      {/* agua caliente: lo que queda POR ENCIMA de la termoclina */}
      <path
        className="motor__pileta"
        d={`M ${IZQ} ${SUP} H ${DER} V ${este} ${curvaInv} Z`}
      />

      {/* la termoclina propiamente dicha */}
      <path className="motor__termoclina" d={`M ${IZQ} ${oeste} ${curva}`} />

      {/* viento alisio: de este a oeste */}
      {Array.from({ length: f.viento.n }).map((_, i) => {
        const y = 26 + i * 13
        const x2 = DER - 40 - i * 30
        const x1 = x2 - f.viento.largo
        return (
          <g key={i} className="motor__viento">
            <line x1={x1 + 9} y1={y} x2={x2} y2={y} />
            <path d={`M ${x1} ${y} l 9 -4 v 8 Z`} />
          </g>
        )
      })}

      {/* afloramiento: agua fría que sube frente a Perú */}
      {f.aflora > 0 && (
        <g className="motor__aflora">
          <line x1={DER - 26} y1={este + 62} x2={DER - 26} y2={SUP + 16} />
          <path d={`M ${DER - 26} ${SUP + 6} l -6 12 h 12 Z`} />
        </g>
      )}

      {/* tierra: Indonesia a la izquierda, Sudamérica a la derecha */}
      <path className="motor__tierra" d={`M 0 ${FONDO} V ${SUP - 26} L ${IZQ} ${SUP} V ${FONDO} Z`} />
      <path className="motor__tierra" d={`M ${W} ${FONDO} V ${SUP - 34} L ${DER} ${SUP} V ${FONDO} Z`} />
      <path className="motor__lecho" d={`M ${IZQ} ${FONDO} H ${DER}`} />

      {/* tres etiquetas, no quince (DESIGN.md §6.1) */}
      <text className="motor__rotulo" x={IZQ + 22} y={SUP + 26}>{t.rotulos.caliente}</text>
      <text className="motor__rotulo motor__rotulo--frio" x={IZQ + 22} y={FONDO - 22}>
        {t.rotulos.fria}
      </text>
      <text className="motor__rotulo" x={DER - 46} y={16} textAnchor="end">{t.rotulos.viento}</text>
    </g>
  )
}

export function Motor({ faseActual, d }: { faseActual: Fase | null; d: Diccionario }) {
  const inicial: EstadoMotor = faseActual === 'nino' ? 'nino' : faseActual === 'nina' ? 'nina' : 'normal'
  const t = d.motor

  return (
    <section className="bloque motor">
      <h2>{t.titulo}</h2>
      <p className="motor__intro">{t.intro}</p>

      <div className="motor__caja">
        {ORDEN.map((e) => (
          <input
            key={e}
            type="radio"
            name="motor"
            id={`motor-${e}`}
            className="motor__radio"
            defaultChecked={e === inicial}
          />
        ))}

        <div className="motor__botones" role="group" aria-label={t.titulo}>
          {ORDEN.map((e) => (
            <label key={e} className="motor__boton" htmlFor={`motor-${e}`}>
              {t.estados[e].nombre}
            </label>
          ))}
        </div>

        <div className="motor__escena">
          <div className="motor__cabeceras">
            <span className="eje">{t.oeste}</span>
            <span className="eje">{t.este}</span>
          </div>

          {ORDEN.map((e) => (
            <svg
              key={e}
              className={`motor__svg motor__svg--${e}`}
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={t.estados[e].alt}
            >
              <Corte estado={e} t={t} />
            </svg>
          ))}

          {ORDEN.map((e) => (
            <p key={e} className={`motor__texto motor__texto--${e}`}>
              {t.estados[e].texto}
            </p>
          ))}
        </div>

        <ul className="motor__leyenda">
          <li><span className="motor__punto motor__punto--pileta" />{t.leyenda.pileta}</li>
          <li><span className="motor__punto motor__punto--termo" />{t.leyenda.termoclina}</li>
          <li><span className="motor__punto motor__punto--viento" />{t.leyenda.viento}</li>
        </ul>
      </div>

      <p className="eje motor__nota">{t.nota}</p>
    </section>
  )
}
