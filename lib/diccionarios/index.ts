/**
 * Acceso al chrome de interfaz por idioma (Plan 02 D1).
 *
 * Sólo hay diccionario para los locales activos. `pt` está en la arquitectura
 * (`LOCALES`) pero no acá: sus rutas devuelven 404 antes de llegar a este
 * módulo, así que pedir un diccionario inexistente es un error de programación,
 * no un caso a tolerar.
 */

import type { LocaleActivo } from '@/lib/i18n'
import { es, type Diccionario } from './es'

const DICCIONARIOS: Record<LocaleActivo, Diccionario> = { es }

export function getDiccionario(lang: LocaleActivo): Diccionario {
  return DICCIONARIOS[lang]
}

export type { Diccionario }
