/**
 * Costa peruana (Plan 04 D4a).
 *
 * El texto exacto de NOAA es "coastal Ecuador, northwestern Peru" —no "costa
 * peruana" en general, que no cubre el sur del país (Arequipa, Tacna). El
 * contenido lo dice explícitamente para no extender la fuente más allá de lo
 * que respalda (protocolo de cita, punto 1). Cita las entradas HERMANAS
 * `noaaCpcElNinoNwPeru`/`noaaCpcLaNinaNwPeru` —misma URL que
 * `noaaCpcElNino`/`noaaCpcLaNina`, pasaje acotado a Perú.
 *
 * Revisado por el dueño el 2026-09-03: indexado, en el sitemap, en la portada
 * (Plan 02 D0.1). El hash congela ese contenido — una edición posterior lo
 * degrada de nuevo a `borrador`.
 */

import type { Climatologia } from './esquema'
import { afirmaciones, fuentes } from './esquema'

export const costaPeruana: Climatologia = {
  id: 'costa-peruana',
  nombre: { es: 'Costa peruana' },
  paises: ['PE'],

  porFase: {
    nino: afirmaciones({
      clase: 'documentada',
      estacion: 'primavera-verano',
      evidencia: 'consistente',
      fuentes: fuentes('noaaCpcElNinoNwPeru', 'noaaCpcImpactos'),
      texto: {
        es: 'Durante El Niño, el noroeste de Perú —la franja costera norte, no toda la costa del país— suele recibir lluvias por encima de lo normal en primavera y verano (diciembre a febrero). Es una de las señales más documentadas del ENSO en la costa sudamericana del Pacífico.',
      },
    }),

    nina: afirmaciones({
      clase: 'documentada',
      estacion: 'primavera-verano',
      evidencia: 'consistente',
      fuentes: fuentes('noaaCpcLaNinaNwPeru', 'noaaCpcImpactos'),
      texto: {
        es: 'Durante La Niña, el noroeste de Perú tiende a registrar lluvias por debajo de lo normal en el mismo tramo del año en que El Niño trae lluvias por encima de lo normal: diciembre a febrero. Es el patrón espejo del de El Niño en esta franja de la costa.',
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
    hashContenido: '7e696cae61c33f5976fd6237c12bf01ae3fcf4b0ddbf3d7a4f4b873899d4cbd2',
  },
}
