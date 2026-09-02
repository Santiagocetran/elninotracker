import type { Fase } from '@/lib/enso'
import type { LocaleActivo } from '@/lib/i18n'
import type { Diccionario } from '@/lib/diccionarios'
import { FUENTES } from '@/lib/regiones/fuentes'
import { estadoEfectivo, type Climatologia } from '@/lib/regiones/esquema'
import type { Afirmacion } from '@/lib/regiones/esquema'
import { DistintivoBorrador } from './DistintivoBorrador'

/**
 * Panel de impacto regional (Plan 02 D3).
 *
 * Componente puro: recibe la climatología, el idioma y la fase actual ya
 * resueltos. La selección de fase la hace la ruta con el RONI (D0.3); acá sólo
 * se muestra. Se presenta como *"lo que suele pasar en esta región durante una
 * fase así"* — asociación histórica, nunca consecuencia pronosticada.
 */

const FASES: readonly Fase[] = ['nino', 'nina', 'neutral']

function AfirmacionVista({
  a,
  lang,
  d,
}: {
  a: Afirmacion
  lang: LocaleActivo
  d: Diccionario
}) {
  const estacion =
    a.clase === 'documentada' ? d.region.estacion[a.estacion] : d.region.sinSenal

  return (
    <article className="afirmacion">
      <div className="afirmacion__meta">
        <span className="etiqueta">{estacion}</span>
      </div>
      <p className="afirmacion__texto">{a.texto[lang] ?? ''}</p>
      {a.clase === 'documentada' ? (
        <p className="eje">{d.region.evidencia[a.evidencia]}</p>
      ) : null}
      <p className="etiqueta">{d.region.fuentesRotulo}</p>
      <ul className="afirmacion__fuentes">
        {a.fuentes.map((id) => {
          const f = FUENTES[id]
          return (
            <li key={id}>
              <a className="fuente" href={f.url}>
                {f.organismo}
                {d.comun.separador}
                {f.titulo}
                {d.comun.flecha}
              </a>
              <span className="eje">
                {d.comun.separador}
                {d.region.consultado}
                {f.consultadoEl}
              </span>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

function FaseBloque({
  fase,
  clima,
  lang,
  d,
}: {
  fase: Fase
  clima: Climatologia
  lang: LocaleActivo
  d: Diccionario
}) {
  return (
    <div className="fase-bloque">
      <h2 className="fase-bloque__titulo">{d.region.fases[fase]}</h2>
      {clima.porFase[fase].map((a, i) => (
        <AfirmacionVista key={`${fase}-${i}`} a={a} lang={lang} d={d} />
      ))}
    </div>
  )
}

export function PanelRegion({
  clima,
  lang,
  faseActual,
  d,
}: {
  clima: Climatologia
  lang: LocaleActivo
  faseActual: Fase | null
  d: Diccionario
}) {
  const enBorrador = estadoEfectivo(clima).estado === 'borrador'
  const principales: readonly Fase[] = faseActual ? [faseActual] : FASES
  const secundarias: readonly Fase[] = faseActual
    ? FASES.filter((f) => f !== faseActual)
    : []

  return (
    <main className="envoltorio" data-fase={faseActual ?? 'neutral'}>
      {enBorrador ? <DistintivoBorrador d={d} /> : null}

      <a className="fuente volver" href={`/${lang}`}>
        {d.region.volver}
      </a>

      <h1>{clima.nombre[lang] ?? clima.id}</h1>
      <p className="panel__encuadre">{d.region.fraseEncuadre}</p>

      <section className="bloque">
        <p className="etiqueta fase-actual__rotulo">
          {faseActual ? d.region.faseActualRotulo : d.region.sinFaseActual}
        </p>
        {principales.map((f) => (
          <FaseBloque key={f} fase={f} clima={clima} lang={lang} d={d} />
        ))}
      </section>

      {secundarias.length > 0 ? (
        <section className="bloque otras-fases">
          <h2>{d.region.otrasFases}</h2>
          {secundarias.map((f) => (
            <FaseBloque key={f} fase={f} clima={clima} lang={lang} d={d} />
          ))}
        </section>
      ) : null}
    </main>
  )
}
