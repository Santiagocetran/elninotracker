/**
 * Ensambla el estado agregado y validado a partir de las series parseadas.
 *
 * Acá se juntan las tres fuentes y se aplican los invariantes estructurales
 * (B2.2). La frescura —que depende del reloj— se exige en la ingesta estricta
 * y, en runtime, se muestra como degradación en vez de tirar abajo la página.
 */

import type { Dato, Fase, Intensidad } from './enso'
import { faseDesdeAnomalia, intensidadDesdeAnomalia } from './enso'
import { CPC_ONI, type TemporadaONI } from './sources/cpc-oni'
import { CPC_RONI, type TemporadaRONI } from './sources/cpc-roni'
import { CPC_WEEKLY, type SemanaCPC } from './sources/cpc-weekly'
import { fechasUnicasCrecientes, filasSuficientes, rangoFisico } from './validacion'

export type FrescuraItem = {
  /** Qué lectura se volvería vieja. */
  indice: string
  /** ISO 8601 de la última observación buena. */
  fecha: string
  /** Cadencia declarada por la fuente, en días. */
  cadenciaDias: number
}

export type EstadoInicio = {
  fase: Fase
  intensidad: Intensidad
  roni: Dato & { temporada: string }
  oni: Dato & { temporada: string }
  semanal: Dato
  frescura: FrescuraItem[]
}

export type Historico = {
  indice: 'ONI'
  fuente: { nombre: string; url: string }
  serie: { fecha: string; anom: number }[]
}

export type DatosInicio = {
  estado: EstadoInicio
  historico: Historico
  origen: 'noaa' | 'seed'
}

export function validarEstructural(
  semanas: SemanaCPC[],
  temporadas: TemporadaONI[],
  ronis: TemporadaRONI[],
) {
  filasSuficientes('wksst9120.for', semanas.length, 2000)
  filasSuficientes('oni.ascii.txt', temporadas.length, 900)
  filasSuficientes('RONI.ascii.txt', ronis.length, 900)

  // ONI y RONI son series históricas que arrancan en 1950. El weekly arranca en 1981.
  if (temporadas[0].temporada !== 'DJF' || temporadas[0].anio !== 1950) {
    throw new Error('oni.ascii.txt: no comienza en DJF 1950.')
  }
  if (ronis[0].temporada !== 'DJF' || ronis[0].anio !== 1950) {
    throw new Error('RONI.ascii.txt: no comienza en DJF 1950.')
  }

  fechasUnicasCrecientes('oni.ascii.txt', temporadas.map((t) => t.fecha))
  fechasUnicasCrecientes('RONI.ascii.txt', ronis.map((r) => r.fin))
  fechasUnicasCrecientes('wksst9120.for', semanas.map((s) => s.fecha))

  for (const s of semanas) {
    for (const r of [s.nino12, s.nino3, s.nino34, s.nino4] as const) {
      rangoFisico('weekly SST', r.sst, [10, 40])
      rangoFisico('weekly anomalía', r.anom, [-6, 6])
    }
  }
  for (const t of temporadas) {
    rangoFisico('ONI SST', t.sst, [18, 32])
    rangoFisico('ONI anomalía', t.anom, [-4, 4])
  }
  for (const r of ronis) {
    rangoFisico('RONI anomalía', r.anom, [-4, 4])
  }
}

export function armarDatos(
  semanas: SemanaCPC[],
  temporadas: TemporadaONI[],
  ronis: TemporadaRONI[],
  origen: 'noaa' | 'seed',
): DatosInicio {
  validarEstructural(semanas, temporadas, ronis)

  const ultimaSemana = semanas.at(-1)!
  const ultimoOni = temporadas.at(-1)!
  const ultimoRoni = ronis.at(-1)!

  const fuenteWeekly = { nombre: CPC_WEEKLY.nombre, url: CPC_WEEKLY.url }
  const fuenteOni = { nombre: CPC_ONI.nombre, url: CPC_ONI.url }
  const fuenteRoni = { nombre: CPC_RONI.nombre, url: CPC_RONI.url }

  const estado: EstadoInicio = {
    // El estado actual se describe con RONI (operativo desde feb-2026), no con ONI.
    fase: faseDesdeAnomalia(ultimoRoni.anom),
    intensidad: intensidadDesdeAnomalia(ultimoRoni.anom),
    roni: {
      valor: ultimoRoni.anom,
      indice: 'RONI',
      fecha: ultimoRoni.fin,
      temporada: ultimoRoni.temporada,
      fuente: fuenteRoni,
    },
    oni: {
      valor: ultimoOni.anom,
      indice: 'ONI',
      fecha: ultimoOni.fin,
      temporada: ultimoOni.temporada,
      fuente: fuenteOni,
    },
    semanal: {
      valor: ultimaSemana.nino34.anom,
      indice: 'Niño 3.4 semanal',
      fecha: ultimaSemana.fecha,
      fuente: fuenteWeekly,
    },
    frescura: [
      { indice: 'RONI', fecha: ultimoRoni.fin, cadenciaDias: CPC_RONI.cadenciaMaximaDias },
      { indice: 'Niño 3.4 semanal', fecha: ultimaSemana.fecha, cadenciaDias: CPC_WEEKLY.cadenciaMaximaDias },
    ],
  }

  const historico: Historico = {
    indice: 'ONI',
    fuente: fuenteOni,
    // La serie histórica usa la fecha del mes central: es la correcta para graficar.
    serie: temporadas.map((t) => ({ fecha: t.fecha, anom: t.anom })),
  }

  return { estado, historico, origen }
}
