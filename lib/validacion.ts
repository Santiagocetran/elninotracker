/**
 * Invariantes de datos (Plan 01 B2.2).
 *
 * HTTP 200 no significa dato fresco: `wksst8110.for` devolvía 200 con datos de
 * enero de 2021. Por eso cada serie se valida por su última observación, no por
 * el código de estado de la descarga.
 */

const DIA_MS = 86_400_000

export function diasDesde(iso: string, ahora: number): number {
  return Math.floor((ahora - Date.parse(iso)) / DIA_MS)
}

/** True si la fecha está en el futuro — no se acepta ni para "frescura". */
export function esFutura(iso: string, ahora: number): boolean {
  return Date.parse(iso) > ahora
}

/**
 * Aborta si la última observación es futura o más vieja que la cadencia.
 * Ambas condiciones son un dato inválido para publicar.
 */
export function exigirFrescura(
  etiqueta: string,
  ultimaFecha: string,
  maxDias: number,
  ahora: number,
) {
  if (esFutura(ultimaFecha, ahora)) {
    throw new Error(
      `FECHA FUTURA — ${etiqueta}: última observación ${ultimaFecha} está en el futuro.`,
    )
  }

  const dias = diasDesde(ultimaFecha, ahora)
  if (dias > maxDias) {
    throw new Error(
      `DATO RANCIO — ${etiqueta}: última observación ${ultimaFecha} (${dias} días, ` +
        `máximo ${maxDias}). El endpoint respondió igual; verificar si la fuente se ` +
        `movió de URL antes de tocar este umbral.`,
    )
  }
}

export function filasSuficientes(etiqueta: string, n: number, minimo: number) {
  if (n < minimo) {
    throw new Error(`${etiqueta}: ${n} filas parseadas, mínimo esperado ${minimo}.`)
  }
}

export function fechasUnicasCrecientes(etiqueta: string, fechas: string[]) {
  for (let i = 1; i < fechas.length; i++) {
    if (fechas[i] <= fechas[i - 1]) {
      throw new Error(
        `${etiqueta}: fechas no estrictamente crecientes en ${fechas[i - 1]} → ${fechas[i]}.`,
      )
    }
  }
}

export function rangoFisico(etiqueta: string, valor: number, [min, max]: [number, number]) {
  if (!Number.isFinite(valor) || valor < min || valor > max) {
    throw new Error(`${etiqueta}: valor ${valor} fuera del rango físico [${min}, ${max}].`)
  }
}
