/**
 * Pampa húmeda (Plan 04 D4a).
 *
 * "Central Argentina" en `elninosfc.shtml`/`laninasfc.shtml` es la región de
 * clima húmedo templado —la Pampa—, distinta de Cuyo (árido, cordillerano),
 * que por eso queda bloqueada en este plan hasta tener fuente propia. Misma
 * fuente y misma estructura que Litoral (comparten "central Argentina" en el
 * texto de NOAA), pero son regiones geográficas distintas con archivo propio.
 *
 * Revisado por el dueño el 2026-09-03: indexado, en el sitemap, en la portada
 * (Plan 02 D0.1). El hash congela ese contenido — una edición posterior lo
 * degrada de nuevo a `borrador`.
 */

import type { Climatologia } from './esquema'
import { afirmaciones, fuentes } from './esquema'

export const pampaHumeda: Climatologia = {
  id: 'pampa-humeda',
  nombre: { es: 'Pampa húmeda' },
  paises: ['AR'],

  porFase: {
    nino: afirmaciones({
      clase: 'documentada',
      estacion: 'primavera-verano',
      evidencia: 'consistente',
      fuentes: fuentes('noaaCpcElNino', 'noaaCpcImpactos'),
      texto: {
        es: 'Durante El Niño, el centro de la Argentina suele recibir lluvias por encima de lo normal en primavera y verano (diciembre a febrero). Es una de las señales más consistentes del ENSO en Sudamérica, documentada por el Centro de Predicción Climática de la NOAA.',
      },
    }),

    nina: afirmaciones({
      clase: 'documentada',
      estacion: 'invierno',
      evidencia: 'consistente',
      fuentes: fuentes('noaaCpcLaNina', 'noaaCpcImpactos'),
      texto: {
        es: 'Durante La Niña, el centro de la Argentina tiende a registrar lluvias por debajo de lo normal en invierno (junio a agosto). Es el patrón espejo del de El Niño, pero no en la misma estación: la señal húmeda de El Niño aparece en verano y la seca de La Niña en invierno.',
      },
    }),

    neutral: afirmaciones({
      clase: 'sin-señal-documentada',
      fuentes: fuentes('noaaCpcFaq', 'noaaCpcImpactos'),
      texto: {
        es: 'En condiciones neutrales, el Pacífico ecuatorial está cerca de su temperatura y presión habituales —no hay ni el calentamiento de El Niño ni el enfriamiento de La Niña—. Como los patrones de lluvia que se describen para esta región dependen de esa anomalía, en neutral no operan de la misma manera: el clima de la zona responde a otros factores.',
      },
    }),
  },

  // Revisado por el dueño del proyecto el 2026-09-03. Esto NO es validación de
  // un especialista en clima: ese es el estado 'validado', todavía pendiente
  // (Plan 02 D0.1). El hash congela el contenido revisado — cualquier edición
  // posterior del texto, la estación, la evidencia o las fuentes lo degrada
  // solo a 'borrador'.
  revision: {
    estado: 'revisado',
    autor: 'Santiago Cetrán',
    fecha: '2026-09-03',
    hashContenido: '3861cb93242beae6aeaacccbe449b6ed9a67e92aee520edc32c2a630ae706443',
  },
}
