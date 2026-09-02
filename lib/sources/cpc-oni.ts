/**
 * CPC ONI — oni.ascii.txt
 *
 * El índice oficial: media móvil de 3 meses de la anomalía en Niño 3.4.
 * Formato simple, separado por espacios:
 *
 *     SEAS  YR   TOTAL   ANOM
 *      DJF 1950  25.01  -1.32
 *      MJJ 2026  29.02   1.39
 *
 * NO es comparable con el valor semanal (DESIGN.md A5): el ONI promedia tres
 * meses, el semanal es instantáneo y siempre más extremo.
 */

export const CPC_ONI = {
  url: 'https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt',
  nombre: 'NOAA CPC',
  /**
   * Se mide contra el FIN del trimestre, no contra su centro. Una temporada
   * cierra, se publica ~2 semanas después, y queda como última durante un mes
   * hasta que cierra la siguiente. 60 días cubre eso con margen.
   */
  cadenciaMaximaDias: 60,
} as const

export type TemporadaONI = {
  /** Trimestre solapado: DJF, JFM, FMA… */
  temporada: string
  anio: number
  /**
   * ISO 8601 del mes central del trimestre. Es la fecha correcta para GRAFICAR
   * una media móvil, pero NO para medir frescura: el centro de la ventana está
   * siempre ~2 meses en el pasado por definición. Usar `fin` para eso.
   */
  fecha: string
  /**
   * Último día del trimestre. Contra esto se mide la frescura: una temporada
   * que cierra el 31/07 se publica el segundo jueves de agosto.
   */
  fin: string
  sst: number
  anom: number
}

/** El mes central de cada trimestre solapado (0-indexado). */
const MES_CENTRAL: Record<string, number> = {
  DJF: 0, JFM: 1, FMA: 2, MAM: 3, AMJ: 4, MJJ: 5,
  JJA: 6, JAS: 7, ASO: 8, SON: 9, OND: 10, NDJ: 11,
}

export function parseONI(texto: string): TemporadaONI[] {
  const filas: TemporadaONI[] = []

  for (const linea of texto.split('\n')) {
    const p = linea.trim().split(/\s+/)
    if (p.length !== 4) continue

    const [temporada, anioStr, sstStr, anomStr] = p
    const mes = MES_CENTRAL[temporada]
    if (mes === undefined) continue

    const anio = Number(anioStr)
    const sst = Number(sstStr)
    const anom = Number(anomStr)
    if ([anio, sst, anom].some(Number.isNaN)) continue

    // El año de la fila es el del mes central: DJF 1950 = dic 1949 + ene/feb 1950.
    // El trimestre termina un mes después del central; Date.UTC rota el año solo.
    filas.push({
      temporada,
      anio,
      fecha: new Date(Date.UTC(anio, mes, 1)).toISOString().slice(0, 10),
      fin: new Date(Date.UTC(anio, mes + 2, 0)).toISOString().slice(0, 10),
      sst,
      anom,
    })
  }

  if (filas.length === 0) {
    throw new Error('oni.ascii.txt: cero filas parseadas — cambió el formato')
  }
  return filas.sort((a, b) => a.fecha.localeCompare(b.fecha))
}
