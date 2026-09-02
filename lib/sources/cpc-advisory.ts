/**
 * CPC ENSO Diagnostic Discussion — versión en español.
 *
 * Es el estado OFICIAL declarado por el CPC, y es la traducción de NOAA, no una
 * nuestra: relayarlo no nos hace interpretar ni traducir nada (README §8.2).
 * El README §2 ya señalaba que existe y casi nadie la conoce.
 *
 * Es la fuente más frágil del conjunto: HTML de los años 90 con <font> y tablas
 * anidadas, no un .txt de columnas fijas. Por eso el parser ancla en el TEXTO
 * —los rótulos del comunicado— y no en el markup, que puede cambiar sin aviso.
 *
 * Su fallo NUNCA debe tumbar la portada: si no se puede leer, se omite el
 * bloque y queda el enlace (Plan 01 B3.2).
 */

export const CPC_ADVISORY = {
  url: 'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc_Sp.shtml',
  urlIngles:
    'https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml',
  nombre: 'NOAA CPC',
  /** Se emite el segundo jueves de cada mes. */
  cadenciaMaximaDias: 45,
} as const

export type Advisory = {
  /** Ej. "Advertencia de El Niño". Textual del comunicado. */
  estado: string
  /** La sinopsis de una oración, textual. */
  sinopsis: string
  /** ISO 8601 de emisión. */
  fecha: string
  /** ISO 8601 de la próxima actualización, si el comunicado la declara. */
  proxima: string | null
}

const MESES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
}

function aTexto(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ntilde;/g, 'ñ').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í').replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú').replace(/&uuml;/g, 'ü')
    .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í').replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú')
    .replace(/&#37;/g, '%').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function fechaISO(texto: string): string | null {
  const m = /(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i.exec(texto)
  if (!m) return null
  const mes = MESES[m[2].toLowerCase()]
  if (!mes) return null
  return `${m[3]}-${String(mes).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}`
}

/** Primera línea con contenido real después del rótulo dado. */
function trasRotulo(lineas: string[], rotulo: RegExp, maxSalto = 6): string | null {
  const i = lineas.findIndex((l) => rotulo.test(l))
  if (i === -1) return null

  // El rótulo puede traer el valor pegado en la misma línea.
  const propia = lineas[i].replace(rotulo, '').trim()
  if (propia.length > 2) return propia

  for (let j = i + 1; j < Math.min(i + 1 + maxSalto, lineas.length); j++) {
    if (lineas[j].length > 2) return lineas[j]
  }
  return null
}

export function parseAdvisory(html: string): Advisory {
  const lineas = aTexto(html)
    .split('\n')
    .map((l) => l.replace(/[ \t ]+/g, ' ').trim())
    .filter(Boolean)

  const estado = trasRotulo(lineas, /Estatus del Sistema de alerta del ENSO:?/i)
  const sinopsis = trasRotulo(lineas, /Sinopsis:?/i)

  if (!estado) throw new Error('advisory: no se encontró el estado del sistema de alerta')
  if (!sinopsis) throw new Error('advisory: no se encontró la sinopsis')

  // La fecha de emisión es la primera del documento; la próxima actualización
  // aparece más adelante, en la línea que la anuncia.
  const fecha = fechaISO(lineas.join('\n'))
  if (!fecha) throw new Error('advisory: no se encontró la fecha de emisión')

  const lineaProxima = lineas.find(
    (l) => /próxima|proxima/i.test(l) && /\d{4}/.test(l),
  )
  const proxima = lineaProxima ? fechaISO(lineaProxima) : null

  return { estado, sinopsis, fecha, proxima }
}
