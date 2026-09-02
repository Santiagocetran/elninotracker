/**
 * Prosa de la portada. Vive como funciones puras para poder testear que las
 * tres fases dicen la verdad (Plan 01 B0.1), no sólo la cálida.
 */

import type { Fase } from './enso'
import { magnitud } from './formato'

export function frasePacífico(fase: Fase, valor: number): string {
  switch (fase) {
    case 'nino':
      return `El Pacífico ecuatorial está ${magnitud(valor)} °C más caliente que lo normal para esta época.`
    case 'nina':
      return `El Pacífico ecuatorial está ${magnitud(valor)} °C más frío que lo normal para esta época.`
    case 'neutral':
      return 'El Pacífico ecuatorial está cerca de lo normal para esta época.'
  }
}
