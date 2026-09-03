/**
 * Sur de Brasil (Plan 04 D4a).
 *
 * Las tres fases citan el mismo par de páginas climatológicas del CPC que ya
 * usa Litoral (`noaaCpcElNino`/`noaaCpcLaNina`, que ya cubren "southern
 * Brazil" en su `seccion`) más `noaaCpcImpactos` y, en neutral, `noaaCpcFaq`.
 * La estación de El Niño (DJF) y la de La Niña (JJA) NO son simétricas —así
 * lo dice la fuente, no se asume— por eso una es `primavera-verano` y la
 * otra `invierno`.
 *
 * Revisado por el dueño el 2026-09-03: indexado, en el sitemap, en la portada
 * (Plan 02 D0.1). El hash congela ese contenido — una edición posterior lo
 * degrada de nuevo a `borrador`.
 */

import type { Climatologia } from './esquema'
import { afirmaciones, fuentes } from './esquema'

export const surDeBrasil: Climatologia = {
  id: 'sur-de-brasil',
  nombre: { es: 'Sur de Brasil' },
  paises: ['BR'],

  porFase: {
    nino: afirmaciones({
      clase: 'documentada',
      estacion: 'primavera-verano',
      evidencia: 'consistente',
      fuentes: fuentes('noaaCpcElNino', 'noaaCpcImpactos'),
      texto: {
        es: 'Durante El Niño, el sur de Brasil suele recibir lluvias por encima de lo normal en primavera y verano (diciembre a febrero). Es una de las señales más consistentes del ENSO en Sudamérica, documentada por el Centro de Predicción Climática de la NOAA.',
      },
    }),

    nina: afirmaciones({
      clase: 'documentada',
      estacion: 'invierno',
      evidencia: 'consistente',
      fuentes: fuentes('noaaCpcLaNina', 'noaaCpcImpactos'),
      texto: {
        es: 'Durante La Niña, el sur de Brasil tiende a registrar lluvias por debajo de lo normal en invierno (junio a agosto). Es el patrón espejo del de El Niño, pero no en la misma estación: la señal húmeda de El Niño aparece en verano y la seca de La Niña en invierno.',
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
    hashContenido: 'a046eb61cad0b4b98e3fe4e3b1d0084911be0bda6498bc9543a72d6c49ad9ba3',
  },
}
