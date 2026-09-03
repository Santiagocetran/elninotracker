/**
 * Registro CERRADO de fuentes (Plan 02 D2.1).
 *
 * Una afirmación climática referencia un `FuenteId` de este objeto, nunca un
 * objeto de fuente libre. El motivo: un objeto libre permitía inventar
 * `{ clase: 'organismo-oficial', url: 'https://example.com' }` y pasar el check.
 * Acá cada entrada es un organismo real, con URL verificada con `curl` el día de
 * la consulta.
 *
 * Regla para agregar una entrada: verificar la URL con `curl` (HTTP 200) y
 * anotar `consultadoEl`. Cada fase de expansión (D4) agrega las suyas.
 *
 * Verificadas el 2026-09-02 (curl -A "Mozilla/5.0"):
 *   climate.gov/enso .......................................... 200
 *   climate.gov/news-features/blogs/enso/how-enso-… ........... 200
 *   cpc.ncep.noaa.gov/products/analysis_monitoring/impacts/… .. 200
 *   cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/elninosfc.shtml 200
 *   cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/laninasfc.shtml 200
 *
 * Re-verificadas el 2026-09-03 (curl -A "Mozilla/5.0", Plan 04 D4a), texto
 * idéntico — se agregan las entradas hermanas *NwPeru sobre las mismas dos URL:
 *   cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/elninosfc.shtml 200
 *   cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/laninasfc.shtml 200
 */

export const FUENTES = {
  // Reemplaza a climate.gov/enso, que se citaba para la definición de fase
  // neutral. Esa página NO contiene la frase citada, y además está desactualizada
  // —al 2026-09-02 seguía anunciando "Final La Niña Advisory, 10 de abril de
  // 2025"— mientras el CPC declara Advertencia de El Niño desde el 13-08-2026.
  // El FAQ del CPC sí trae la definición, textual.
  noaaCpcFaq: {
    organismo: 'NOAA Climate Prediction Center',
    clase: 'organismo-oficial',
    titulo: 'ENSO FAQ — What does ENSO-neutral mean?',
    url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensostuff/ensofaq.shtml',
    consultadoEl: '2026-09-02',
    seccion: 'What does ENSO-neutral mean?',
  },
  noaaEnsoCascada: {
    organismo: 'NOAA Climate.gov · ENSO Blog',
    clase: 'organismo-oficial',
    titulo: 'How ENSO leads to a cascade of global impacts',
    url: 'https://www.climate.gov/news-features/blogs/enso/how-enso-leads-cascade-global-impacts',
    consultadoEl: '2026-09-02',
    seccion: '«the most reliable effects of El Niño … excess rainfall in southeastern South America»',
  },
  noaaCpcImpactos: {
    organismo: 'NOAA Climate Prediction Center',
    clase: 'organismo-oficial',
    titulo: 'Typical ENSO impacts — El Niño / La Niña related climate anomalies',
    url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/impacts/enso.html',
    consultadoEl: '2026-09-02',
    seccion: 'South America — warm episodes / cold episodes (southern Brazil to central Argentina)',
  },
  noaaCpcElNino: {
    organismo: 'NOAA Climate Prediction Center',
    clase: 'organismo-oficial',
    titulo: 'Warm (El Niño) episodes — global temperature and precipitation patterns',
    url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/elninosfc.shtml',
    consultadoEl: '2026-09-02',
    seccion: 'Precipitation — DJF, wetter than normal over southern Brazil / central Argentina',
  },
  noaaCpcLaNina: {
    organismo: 'NOAA Climate Prediction Center',
    clase: 'organismo-oficial',
    titulo: 'Cold (La Niña) episodes — global temperature and precipitation patterns',
    url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/laninasfc.shtml',
    consultadoEl: '2026-09-02',
    seccion: 'Precipitation — JJA, drier than normal over southern Brazil / central Argentina',
  },

  // Entradas HERMANAS de noaaCpcElNino/noaaCpcLaNina (Plan 04 D4a): misma URL,
  // mismo `consultadoEl` re-verificado, pero acotadas al pasaje sobre Perú —
  // no se reusa la entrada de Brasil/Argentina porque `seccion` es por pasaje,
  // no por URL (protocolo de cita, punto 5). Nunca se tocan ni renombran las
  // entradas originales: Litoral las referencia por id y su hash depende de eso.
  // Sigue siendo la referencia correcta pese a no cambiar de un día a otro: es
  // una composición climatológica de décadas de eventos, no una página de
  // estado (protocolo de cita, punto 6). Re-verificado con `curl -A
  // "Mozilla/5.0"` el 2026-09-03, texto idéntico al de 2026-09-02.
  noaaCpcElNinoNwPeru: {
    organismo: 'NOAA Climate Prediction Center',
    clase: 'organismo-oficial',
    titulo: 'Warm (El Niño) episodes — global temperature and precipitation patterns',
    url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/elninosfc.shtml',
    consultadoEl: '2026-09-03',
    seccion:
      'Precipitation — «wetter than normal conditions tend to be observed 1) during December-February (DJF) along coastal Ecuador, northwestern Peru […]»',
  },
  noaaCpcLaNinaNwPeru: {
    organismo: 'NOAA Climate Prediction Center',
    clase: 'organismo-oficial',
    titulo: 'Cold (La Niña) episodes — global temperature and precipitation patterns',
    url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/ensocycle/laninasfc.shtml',
    consultadoEl: '2026-09-03',
    seccion:
      'Precipitation — «Drier than normal conditions are generally observed along coastal Ecuador, northwestern Peru […] during DJF»',
  },
} as const

export type FuenteId = keyof typeof FUENTES
export type Fuente = (typeof FUENTES)[FuenteId]

export function esFuenteId(x: string): x is FuenteId {
  return Object.prototype.hasOwnProperty.call(FUENTES, x)
}
