/**
 * Tipos y clasificación ENSO.
 *
 * Regla que atraviesa todo el archivo (DESIGN.md A4 y A5): no existe un número
 * sin su índice, su fecha y su fuente. El tipo `Dato` lo hace imposible de
 * olvidar — sin las cuatro propiedades no compila.
 */

export type Dato = {
  valor: number
  /** Qué se midió. Nunca se muestra un valor sin esto (A5). */
  indice: 'RONI' | 'ONI' | 'Niño 3.4 semanal' | 'Niño 1+2 semanal' | 'Niño 3 semanal' | 'Niño 4 semanal'
  /** ISO 8601. Para el RONI/ONI, el último día del trimestre. */
  fecha: string
  fuente: { nombre: string; url: string }
}

export type Fase = 'nino' | 'nina' | 'neutral'
export type Intensidad = 'debil' | 'moderado' | 'fuerte' | 'muy-fuerte' | null

/**
 * Clasificación descriptiva por umbral, NO el estado oficial del CPC.
 *
 * El CPC pondera atmósfera, pronósticos y juicio experto en su ENSO Alert
 * System; esto es sólo el umbral de ±0,5 °C sobre la lectura puntual del RONI.
 * Nunca se presenta como "oficial" (DESIGN.md A10, Plan 01 B0.2).
 */
export function faseDesdeAnomalia(anom: number): Fase {
  if (anom >= 0.5) return 'nino'
  if (anom <= -0.5) return 'nina'
  return 'neutral'
}

export function intensidadDesdeAnomalia(anom: number): Intensidad {
  const a = Math.abs(anom)
  if (a < 0.5) return null
  if (a < 1.0) return 'debil'
  if (a < 1.5) return 'moderado'
  if (a < 2.0) return 'fuerte'
  return 'muy-fuerte'
}

export const etiquetaFase: Record<Fase, string> = {
  nino: 'El Niño',
  nina: 'La Niña',
  neutral: 'Neutral',
}

/** Concordancia de género: "La Niña · moderada", "El Niño · moderado". */
const ETIQUETA_INTENSIDAD_MASC: Record<NonNullable<Intensidad>, string> = {
  debil: 'débil',
  moderado: 'moderado',
  fuerte: 'fuerte',
  'muy-fuerte': 'muy fuerte',
}

const ETIQUETA_INTENSIDAD_FEM: Record<NonNullable<Intensidad>, string> = {
  debil: 'débil',
  moderado: 'moderada',
  fuerte: 'fuerte',
  'muy-fuerte': 'muy fuerte',
}

export function etiquetaIntensidad(intensidad: Intensidad, fase: Fase): string | null {
  if (!intensidad) return null
  return fase === 'nina' ? ETIQUETA_INTENSIDAD_FEM[intensidad] : ETIQUETA_INTENSIDAD_MASC[intensidad]
}

/** "El Niño · moderado", "La Niña · moderada" o "Neutral". */
export function etiquetaEstado(fase: Fase, intensidad: Intensidad): string {
  const i = etiquetaIntensidad(intensidad, fase)
  return i ? `${etiquetaFase[fase]} · ${i}` : etiquetaFase[fase]
}
