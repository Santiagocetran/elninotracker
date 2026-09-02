/**
 * Pruebas de TIPO (Plan 02 D2, criterios de aceptación).
 *
 * No es un test de runtime: no lo corre el test runner. Lo verifica `tsc` — si
 * alguno de estos `@ts-expect-error` dejara de ser un error, el typecheck falla.
 * Documenta las tres cosas que "no deben compilar".
 */

import type { Afirmacion, Climatologia, RevisionEditorial } from '@/lib/regiones/esquema'
import { fuentes } from '@/lib/regiones/esquema'

// 1 · Una afirmación con array de fuentes vacío NO compila.
const _sinFuentes: Afirmacion = {
  clase: 'documentada',
  estacion: 'verano',
  evidencia: 'consistente',
  // @ts-expect-error — `fuentes` es una tupla no vacía
  fuentes: [],
  texto: { es: 'x' },
}

// @ts-expect-error — el constructor exige al menos un id
const _sinArgs = fuentes()

// 2 · `validado` sin especialista/credencial NO compila.
// @ts-expect-error — faltan `especialista` y `credencial`
const _validadoIncompleto: RevisionEditorial = {
  estado: 'validado',
  revisionDueño: { autor: 'a', fecha: '2026-09-02', hashContenido: 'h' },
  fecha: '2026-09-02',
  hashContenido: 'h',
}

// 3 · `revisado` sin la evidencia del dueño (autor/fecha/hash) NO compila.
// @ts-expect-error — `revisado` exige autor, fecha y hashContenido
const _revisadoIncompleto: RevisionEditorial = { estado: 'revisado' }

// Uso para que TS no marque los bindings como no leídos.
export const _casos = [_sinFuentes, _sinArgs, _validadoIncompleto, _revisadoIncompleto] as const
export type _C = Climatologia
