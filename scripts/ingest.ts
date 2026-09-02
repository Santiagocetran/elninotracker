/**
 * Ingesta estricta. Corre a demanda (mantenimiento / CI), no durante `next build`.
 *
 * La regla que gobierna este archivo: HTTP 200 NO significa dato fresco.
 * El endpoint anterior del CPC (wksst8110.for) devolvía 200 con 102 KB y su
 * última semana era enero de 2021. Por eso se verifica la fecha de la última
 * observación — y se aborta si es futura o más vieja que la cadencia.
 *
 * Escribe `data/seed.json`, la instantánea versionada que `lib/datos.ts` usa
 * como fallback cuando NOAA no responde.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { armarDatos } from '../lib/armado'
import { traer } from '../lib/red'
import { CPC_ONI, parseONI } from '../lib/sources/cpc-oni'
import { CPC_RONI, parseRONI } from '../lib/sources/cpc-roni'
import { CPC_WEEKLY, parseWeekly } from '../lib/sources/cpc-weekly'
import { exigirFrescura } from '../lib/validacion'

async function main() {
  console.log('Ingesta ENSO (estricta)')

  const [textoWeekly, textoOni, textoRoni] = await Promise.all([
    traer(CPC_WEEKLY.url),
    traer(CPC_ONI.url),
    traer(CPC_RONI.url),
  ])

  const semanas = parseWeekly(textoWeekly)
  const temporadas = parseONI(textoOni)
  const ronis = parseRONI(textoRoni)

  // Estructura primero (filas, orden, rangos): armarDatos valida B2.2.
  const datos = armarDatos(semanas, temporadas, ronis, 'noaa')

  // Frescura, contra el FIN del trimestre para ONI/RONI y el centro para el weekly.
  const ahora = Date.now()
  exigirFrescura('CPC weekly', semanas.at(-1)!.fecha, CPC_WEEKLY.cadenciaMaximaDias, ahora)
  exigirFrescura('CPC ONI', temporadas.at(-1)!.fin, CPC_ONI.cadenciaMaximaDias, ahora)
  exigirFrescura('CPC RONI', ronis.at(-1)!.fin, CPC_RONI.cadenciaMaximaDias, ahora)

  await mkdir('data', { recursive: true })
  await writeFile(
    'data/seed.json',
    JSON.stringify({ estado: datos.estado, historico: datos.historico }, null, 2) + '\n',
  )

  console.log(
    `  → ${datos.estado.fase} ${datos.estado.intensidad ?? ''} · RONI ` +
      `${datos.estado.roni.valor} · semanal ${datos.estado.semanal.valor} · ` +
      `${datos.historico.serie.length} temporadas ONI`,
  )
}

main().catch((e) => {
  console.error('\nINGESTA FALLIDA —', (e as Error).message, '\n')
  process.exit(1)
})
