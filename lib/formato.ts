/** Formato es-AR: coma decimal, signo explícito para anomalías. */

export function anomalia(v: number, decimales = 1): string {
  const s = Math.abs(v).toLocaleString('es-AR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
  // El signo se muestra siempre: una anomalía sin signo no se entiende.
  return `${v > 0 ? '+' : v < 0 ? '−' : ''}${s}`
}

/** Magnitud de la anomalía, sin signo: "1,2". Para la frase de la portada. */
export function magnitud(v: number, decimales = 1): string {
  return Math.abs(v).toLocaleString('es-AR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

export function fechaCorta(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  return `${d} ${MESES[m - 1]} ${a}`
}
