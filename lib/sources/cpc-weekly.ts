/**
 * CPC weekly SST — wksst9120.for
 *
 * OJO: campos de ancho fijo donde los valores SE PEGAN cuando la anomalía es
 * negativa. Una línea real:
 *
 *     26AUG2026     25.0 4.2     28.3 3.4     29.4 2.6     29.6 1.0
 *     03JAN1990     23.4-0.4     25.1-0.3     26.6-0.0     28.6 0.3
 *                       ^^^^ sin espacio
 *
 * Por eso NO se puede partir por espacios: hay que aceptar cero separación
 * entre SST y SSTA. Un split() ingenuo devuelve 4 campos en vez de 8 y arruina
 * la fila sin fallar.
 *
 * El predecesor de este archivo (wksst8110.for) devolvía HTTP 200 con datos
 * congelados en enero de 2021. De ahí la verificación de frescura en la ingesta.
 */

export const CPC_WEEKLY = {
  url: 'https://www.cpc.ncep.noaa.gov/data/indices/wksst9120.for',
  nombre: 'NOAA CPC',
  /** Se publica los lunes. Damos margen de 10 días antes de gritar. */
  cadenciaMaximaDias: 10,
} as const

export type SemanaCPC = {
  /** ISO 8601, centro de la semana. */
  fecha: string
  nino12: { sst: number; anom: number }
  nino3: { sst: number; anom: number }
  nino34: { sst: number; anom: number }
  nino4: { sst: number; anom: number }
}

const MESES: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
}

/** `-?\d+\.\d` seguido de `\s*` permite el caso pegado `25.0-0.4`. */
const NUM = String.raw`(-?\d+\.\d)`
const LINEA = new RegExp(
  String.raw`^\s*(\d{2})([A-Z]{3})(\d{4})\s+` +
    [0, 1, 2, 3].map(() => String.raw`${NUM}\s*${NUM}`).join(String.raw`\s+`) +
    String.raw`\s*$`,
)

export function parseWeekly(texto: string): SemanaCPC[] {
  const filas: SemanaCPC[] = []

  for (const linea of texto.split('\n')) {
    const m = LINEA.exec(linea)
    if (!m) continue

    const [, dd, mmm, yyyy, ...v] = m
    const mes = MESES[mmm]
    if (mes === undefined) continue

    const fecha = new Date(Date.UTC(Number(yyyy), mes, Number(dd)))
    const n = v.map(Number)
    if (n.some(Number.isNaN)) continue

    filas.push({
      fecha: fecha.toISOString().slice(0, 10),
      nino12: { sst: n[0], anom: n[1] },
      nino3: { sst: n[2], anom: n[3] },
      nino34: { sst: n[4], anom: n[5] },
      nino4: { sst: n[6], anom: n[7] },
    })
  }

  if (filas.length === 0) {
    throw new Error('wksst9120.for: cero filas parseadas — cambió el formato')
  }
  return filas.sort((a, b) => a.fecha.localeCompare(b.fecha))
}
