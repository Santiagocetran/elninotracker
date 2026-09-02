/**
 * Acceso cacheado a los datos (Plan 01 B1.1).
 *
 * Un solo contrato de cache: Cache Components (`'use cache'` + `cacheLife`).
 * Se cachea el resultado AGREGADO y VALIDADO, no cada respuesta HTTP cruda:
 * así un 200 corrupto no reemplaza al último resultado válido.
 *
 * Si NOAA está inaccesible (build con cache vacío y checkout limpio, por
 * ejemplo), se cae explícitamente a `data/seed.json` versionado. La degradación
 * por cadencia se muestra en la portada, no acá.
 */

import { cacheLife } from 'next/cache'
import seedBruto from '@/data/seed.json'
import { armarDatos, type DatosInicio } from './armado'
import { traer } from './red'
import { CPC_ADVISORY, parseAdvisory, type Advisory } from './sources/cpc-advisory'
import { CPC_ONI, parseONI } from './sources/cpc-oni'
import { CPC_RONI, parseRONI } from './sources/cpc-roni'
import { CPC_WEEKLY, parseWeekly } from './sources/cpc-weekly'

export async function getDatos(): Promise<DatosInicio> {
  'use cache'
  cacheLife('hours')

  // El advisory se pide aparte y su fallo se absorbe: es HTML editorial de los
  // años 90 y no puede arrastrar consigo a las tres series numéricas.
  const advisory = await getAdvisory()

  try {
    const [textoWeekly, textoOni, textoRoni] = await Promise.all([
      traer(CPC_WEEKLY.url),
      traer(CPC_ONI.url),
      traer(CPC_RONI.url),
    ])
    return {
      ...armarDatos(
        parseWeekly(textoWeekly),
        parseONI(textoOni),
        parseRONI(textoRoni),
        'noaa',
      ),
      advisory,
    }
  } catch (e) {
    console.error('[getDatos] NOAA no disponible; se sirve el seed versionado.', e)
    const seed = seedBruto as {
      estado: DatosInicio['estado']
      historico: DatosInicio['historico']
    }
    return { estado: seed.estado, historico: seed.historico, origen: 'seed', advisory }
  }
}

async function getAdvisory(): Promise<Advisory | null> {
  try {
    return parseAdvisory(await traer(CPC_ADVISORY.url))
  } catch (e) {
    console.error('[getAdvisory] comunicado del CPC ilegible; se omite el bloque.', e)
    return null
  }
}
