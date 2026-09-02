/**
 * Genera `data/seed.json` a partir de los fixtures congelados.
 *
 * Es una herramienta de mantenimiento: deja una instantánea versionada para el
 * fallback de B1.1 sin depender de la red. La ingesta real (scripts/ingest.ts)
 * reescribe el mismo archivo cuando la red está disponible y el dato es fresco.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { armarDatos } from '../lib/armado'
import { parseWeekly } from '../lib/sources/cpc-weekly'
import { parseONI } from '../lib/sources/cpc-oni'
import { parseRONI } from '../lib/sources/cpc-roni'

async function main() {
  const [weekly, oni, roni] = await Promise.all([
    readFile('tests/fixtures/wksst9120.for', 'utf8'),
    readFile('tests/fixtures/oni.ascii.txt', 'utf8'),
    readFile('tests/fixtures/RONI.ascii.txt', 'utf8'),
  ])

  const datos = armarDatos(parseWeekly(weekly), parseONI(oni), parseRONI(roni), 'seed')

  await mkdir('data', { recursive: true })
  await writeFile(
    'data/seed.json',
    JSON.stringify({ estado: datos.estado, historico: datos.historico }, null, 2) + '\n',
  )
  console.log(
    `seed.json → ${datos.estado.fase} ${datos.estado.intensidad ?? ''} · RONI ` +
      `${datos.estado.roni.valor} · semanal ${datos.estado.semanal.valor} · ` +
      `${datos.historico.serie.length} temporadas ONI`,
  )
}

main().catch((e) => {
  console.error('No se pudo generar seed.json:', e)
  process.exit(1)
})
