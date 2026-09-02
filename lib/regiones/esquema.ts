/**
 * Esquema de climatología regional (Plan 02 D2.1).
 *
 * El único tipo de contenido de v1: **climatología**, no pronóstico. Describe lo
 * que suele pasar en una región durante cada fase del ENSO, según fuentes
 * oficiales. Reglas que el TIPO hace cumplir:
 *
 *  - Ninguna afirmación sin fuente: `fuentes` es una tupla NO vacía de `FuenteId`
 *    del registro cerrado. `fuentes: []` no compila.
 *  - Ninguna probabilidad: el campo no existe y no se agrega.
 *  - `validado` exige acreditar al especialista: la unión discriminada no deja
 *    declarar `validado` sin `especialista` y `credencial`.
 *  - Las tres fases, con arrays no vacíos: `Record<Fase, [Afirmacion, ...]>`.
 *
 * Lo que el tipo NO puede hacer cumplir —que el texto describa correctamente a
 * su fuente— es el motivo de la escalera de estados de D0.1.
 */

import { createHash } from 'node:crypto'
import type { Fase } from '@/lib/enso'
import type { Locale } from '@/lib/i18n'
import type { FuenteId } from './fuentes'

/** Cerrado, no texto libre (Plan 02 D2.1). */
export type Estacion =
  | 'todo-el-año'
  | 'primavera-verano'
  | 'otoño-invierno'
  | 'primavera'
  | 'verano'
  | 'otoño'
  | 'invierno'

/**
 * `sin-señal-documentada` es una clase de primera, no un valor de relleno:
 * decir "acá no hay señal clara y esto lo respalda" es una respuesta completa,
 * especialmente probable en fase neutral (Plan 02 D2.1).
 */
export type Afirmacion =
  | {
      clase: 'documentada'
      /** El contenido editorial vive acá, por locale. Lo verifica `validar.ts`. */
      texto: Partial<Record<Locale, string>>
      estacion: Estacion
      /** Lo que dice la fuente, no una impresión nuestra. */
      evidencia: 'consistente' | 'mixta'
      fuentes: readonly [FuenteId, ...FuenteId[]]
    }
  | {
      clase: 'sin-señal-documentada'
      texto: Partial<Record<Locale, string>>
      /** Que respalden la AUSENCIA de señal. */
      fuentes: readonly [FuenteId, ...FuenteId[]]
    }

export type RevisionDueño = {
  autor: string
  /** ISO 8601. */
  fecha: string
  hashContenido: string
}

/**
 * El estado ES la evidencia (Plan 02 D0.1). No hay campos sueltos que permitan
 * combinaciones imposibles como `validado` con revisor `null`.
 */
export type RevisionEditorial =
  | { estado: 'borrador' }
  | ({ estado: 'revisado' } & RevisionDueño)
  | {
      estado: 'validado'
      revisionDueño: RevisionDueño
      especialista: string
      /** Por qué esta persona puede validar esto. */
      credencial: string
      fecha: string
      hashContenido: string
    }

/**
 * Constructores de tupla no vacía. Existen sólo para esquivar la inferencia de
 * TypeScript, que da `T[]` (posiblemente vacío) a un array literal. Con estos,
 * `fuentes()` y `afirmaciones()` sin argumentos **no compilan**.
 */
export function fuentes(...ids: [FuenteId, ...FuenteId[]]): readonly [FuenteId, ...FuenteId[]] {
  return ids
}

export function afirmaciones(
  ...a: [Afirmacion, ...Afirmacion[]]
): readonly [Afirmacion, ...Afirmacion[]] {
  return a
}

export type Climatologia = {
  id: string
  nombre: Partial<Record<Locale, string>>
  /** Códigos ISO 3166-1 alpha-2. */
  paises: string[]
  porFase: Record<Fase, readonly [Afirmacion, ...Afirmacion[]]>
  revision: RevisionEditorial
}

// ---- Hash de contenido -------------------------------------------------

/**
 * El hash cubre texto, estación, evidencia, fuentes y traducciones (Plan 02
 * D0.1) — todo lo que un revisor efectivamente leyó. NO cubre `nombre` ni
 * `paises`: cambiarlos no cambia lo que se afirmó.
 *
 * Serialización canónica: claves y locales ordenados, para que el hash no
 * dependa del orden en que se escribió el objeto.
 */
function normalizarAfirmacion(a: Afirmacion) {
  const texto: Record<string, string> = {}
  for (const k of Object.keys(a.texto).sort()) {
    const v = (a.texto as Record<string, string | undefined>)[k]
    if (v !== undefined) texto[k] = v
  }
  return a.clase === 'documentada'
    ? { clase: a.clase, estacion: a.estacion, evidencia: a.evidencia, fuentes: [...a.fuentes], texto }
    : { clase: a.clase, fuentes: [...a.fuentes], texto }
}

export function hashContenido(porFase: Climatologia['porFase']): string {
  const fases = (Object.keys(porFase) as Fase[]).sort()
  const payload = fases.map((f) => [f, porFase[f].map(normalizarAfirmacion)] as const)
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

/**
 * Estado editorial EFECTIVO. Si el contenido cambió respecto de lo que se
 * revisó —texto, estación, evidencia, fuentes o traducciones— el estado degrada
 * automáticamente a `borrador`: no se conserva una revisión sobre contenido que
 * ya no es el revisado (Plan 02 D0.1).
 */
export function estadoEfectivo(clima: Climatologia): RevisionEditorial {
  if (clima.revision.estado === 'borrador') return clima.revision

  const hashActual = hashContenido(clima.porFase)
  const hashRevisado = clima.revision.hashContenido

  if (hashActual !== hashRevisado) return { estado: 'borrador' }
  return clima.revision
}

export function esIndexable(clima: Climatologia): boolean {
  const e = estadoEfectivo(clima).estado
  return e === 'revisado' || e === 'validado'
}
