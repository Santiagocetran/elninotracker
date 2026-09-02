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
      pre: 'La fase y la intensidad de arriba son una ',
      fuerte1: 'clasificación descriptiva por umbral',
      medio: ' sobre el ',
      fuerte2: 'RONI',
      post: ', el índice operativo del CPC desde febrero de 2026. La observación más reciente en la región Niño 3.4 es ',
      cierrePre: ' para la semana del ',
      cierrePost: ' ',
    },
  },

  comoLeer: {
    titulo: 'Cómo leer estos números',
    roni: {
      nombre: 'RONI',
      texto: ' — índice operativo actual del CPC. La lectura de arriba es del trimestre ',
      cierre: '.',
      enlace: 'RONI · ',
    },
    semanal: {
      nombre: 'Niño 3.4 semanal',
      texto: ' — la observación más reciente (',
      cierre: '). Es instantánea y por eso siempre más extrema que un promedio de tres meses.',
      enlace: 'semanal · ',
    },
    oni: {
      nombre: 'ONI',
      texto: ' — contexto y comparación histórica. Es la línea de abajo, desde 1950, y ya no se usa para describir el estado actual.',
      enlace: 'ONI · ',
    },
    advisory: {
      nombre: 'Estado oficial del CPC',
      texto: ' — lo que el CPC declara en su comunicado ENSO. Este sitio no lo calcula: lo relaya.',
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
    nota: 'Es la traducción oficial de NOAA, citada textualmente. La clasificación de arriba, en cambio, es nuestra lectura por umbral del RONI: pueden no coincidir, porque el CPC pondera además atmósfera, pronósticos y juicio experto. ',
    notaEnlace: 'COMUNICADO COMPLETO →',
  },

  significa: {
    titulo: '¿Qué significa para mí?',
    pendiente:
      'Los paneles de impacto por región todavía no están publicados. Es la parte de mayor valor del sitio y la de mayor riesgo editorial, así que no se improvisa.',
    entrada:
      'Lo que suele pasar en cada región durante esta fase, según el registro histórico y con la fuente de cada afirmación a la vista.',
    faltan: 'Las demás regiones todavía no están publicadas.',
  },

  historico: {
    titulo: 'Desde 1950',
    etiquetaSerie: 'Anomalía ONI · °C',
    enlace: 'ONI · ',
    descripcion: (a0: number, a1: number, ultimo: number) =>
      `Anomalía del índice ONI entre ${a0} y ${a1}. El punto más grande a la derecha es el valor más reciente: ${ultimo} grados.`,
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
      'Esto es lo que suele pasar en esta región durante una fase así, según el registro histórico. No es un pronóstico del evento en curso.',
    faseActualRotulo: 'Fase actual, según el RONI',
    otrasFases: 'Las otras fases',
    sinFaseActual:
      'Ahora mismo no se puede determinar la fase con el RONI, así que se muestran las tres.',
    evidencia: {
      consistente: 'La señal aparece de forma consistente entre eventos.',
      mixta: 'La señal es mixta: no todos los eventos la expresan igual.',
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
        'Este panel todavía no pasó revisión editorial. El texto puede cambiar o contener errores. No está enlazado desde la portada ni indexado por buscadores.',
    },
    fases: {
      nino: 'El Niño',
      nina: 'La Niña',
      neutral: 'Neutral',
    },
  },
} as const

export type Diccionario = typeof es
