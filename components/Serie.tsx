import { scaleLinear } from 'd3-scale'
import { area, line } from 'd3-shape'
import type { Diccionario } from '@/lib/diccionarios'

/**
 * Línea temporal del ONI, renderizada EN SERVIDOR como SVG.
 *
 * Sin JavaScript en el cliente: indexable, instantánea, funciona con JS
 * desactivado.
 *
 * Por qué área divergente y no una línea: con ~900 puntos una línea simple es
 * un ovillo del que no se lee nada. El relleno separa las dos fases de un
 * vistazo y responde la pregunta del README §5.4 —"¿qué tan grande es este
 * comparado con los anteriores?"— sin leyenda.
 *
 * El color codifica frío/cálido, NUNCA bueno/malo (DESIGN.md A9).
 */

type Punto = { fecha: string; anom: number }

/**
 * Picos de eventos muy fuertes, detectados en los datos en vez de hardcodeados:
 * si NOAA revisa la serie histórica, las marcas se mueven solas.
 */
function picos(serie: Punto[], umbral: number, signo: 1 | -1) {
  const marcas: Punto[] = []
  let mejor: Punto | null = null

  for (const p of serie) {
    const supera = signo * p.anom >= umbral
    if (supera) {
      if (!mejor || signo * p.anom > signo * mejor.anom) mejor = p
    } else if (mejor) {
      marcas.push(mejor)
      mejor = null
    }
  }
  if (mejor) marcas.push(mejor)
  return marcas
}

export function Serie({
  serie,
  d,
  ancho = 1100,
  alto = 300,
}: {
  serie: Punto[]
  d: Diccionario
  ancho?: number
  alto?: number
}) {
  const pad = { arriba: 26, derecha: 8, abajo: 26, izquierda: 8 }

  const t = serie.map((p) => Date.parse(p.fecha))
  const x = scaleLinear()
    .domain([Math.min(...t), Math.max(...t)])
    .range([pad.izquierda, ancho - pad.derecha])

  const maxAbs = Math.max(2.8, ...serie.map((p) => Math.abs(p.anom)))
  const y = scaleLinear()
    .domain([-maxAbs, maxAbs])
    .range([alto - pad.abajo, pad.arriba])

  const px = (p: Punto) => x(Date.parse(p.fecha))
  const cero = y(0)

  const areaGen = area<Punto>().x(px).y0(cero).y1((p) => y(p.anom))
  const lineaGen = line<Punto>().x(px).y((p) => y(p.anom))

  const areaPath = areaGen(serie) ?? ''
  const lineaPath = lineaGen(serie) ?? ''

  const calidos = picos(serie, 2.0, 1)
  const frios = picos(serie, 1.8, -1)
  const ultimo = serie[serie.length - 1]

  // Décadas como referencia temporal, sin ejes cargados.
  const decadas: number[] = []
  const a0 = new Date(serie[0].fecha).getUTCFullYear()
  const a1 = new Date(ultimo.fecha).getUTCFullYear()
  for (let a = Math.ceil(a0 / 10) * 10; a <= a1; a += 10) decadas.push(a)

  return (
    <svg
      className="serie"
      viewBox={`0 0 ${ancho} ${alto}`}
      role="img"
      aria-label={d.historico.descripcion(a0, a1, ultimo.anom)}
    >
      <defs>
        <clipPath id="serie-calido">
          <rect x="0" y="0" width={ancho} height={cero} />
        </clipPath>
        <clipPath id="serie-frio">
          <rect x="0" y={cero} width={ancho} height={alto - cero} />
        </clipPath>
      </defs>

      {decadas.map((a) => (
        <text
          key={a}
          className="eje"
          x={x(Date.UTC(a, 0, 1))}
          y={alto - 8}
          fontSize="10"
          textAnchor="middle"
          fill="currentColor"
        >
          {a}
        </text>
      ))}

      <path className="serie__area serie__area--calido" d={areaPath} clipPath="url(#serie-calido)" />
      <path className="serie__area serie__area--frio" d={areaPath} clipPath="url(#serie-frio)" />
      <line className="serie__cero" x1={pad.izquierda} x2={ancho - pad.derecha} y1={cero} y2={cero} />
      <path className="serie__linea" d={lineaPath} />

      {calidos.map((p) => (
        <g key={p.fecha}>
          <circle className="serie__punto serie__punto--calido" cx={px(p)} cy={y(p.anom)} r="2.5" />
          <text
            className="eje serie__marca"
            x={px(p)}
            y={y(p.anom) - 9}
            fontSize="10"
            textAnchor="middle"
            fill="currentColor"
          >
            {p.fecha.slice(0, 4)}
          </text>
        </g>
      ))}

      {frios.map((p) => (
        <circle
          key={p.fecha}
          className="serie__punto serie__punto--frio"
          cx={px(p)}
          cy={y(p.anom)}
          r="2.5"
        />
      ))}

      <circle className="serie__punto serie__punto--hoy" cx={px(ultimo)} cy={y(ultimo.anom)} r="3.5" />
    </svg>
  )
}
