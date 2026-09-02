/**
 * Región piloto: Litoral argentino (Plan 02 D3).
 *
 * Una sola región, las tres fases, el ciclo completo de punta a punta antes de
 * escribir las otras seis. Elegida porque tiene la señal ENSO más fuerte y clara
 * de las siete del README §5.2, y es la que el README nombra primero.
 *
 * TODAS las afirmaciones citan fuentes del registro cerrado `FUENTES`, con URL
 * verificada. El texto es condicional, sin catástrofe y sin probabilidad, y
 * describe la FASE (lo que suele pasar durante una fase así), no el evento en
 * curso.
 *
 * Se despliega como `borrador`. Es contenido SIN revisar: el estado editorial
 * lo dice, la página muestra un distintivo y no se indexa hasta que el dueño lo
 * revise (D0.1).
 */

import type { Climatologia } from './esquema'
import { afirmaciones, fuentes } from './esquema'

export const litoral: Climatologia = {
  id: 'litoral',
  nombre: { es: 'Litoral argentino' },
  paises: ['AR'],

  porFase: {
    nino: afirmaciones(
      {
        clase: 'documentada',
        estacion: 'primavera-verano',
        evidencia: 'consistente',
        fuentes: fuentes('noaaCpcElNino', 'noaaCpcImpactos', 'noaaEnsoCascada'),
        texto: {
          es: 'Durante El Niño, el Litoral y la Mesopotamia suelen recibir lluvias por encima de lo normal, sobre todo en primavera y verano. El sudeste de Sudamérica es una de las zonas donde esta asociación aparece de forma más consistente de un evento a otro.',
        },
      },
      {
        clase: 'documentada',
        estacion: 'primavera-verano',
        evidencia: 'mixta',
        fuentes: fuentes('noaaEnsoCascada'),
        texto: {
          es: 'La asociación tiende a ser más marcada cuanto más intenso es el evento, pero no es una regla fija: hubo años de El Niño en que la señal de lluvia no se expresó en la región.',
        },
      },
    ),

    nina: afirmaciones({
      clase: 'documentada',
      estacion: 'invierno',
      evidencia: 'consistente',
      fuentes: fuentes('noaaCpcLaNina', 'noaaCpcImpactos'),
      texto: {
        es: 'Durante La Niña, el sur de Brasil y el centro de la Argentina —y con ellos buena parte del Litoral— tienden a registrar lluvias por debajo de lo normal en invierno. Es el patrón espejo del de El Niño y también se repite de forma consistente entre eventos.',
      },
    }),

    neutral: afirmaciones({
      clase: 'sin-señal-documentada',
      fuentes: fuentes('noaaCpcFaq', 'noaaCpcImpactos'),
      texto: {
        es: 'En condiciones neutrales del ENSO no hay una señal sistemática documentada para el Litoral. El Pacífico ecuatorial está cerca de su promedio, y las guías oficiales describen efectos regionales sólo para las fases El Niño y La Niña; en neutral, el clima de la región responde a otros factores.',
      },
    }),
  },

  // Se despliega sin revisar. El dueño revisa por URL directa y recién entonces
  // pasa a 'revisado' (D3).
  revision: { estado: 'borrador' },
}
