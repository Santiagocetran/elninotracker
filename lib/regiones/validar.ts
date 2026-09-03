/**
 * Validador editorial (Plan 02 D2.3).
 *
 * Corre en tests unitarios y en el arranque del módulo de regiones. Verifica lo
 * que el sistema de tipos no puede: cobertura de locales activos, fuentes que
 * existen en el registro, y ausencia de probabilidad o de futuro categórico en
 * el texto.
 *
 * Lo que NO verifica —y no puede— es que el texto describa correctamente a su
 * fuente. Eso lo hace un lector; ver la escalera de estados de D0.1.
 */

import type { Fase } from '@/lib/enso'
import { LOCALES_ACTIVOS } from '@/lib/i18n'
import { FUENTES } from './fuentes'
import type { Afirmacion, Climatologia } from './esquema'

const FASES: readonly Fase[] = ['nino', 'nina', 'neutral']

/** Números con "%" o la palabra "probabilidad": no van en climatología (D2.1). */
const PROHIBIDO_PROBABILIDAD = /%|\bprobabilidad(es)?\b/i
/** Futuro categórico: la climatología es condicional siempre (D4). */
const PROHIBIDO_FUTURO = /\b(va|van|vas|voy|vamos)\s+a\s+\p{L}/iu

/**
 * Conjunto CERRADO, mismo criterio que `FUENTES`/`LOCALES` — no una regex de
 * formato, que aceptaría un código con forma válida pero inexistente ("ZZ").
 * Los ocho países sudamericanos relevantes al alcance del proyecto (Plan 04
 * D4a); ampliable si el alcance crece.
 */
const PAISES_VALIDOS = ['AR', 'BO', 'BR', 'CL', 'EC', 'PE', 'PY', 'UY'] as const

/** Slug seguro para la ruta `/es/regiones/[id]` (Plan 04 D4a). */
const ID_VALIDO = /^[a-z0-9-]+$/

function validarTextoAfirmacion(ctx: string, texto: Partial<Record<string, string>>): string[] {
  const errores: string[] = []

  for (const loc of LOCALES_ACTIVOS) {
    const t = texto[loc]
    if (!t || !t.trim()) {
      errores.push(`${ctx}: falta texto para el locale activo "${loc}"`)
      continue
    }
    if (PROHIBIDO_PROBABILIDAD.test(t)) {
      errores.push(`${ctx} [${loc}]: la climatología no lleva probabilidad ("%" o "probabilidad")`)
    }
    if (PROHIBIDO_FUTURO.test(t)) {
      errores.push(`${ctx} [${loc}]: usá condicional ("suele", "tiende a"), no "va a"`)
    }
  }

  return errores
}

function validarAfirmacion(ctx: string, a: Afirmacion): string[] {
  const errores: string[] = [...validarTextoAfirmacion(ctx, a.texto)]

  if (a.fuentes.length === 0) {
    errores.push(`${ctx}: sin fuentes`)
  }
  for (const fid of a.fuentes) {
    if (!Object.prototype.hasOwnProperty.call(FUENTES, fid)) {
      errores.push(`${ctx}: fuente "${fid}" no está en el registro cerrado FUENTES`)
    }
  }

  return errores
}

export function validarClimatologia(clima: Climatologia): string[] {
  const errores: string[] = []

  if (!ID_VALIDO.test(clima.id)) {
    errores.push(`${clima.id}: id no es un slug válido ("${ID_VALIDO}")`)
  }

  for (const loc of LOCALES_ACTIVOS) {
    if (!clima.nombre[loc]?.trim()) {
      errores.push(`${clima.id}: falta nombre para el locale activo "${loc}"`)
    }
  }

  if (clima.paises.length === 0) {
    errores.push(`${clima.id}: "paises" no puede estar vacío`)
  }
  for (const pais of clima.paises) {
    if (!(PAISES_VALIDOS as readonly string[]).includes(pais)) {
      errores.push(`${clima.id}: país "${pais}" no está en el conjunto cerrado PAISES_VALIDOS`)
    }
  }

  for (const fase of FASES) {
    const afs = clima.porFase[fase]
    if (!afs || afs.length === 0) {
      errores.push(`${clima.id}: la fase "${fase}" no tiene afirmaciones`)
      continue
    }
    afs.forEach((a, i) => {
      errores.push(...validarAfirmacion(`${clima.id}/${fase}[${i}]`, a))
    })
  }

  return errores
}

export function assertClimatologiaValida(clima: Climatologia): void {
  const errores = validarClimatologia(clima)
  if (errores.length > 0) {
    throw new Error(`Climatología inválida:\n  - ${errores.join('\n  - ')}`)
  }
}
