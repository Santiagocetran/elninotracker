import { Suspense } from 'react'
import { Degradacion } from '@/components/Degradacion'
import { Serie } from '@/components/Serie'
import { Stat } from '@/components/Stat'
import { getDatos } from '@/lib/datos'
import { frasePacífico } from '@/lib/copy'
import { etiquetaEstado } from '@/lib/enso'
import { anomalia, fechaCorta } from '@/lib/formato'

/**
 * Portada. Orden fijo según DESIGN.md §4: el estado primero, el mapa nunca.
 * Los datos vienen de una función cacheada (lib/datos.ts); el fallback es el
 * seed versionado cuando NOAA no responde.
 */
export default async function Home() {
  const { estado, historico } = await getDatos()

  return (
    <main className="envoltorio" data-fase={estado.fase}>
      {/* Degradación: dinámica por request, el resto queda estático. */}
      <Suspense fallback={null}>
        <Degradacion frescura={estado.frescura} />
      </Suspense>

      {/* 1 · El estado */}
      <section className="bloque">
        <p className="etiqueta fase">
          {etiquetaEstado(estado.fase, estado.intensidad)}
        </p>

        <div className="estado__stat">
          <Stat dato={estado.roni} temporada={`trimestre ${estado.roni.temporada}`} />
        </div>

        <h1 className="estado__frase">
          {frasePacífico(estado.fase, estado.roni.valor)}
        </h1>

        <p className="estado__nota">
          La fase y la intensidad de arriba son una{' '}
          <strong>clasificación descriptiva por umbral</strong> sobre el <strong>RONI</strong>, el
          índice operativo del CPC desde febrero de 2026. La observación más reciente en la región
          Niño&nbsp;3.4 es <span className="dato">{anomalia(estado.semanal.valor)} °C</span> para la
          semana del {fechaCorta(estado.semanal.fecha)}{' '}
          <a className="fuente" href={estado.semanal.fuente.url}>
            {estado.semanal.fuente.nombre} →
          </a>
        </p>
      </section>

      {/* 2 · La nota que evita una lectura errónea: cuatro cosas distintas (B0.2). */}
      <section className="bloque">
        <div className="aviso">
          <p className="etiqueta aviso__titulo">Cómo leer estos números</p>
          <p>
            <strong>RONI</strong> — índice operativo actual del CPC. La lectura de arriba es del
            trimestre {estado.roni.temporada}.{' '}
            <a className="fuente" href={estado.roni.fuente.url}>
              RONI · {estado.roni.fuente.nombre} →
            </a>
          </p>
          <p>
            <strong>Niño 3.4 semanal</strong> — la observación más reciente (
            {fechaCorta(estado.semanal.fecha)}). Es instantánea y por eso siempre más extrema que un
            promedio de tres meses.{' '}
            <a className="fuente" href={estado.semanal.fuente.url}>
              semanal · {estado.semanal.fuente.nombre} →
            </a>
          </p>
          <p>
            <strong>ONI</strong> — contexto y comparación histórica. Es la línea de abajo, desde 1950,
            y ya no se usa para describir el estado actual.{' '}
            <a className="fuente" href={estado.oni.fuente.url}>
              ONI · {estado.oni.fuente.nombre} →
            </a>
          </p>
          <p>
            <strong>Estado oficial del CPC</strong> — lo que el CPC declara en su comunicado ENSO.
            Este sitio no lo calcula: lo relaya.{' '}
            <a
              className="fuente"
              href="https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml"
            >
              ENSO Advisory →
            </a>
          </p>
        </div>
      </section>

      {/* 3 · Qué significa para mí — el diferencial. Va ARRIBA del mapa. */}
      <section className="bloque">
        <h2>¿Qué significa para mí?</h2>
        <p className="aviso aviso--mt">
          Los paneles de impacto por región todavía no están escritos. Es la parte de mayor valor
          del sitio y la de mayor riesgo editorial, así que no se improvisa.
        </p>
      </section>

      {/* 5 · El histórico */}
      <section className="bloque">
        <h2>Desde 1950</h2>
        <p className="etiqueta serie__etiqueta">Anomalía ONI · °C</p>
        <Serie serie={historico.serie} ancho={1100} alto={260} />
        <p className="serie__fuente">
          <a className="fuente" href={historico.fuente.url}>
            ONI · {historico.fuente.nombre} →
          </a>
        </p>
      </section>

      {/* 6 · Fuentes */}
      <footer className="bloque">
        <p className="etiqueta">Fuentes</p>
        <ul className="fuentes__lista">
          <li>
            RONI — trimestre {estado.roni.temporada} ·{' '}
            <a className="fuente" href={estado.roni.fuente.url}>
              {estado.roni.fuente.nombre} →
            </a>
          </li>
          <li>
            Niño 3.4 semanal — {fechaCorta(estado.semanal.fecha)} ·{' '}
            <a className="fuente" href={estado.semanal.fuente.url}>
              {estado.semanal.fuente.nombre} →
            </a>
          </li>
          <li>
            ONI, serie histórica — hasta {estado.oni.temporada} ·{' '}
            <a className="fuente" href={estado.oni.fuente.url}>
              {estado.oni.fuente.nombre} →
            </a>
          </li>
        </ul>
        <p className="pie__nota">Datos de dominio público de NOAA CPC.</p>
      </footer>
    </main>
  )
}
