import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Degradacion } from '@/components/Degradacion'
import { Mapa } from '@/components/Mapa'
import { Motor } from '@/components/Motor'
import { Oficial } from '@/components/Oficial'
import { Serie } from '@/components/Serie'
import { Stat } from '@/components/Stat'
import { getDatos } from '@/lib/datos'
import type { FrescuraItem } from '@/lib/armado'
import { frasePacífico } from '@/lib/copy'
import { etiquetaEstado } from '@/lib/enso'
import { esLocaleActivo } from '@/lib/i18n'
import { getDiccionario } from '@/lib/diccionarios'
import { getMapaGIBS } from '@/lib/mapa'
import { regionesPublicas } from '@/lib/regiones'
import { GIBS } from '@/lib/sources/gibs'
import { anomalia, fechaCorta } from '@/lib/formato'

/**
 * Portada. Orden fijo según DESIGN.md §4: el estado primero; el mapa va después
 * de "Cómo afecta a tu región" (el bloque "Qué significa para mí" de README
 * §5.2 / DESIGN.md §4) y nunca encabeza la página.
 * Los datos vienen de una función cacheada (lib/datos.ts y lib/mapa.ts); el
 * fallback es el seed versionado cuando NOAA no responde, y el mapa se omite
 * si GIBS no responde. Todo el texto de interfaz sale del diccionario por
 * idioma (Plan 02 D1) — no hay literales en el JSX.
 */
export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const regiones = regionesPublicas()
  if (!esLocaleActivo(lang)) notFound()
  const d = getDiccionario(lang)

  const [{ estado, historico, advisory }, mapa] = await Promise.all([
    getDatos(),
    getMapaGIBS(),
  ])
  const frescura: FrescuraItem[] = mapa
    ? [...estado.frescura, { indice: 'Mapa', fecha: mapa, cadenciaDias: GIBS.cadenciaMaximaDias }]
    : estado.frescura

  return (
    <main className="envoltorio" data-fase={estado.fase}>
      {/* Degradación: dinámica por request, el resto queda estático. */}
      <Suspense fallback={null}>
        <Degradacion frescura={frescura} d={d} />
      </Suspense>

      {/* 1 · El estado */}
      <section className="bloque">
        <p className="etiqueta fase">{etiquetaEstado(estado.fase, estado.intensidad)}</p>

        <div className="estado__stat">
          <Stat
            dato={estado.roni}
            temporada={`${d.comun.trimestrePrefijo}${estado.roni.temporada}`}
            d={d}
          />
        </div>

        <h1 className="estado__frase">{frasePacífico(estado.fase, estado.roni.valor)}</h1>

        <p className="estado__nota">
          {d.estado.notaClasificacion.pre}
          <strong>{d.estado.notaClasificacion.fuerte1}</strong>
          {d.estado.notaClasificacion.medio}
          <strong>{d.estado.notaClasificacion.fuerte2}</strong>
          {d.estado.notaClasificacion.post}
          <span className="dato">
            {anomalia(estado.semanal.valor)} {d.stat.unidad}
          </span>
          {d.estado.notaClasificacion.cierrePre}
          {fechaCorta(estado.semanal.fecha)}
          {d.estado.notaClasificacion.cierrePost}
          <a className="fuente" href={estado.semanal.fuente.url}>
            {estado.semanal.fuente.nombre}
            {d.comun.flecha}
          </a>
        </p>
      </section>

      {/* 2 · La nota que evita una lectura errónea: cuatro cosas distintas (B0.2). */}
      <section className="bloque">
        <div className="aviso">
          <p className="etiqueta aviso__titulo">{d.comoLeer.titulo}</p>
          <p>
            <strong>{d.comoLeer.roni.nombre}</strong>
            {d.comoLeer.roni.texto}
            {estado.roni.temporada}
            {d.comoLeer.roni.cierre}{' '}
            <a className="fuente" href={estado.roni.fuente.url}>
              {d.comoLeer.roni.enlace}
              {estado.roni.fuente.nombre}
              {d.comun.flecha}
            </a>
          </p>
          <p>
            <strong>{d.comoLeer.semanal.nombre}</strong>
            {d.comoLeer.semanal.texto}
            {fechaCorta(estado.semanal.fecha)}
            {d.comoLeer.semanal.cierre}{' '}
            <a className="fuente" href={estado.semanal.fuente.url}>
              {d.comoLeer.semanal.enlace}
              {estado.semanal.fuente.nombre}
              {d.comun.flecha}
            </a>
          </p>
          <p>
            <strong>{d.comoLeer.oni.nombre}</strong>
            {d.comoLeer.oni.texto}{' '}
            <a className="fuente" href={estado.oni.fuente.url}>
              {d.comoLeer.oni.enlace}
              {estado.oni.fuente.nombre}
              {d.comun.flecha}
            </a>
          </p>
          <p>
            <strong>{d.comoLeer.advisory.nombre}</strong>
            {d.comoLeer.advisory.texto}{' '}
            <a
              className="fuente"
              href="https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml"
            >
              {d.comoLeer.advisory.enlace}
            </a>
          </p>
        </div>
      </section>

      {/* 3 · Lo que declara el CPC. Separado de nuestra clasificación a propósito. */}
      <Oficial advisory={advisory} d={d} />

      {/* 4 · Por qué pasa — el explicador del mecanismo (DESIGN.md §6.1) */}
      <Motor faseActual={estado.fase} d={d} />

      {/* 5 · Cómo afecta a tu región — el diferencial. Va ARRIBA del mapa. */}
      <section className="bloque">
        <h2>{d.significa.titulo}</h2>
        {regiones.length === 0 ? (
          <p className="aviso aviso--mt">{d.significa.pendiente}</p>
        ) : (
          <>
            <p className="significa__entrada">{d.significa.entrada}</p>
            <ul className="significa__lista">
              {regiones.map((r) => (
                <li key={r.id}>
                  <a className="significa__region" href={`/${lang}/regiones/${r.id}`}>
                    {r.nombre[lang]}
                  </a>
                </li>
              ))}
            </ul>
            <p className="eje significa__faltan">{d.significa.faltan}</p>
          </>
        )}
      </section>

      {/* 6 · El mapa — el raster GIBS, encuadrado y citado (DESIGN.md §6). */}
      <Mapa tile={mapa} d={d} />

      {/* 7 · El histórico */}
      <section className="bloque">
        <h2>{d.historico.titulo}</h2>
        <p className="etiqueta serie__etiqueta">{d.historico.etiquetaSerie}</p>
        <Serie serie={historico.serie} ancho={1100} alto={260} d={d} />
        <p className="serie__fuente">
          <a className="fuente" href={historico.fuente.url}>
            {d.historico.enlace}
            {historico.fuente.nombre}
            {d.comun.flecha}
          </a>
        </p>
      </section>

      {/* 8 · Fuentes */}
      <footer className="bloque">
        <p className="etiqueta">{d.fuentes.titulo}</p>
        <ul className="fuentes__lista">
          <li>
            {d.fuentes.roni}
            {estado.roni.temporada}
            {d.comun.separador}
            <a className="fuente" href={estado.roni.fuente.url}>
              {estado.roni.fuente.nombre}
              {d.comun.flecha}
            </a>
          </li>
          <li>
            {d.fuentes.semanal}
            {fechaCorta(estado.semanal.fecha)}
            {d.comun.separador}
            <a className="fuente" href={estado.semanal.fuente.url}>
              {estado.semanal.fuente.nombre}
              {d.comun.flecha}
            </a>
          </li>
          <li>
            {d.fuentes.oni}
            {estado.oni.temporada}
            {d.comun.separador}
            <a className="fuente" href={estado.oni.fuente.url}>
              {estado.oni.fuente.nombre}
              {d.comun.flecha}
            </a>
          </li>
        </ul>
        <p className="pie__nota">{d.fuentes.nota}</p>
      </footer>
    </main>
  )
}
