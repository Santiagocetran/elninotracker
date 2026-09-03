/**
 * Chrome de interfaz en castellano (Plan 02 D1).
 *
 * Acá vive TODO texto de interfaz que se renderiza. Ningún componente lleva
 * cadenas literales — la regla `react/jsx-no-literals` de ESLint lo verifica.
 *
 * Esto NO es el contenido editorial. Las afirmaciones sobre el clima de una
 * región viven en el esquema (`lib/regiones/…`), por locale, y las verifica un
 * validador de ids, no ESLint. Los dos se separan a propósito.
 */

export const es = {
  estado: {
    notaClasificacion: {
      pre: 'Ese número mide ',
      fuerte1: 'cuánto se aparta el Pacífico de su temperatura habitual',
      medio: ' en una zona del océano llamada ',
      fuerte2: 'Niño 3.4',
      post: ', frente a Ecuador y Perú. La etiqueta —débil, moderado, fuerte— la ponemos nosotros según ese valor. La última medición semanal dio ',
      cierrePre: ', el ',
      cierrePost: ' ',
    },
  },

  comoLeer: {
    titulo: 'Cómo leer estos números',
    roni: {
      nombre: 'RONI',
      texto: ' — el número que usa hoy el organismo de Estados Unidos que sigue el fenómeno. Promedia tres meses, así que cambia despacio. El de arriba es de ',
      cierre: '.',
      enlace: 'RONI · ',
    },
    semanal: {
      nombre: 'Niño 3.4 semanal',
      texto: ' — la observación más reciente (',
      cierre: '). Es la foto de una semana sola, así que salta más que el promedio: casi siempre se ve más extrema.',
      enlace: 'semanal · ',
    },
    oni: {
      nombre: 'ONI',
      texto: ' — el número que se usaba antes. Sirve para comparar con los eventos de las últimas décadas: es la línea que ves más abajo, desde 1950.',
      enlace: 'ONI · ',
    },
    advisory: {
      nombre: 'Estado oficial del CPC',
      texto: ' — lo que el organismo oficial dice en su comunicado mensual. No lo calculamos nosotros: lo copiamos tal cual y te dejamos el link.',
      enlace: 'ENSO Advisory →',
    },
  },

  oficial: {
    titulo: 'Qué dice el CPC',
    sinLeer: 'No pudimos leer el último comunicado automáticamente. ',
    sinLeerEnlace: 'LEERLO EN LA FUENTE →',
    rotulo: 'Estado oficial declarado',
    comunicadoDel: 'Comunicado del ',
    proximaActualizacion: ' · próxima actualización ',
    nota: 'Esto es lo que dice el comunicado oficial, traducido por la propia NOAA. Puede no coincidir con la etiqueta de más arriba, y no es un error: nosotros clasificamos mirando un solo número, y ellos miran además el viento, las nubes y lo que esperan para los próximos meses. ',
    notaEnlace: 'COMUNICADO COMPLETO →',
  },

  motor: {
    titulo: '¿Por qué pasa esto?',
    intro:
      'El Niño no empieza en el mar: empieza en el viento. Este es un corte del océano Pacífico visto de costado, desde Indonesia hasta la costa de Perú.',
    oeste: '← Indonesia',
    este: 'Perú →',
    rotulos: {
      caliente: 'agua caliente',
      fria: 'agua fría',
      viento: 'viento',
    },
    leyenda: {
      pileta: 'Agua caliente acumulada',
      termoclina: 'Dónde empieza el agua fría',
      viento: 'Viento que sopla hacia el oeste',
    },
    estados: {
      normal: {
        nombre: 'Un año normal',
        texto:
          'Casi siempre el viento sopla desde América hacia Asia y va empujando el agua caliente de la superficie hacia el oeste. Se amontona allá, del lado de Indonesia. Y como esa agua se va, del lado de Perú sube agua fría desde el fondo para reemplazarla: por eso el mar es frío en esa costa, y por eso hay tantos peces.',
        alt: 'Corte del Pacífico en año normal: el viento sopla hacia el oeste, el agua caliente se acumula del lado de Indonesia y frente a Perú sube agua fría.',
      },
      nino: {
        nombre: 'El Niño',
        texto:
          'A veces ese viento afloja. Cuando eso pasa, el agua caliente que estaba amontonada del lado de Indonesia se desparrama hacia el este, como agua en una bañadera cuando dejás de soplarla. Deja de subir agua fría frente a Perú y el Pacífico entero queda más caliente que de costumbre. Eso es El Niño. Y ese calor cambia por dónde llueve, no sólo ahí: en medio mundo.',
        alt: 'Corte del Pacífico durante El Niño: el viento se debilita, el agua caliente se extiende hacia el este y deja de subir agua fría frente a Perú.',
      },
      nina: {
        nombre: 'La Niña',
        texto:
          'Y a veces pasa lo contrario: el viento sopla más fuerte que de costumbre. Empuja todavía más agua caliente hacia Indonesia y hace subir más agua fría frente a Perú. El Pacífico queda más frío que de costumbre. Eso es La Niña, la otra cara del mismo fenómeno.',
        alt: 'Corte del Pacífico durante La Niña: el viento sopla más fuerte, el agua caliente se apila más al oeste y sube más agua fría frente a Perú.',
      },
    },
    nota:
      'Es un esquema para explicar el mecanismo, no una medición. Las proporciones están exageradas para que se vea: en la realidad el océano es miles de veces más ancho que profundo.',
  },

  significa: {
    titulo: '¿Qué significa para mí?',
    pendiente:
      'Todavía no publicamos los textos por región. Es la parte más útil del sitio y también la más fácil de arruinar, así que preferimos tardar.',
    entrada:
      'Qué suele pasar en cada lugar cuando el Pacífico está así. No es una predicción: es lo que se vio en eventos parecidos, y abajo de cada frase está de dónde sale.',
    faltan: 'Las demás regiones están en camino.',
  },

  historico: {
    titulo: 'Desde 1950',
    etiquetaSerie: 'Anomalía ONI · °C',
    enlace: 'ONI · ',
    descripcion: (a0: number, a1: number, ultimo: number) =>
      `Anomalía del índice ONI entre ${a0} y ${a1}. El punto más grande a la derecha es el valor más reciente: ${ultimo} grados.`,
  },

  mapa: {
    titulo: 'El mapa',
    intro:
      'La temperatura del mar en la superficie, comparada con lo habitual para la fecha. Es la imagen satelital de NASA, sin retocar: los colores son los que usa su leyenda.',
    fechaPrefijo: 'Imagen del ',
    leyendaTexto: 'Azul = más frío que lo habitual; rojo = más cálido que lo habitual.',
    leyendaAlt:
      'Leyenda oficial de NASA GIBS para la anomalía de temperatura del mar: de azul a rojo.',
    atribucion: (dataset: string, servicio: string, osm: string) =>
      `Imagen satelital de ${dataset} — servicio ${servicio}, contornos de ${osm}. `,
    datasetEnlace: 'DATASET · NASA PO.DAAC · doi:10.5067/GHGMR-4FJ04 →',
    vacio: 'No pudimos cargar el mapa ahora mismo. Podés verlo en NASA Worldview.',
    vacioEnlace: 'ABRIR EN NASA WORLDVIEW →',
  },

  fuentes: {
    titulo: 'Fuentes',
    roni: 'RONI — trimestre ',
    semanal: 'Niño 3.4 semanal — ',
    oni: 'ONI, serie histórica — hasta ',
    nota: 'Datos de dominio público de NOAA CPC.',
  },

  degradado: {
    titulo: 'Dato desactualizado',
    ultimaLectura: ' — última lectura ',
    hace: ' (hace ',
    dias: ' días).',
  },

  stat: {
    unidad: '°C',
    fuente: 'FUENTE: ',
    sep: ',',
  },

  comun: {
    flecha: ' →',
    separador: ' · ',
    trimestrePrefijo: 'trimestre ',
  },

  region: {
    volver: '← Volver a la portada',
    fraseEncuadre:
      'Esto es lo que suele pasar acá cuando el Pacífico está así. No es una predicción de lo que va a pasar este año: es lo que se vio en años parecidos.',
    faseActualRotulo: 'Fase actual, según el RONI',
    otrasFases: 'Las otras fases',
    sinFaseActual:
      'Ahora mismo no tenemos el dato para saber en qué fase estamos, así que te mostramos las tres.',
    evidencia: {
      consistente: 'Esto se repite en casi todos los eventos.',
      mixta: 'Esto no pasa siempre: hubo eventos en que no se notó.',
    },
    estacion: {
      'todo-el-año': 'Todo el año',
      'primavera-verano': 'Primavera y verano',
      'otoño-invierno': 'Otoño e invierno',
      primavera: 'Primavera',
      verano: 'Verano',
      otoño: 'Otoño',
      invierno: 'Invierno',
    },
    sinSenal: 'Sin señal documentada',
    fuentesRotulo: 'Fuentes de esta afirmación',
    consultado: 'consultado el ',
    borrador: {
      distintivo: 'BORRADOR — SIN REVISAR',
      explicacion:
        'Todavía nadie revisó este texto. Puede cambiar o tener errores. Por eso no lo enlazamos desde la portada ni aparece en Google.',
    },
    fases: {
      nino: 'El Niño',
      nina: 'La Niña',
      neutral: 'Neutral',
    },
  },
} as const

export type Diccionario = typeof es
