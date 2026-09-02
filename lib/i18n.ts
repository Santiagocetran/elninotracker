/**
 * Idiomas del sitio (Plan 02 D1).
 *
 * Dos listas distintas y NO intercambiables:
 *
 *  - `LOCALES` es la arquitectura: rutas, esquema y diccionarios soportan estos
 *    idiomas desde v1 (DESIGN.md §5).
 *  - `LOCALES_ACTIVOS` es lo que efectivamente se sirve y se indexa. `pt` está en
 *    la arquitectura pero no acá: servir castellano bajo bandera portuguesa es
 *    peor que no ofrecerlo, así que `/pt` devuelve 404 hasta tener traducción
 *    real.
 */

export const LOCALES = ['es', 'pt'] as const
export type Locale = (typeof LOCALES)[number]

export const LOCALES_ACTIVOS = ['es'] as const
export type LocaleActivo = (typeof LOCALES_ACTIVOS)[number]

export const LOCALE_POR_DEFECTO: LocaleActivo = 'es'

export function esLocaleActivo(x: string): x is LocaleActivo {
  return (LOCALES_ACTIVOS as readonly string[]).includes(x)
}
