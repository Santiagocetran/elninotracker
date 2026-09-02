/**
 * CPC RONI — RONI.ascii.txt
 *
 * El Relative Oceanic Niño Index es el índice operativo del CPC para monitorear
 * y pronosticar ENSO desde febrero de 2026. Tres columnas, no cuatro como el ONI:
 *
 *     SEAS   YR  ANOM
 *     DJF  1950 -1.19
 *     MJJ  2026  0.98
 *
 * El ONI sigue siendo válido sólo para la serie histórica y la comparación.
 */

export const CPC_RONI = {
  url: 'https://www.cpc.ncep.noaa.gov/data/indices/RONI.ascii.txt',
  nombre: 'NOAA CPC',
  /**
   * Igual que el ONI: la frescura se mide contra el FIN del trimestre, no
   * contra su centro. La temporada cierra, se publica ~2 semanas después y
   * queda como última durante un mes hasta que cierra la siguiente.
   */
  cadenciaMaximaDias: 60,
} as const

export type TemporadaRONI = {
  /** Trimestre solapado: DJF, JFM, FMA… */
  temporada: string
  anio: number
  /**
   * Último día del trimestre. Contra esto se mide la frescura (B2.2): una
   * temporada que cierra el 31/07 se publica el segundo jueves de agosto.
   */
  fin: string
  anom: number
}

/** El mes central de cada trimestre solapado (0-indexado). */
const MES_CENTRAL: Record<string, number> = {
  DJF: 0, JFM: 1, FMA: 2, MAM: 3, AMJ: 4, MJJ: 5,
  JJA: 6, JAS: 7, ASO: 8, SON: 9, OND: 10, NDJ: 11,
}

export function parseRONI(texto: string): TemporadaRONI[] {
  const filas: TemporadaRONI[] = []

  for (const linea of texto.split('\n')) {
    const p = linea.trim().split(/\s+/)
    if (p.length !== 3) continue

    const [temporada, anioStr, anomStr] = p
    const mes = MES_CENTRAL[temporada]
    if (mes === undefined) continue

    const anio = Number(anioStr)
    const anom = Number(anomStr)
    if ([anio, anom].some(Number.isNaN)) continue

    filas.push({
      temporada,
      anio,
      fin: new Date(Date.UTC(anio, mes + 2, 0)).toISOString().slice(0, 10),
      anom,
    })
  }

  if (filas.length === 0) {
    throw new Error('RONI.ascii.txt: cero filas parseadas — cambió el formato')
  }
  return filas.sort((a, b) => a.fin.localeCompare(b.fin))
}
