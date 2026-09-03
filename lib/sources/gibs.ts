/**
 * GIBS WMTS — capas del mapa (Plan 03 D5).
 *
 * El raster de anomalía es transparente sobre tierra, así que debajo va
 * `Coastlines_15m` (también GIBS) y el fondo lo da el CSS. La fecha se resuelve
 * con `DescribeDomains` (~250 bytes) + un `HEAD` de confirmación sobre un tile
 * representativo; el sondeo día-por-día es red de seguridad (decisión 1).
 *
 * Fetches propios con `AbortSignal.timeout`: no se reusa `traer()` porque esa
 * función rechaza respuestas de menos de 1000 bytes y `DescribeDomains`
 * responde ~250 bytes por diseño (decisión 9).
 */

import { site } from '@/site.config'

const UA = `Mozilla/5.0 (compatible; ${site.nombre}/0.1; +${site.url})`
const TIMEOUT_MS = 10_000
/** Cuántos días hacia atrás se busca un tile disponible. */
const SONDEO_DIAS = 6
const DIA_MS = 86_400_000

export const GIBS = {
  /** Bounding box fijo para `DescribeDomains`. */
  bbox: '-180,-50,180,50',
  /** Se publica a diario; damos margen de 5 días antes de marcarlo viejo. */
  cadenciaMaximaDias: 5,
  leyendaUrl:
    'https://gibs.earthdata.nasa.gov/legends/GHRSST_Sea_Surface_Temperature_Anomalies_H.svg',
  worldviewUrl: 'https://worldview.earthdata.nasa.gov',
  anomalia: {
    capa: 'GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies',
    tileMatrixSet: 'GoogleMapsCompatible_Level7',
  },
  costas: {
    capa: 'Coastlines_15m',
    tileMatrixSet: 'GoogleMapsCompatible_Level13',
  },
  /** Tile mixto tierra/océano con datos reales, para confirmar disponibilidad. */
  tileRepresentativo: { z: 2, y: 1, x: 2 },
  dataset: {
    nombre:
      'GHRSST Level 4 MUR Global Foundation Sea Surface Temperature Analysis (v4.1)',
    doi: '10.5067/GHGMR-4FJ04',
    doiUrl: 'https://doi.org/10.5067/GHGMR-4FJ04',
    organizacion: 'NASA PO.DAAC',
    anio: '2015',
    url: 'https://podaac.jpl.nasa.gov/dataset/MUR-JPL-L4-GLOB-v4.1',
  },
  servicio: {
    nombre: 'NASA GIBS',
    url: 'https://earthdata.nasa.gov/gibs',
  },
  osm: {
    nombre: 'OpenStreetMap contributors',
    url: 'https://www.openstreetmap.org/copyright',
  },
} as const

export function plantillaAnomalia(fecha: string): string {
  const { capa, tileMatrixSet } = GIBS.anomalia
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${capa}/default/${fecha}/${tileMatrixSet}/{z}/{y}/{x}.png`
}

export function plantillaCostas(): string {
  const { capa, tileMatrixSet } = GIBS.costas
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${capa}/default/${tileMatrixSet}/{z}/{y}/{x}.png`
}

// ---- fecha ------------------------------------------------------------------

function aISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function desdeISO(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d))
}

function restarDias(d: Date, n: number): Date {
  return new Date(d.getTime() - n * DIA_MS)
}

function fetchGIBS(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
}

// ---- resolución -------------------------------------------------------------

function urlDescribeDomains(inicio: string, fin: string): string {
  const { capa, tileMatrixSet } = GIBS.anomalia
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/${capa}/default/${tileMatrixSet}/${GIBS.bbox}/${inicio}--${fin}.xml`
}

async function describirDominios(fin: string): Promise<{ inicio: string; fin: string }> {
  const inicio = aISO(restarDias(desdeISO(fin), SONDEO_DIAS))
  const r = await fetchGIBS(urlDescribeDomains(inicio, fin))
  if (!r.ok) throw new Error(`DescribeDomains HTTP ${r.status}`)
  const texto = await r.text()
  const m = /<Domain>(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2})\/P1D<\/Domain>/.exec(texto)
  if (!m) throw new Error('DescribeDomains sin <Domain> esperado')
  return { inicio: m[1], fin: m[2] }
}

function urlTileConfirmacion(fecha: string): string {
  const { z, y, x } = GIBS.tileRepresentativo
  return plantillaAnomalia(fecha)
    .replace('{z}', String(z))
    .replace('{y}', String(y))
    .replace('{x}', String(x))
}

async function confirmarTile(fecha: string): Promise<boolean> {
  try {
    const r = await fetchGIBS(urlTileConfirmacion(fecha), { method: 'HEAD' })
    return r.ok
  } catch {
    return false
  }
}

async function sondear(desde: string): Promise<string | null> {
  const base = desdeISO(desde)
  for (let i = 0; i < SONDEO_DIAS; i++) {
    const fecha = aISO(restarDias(base, i))
    if (await confirmarTile(fecha)) return fecha
  }
  return null
}

/**
 * Resuelve la fecha más reciente con tile disponible, o `null` si ninguna
 * responde dentro de la ventana. No lanza: cada paso fallido se degrada al
 * siguiente (decisión 1).
 */
export async function resolverTileGIBS(ahora: Date): Promise<string | null> {
  const fin = aISO(ahora)

  let candidata: string | null = null
  try {
    candidata = (await describirDominios(fin)).fin
  } catch {
    candidata = null
  }

  if (candidata && (await confirmarTile(candidata))) return candidata
  return sondear(candidata ?? fin)
}
