import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { armarDatos } from '../lib/armado'
import { parseWeekly } from '../lib/sources/cpc-weekly'
import { parseONI } from '../lib/sources/cpc-oni'
import { parseRONI } from '../lib/sources/cpc-roni'

test('el estado actual se clasifica con RONI, no con ONI', () => {
  const datos = armarDatos(
    parseWeekly(readFileSync('tests/fixtures/wksst9120.for', 'utf8')),
    parseONI(readFileSync('tests/fixtures/oni.ascii.txt', 'utf8')),
    parseRONI(readFileSync('tests/fixtures/RONI.ascii.txt', 'utf8')),
    'noaa',
  )

  // MJJ 2026: ONI +1,39 (moderado) vs RONI +0,98 (débil). La portada no debe sobredeclarar.
  assert.equal(datos.estado.roni.valor, 0.98)
  assert.equal(datos.estado.oni.valor, 1.39)
  assert.equal(datos.estado.fase, 'nino')
  assert.equal(datos.estado.intensidad, 'debil')
  assert.equal(datos.estado.semanal.valor, 2.6)
})
