import { test } from 'node:test'
import assert from 'node:assert/strict'
import { frasePacífico } from '../lib/copy'
import {
  etiquetaEstado,
  faseDesdeAnomalia,
  intensidadDesdeAnomalia,
} from '../lib/enso'
import { exigirFrescura } from '../lib/validacion'

test('fase cálida: frase correcta y género concordante', () => {
  assert.equal(faseDesdeAnomalia(0.98), 'nino')
  assert.equal(intensidadDesdeAnomalia(0.98), 'debil')
  assert.equal(etiquetaEstado('nino', 'debil'), 'El Niño · débil')
  assert.equal(
    frasePacífico('nino', 1.39),
    'El Pacífico ecuatorial está 1,4 °C más caliente que lo normal para esta época.',
  )
})

test('fase fría: dice más frío, no más caliente', () => {
  assert.equal(faseDesdeAnomalia(-0.91), 'nina')
  assert.equal(etiquetaEstado('nina', 'moderado'), 'La Niña · moderada')
  assert.equal(
    frasePacífico('nina', -1.2),
    'El Pacífico ecuatorial está 1,2 °C más frío que lo normal para esta época.',
  )
})

test('fase neutral: sin intensidad y sin dirección', () => {
  assert.equal(faseDesdeAnomalia(0.2), 'neutral')
  assert.equal(intensidadDesdeAnomalia(0.2), null)
  assert.equal(etiquetaEstado('neutral', null), 'Neutral')
  assert.equal(
    frasePacífico('neutral', 0.2),
    'El Pacífico ecuatorial está cerca de lo normal para esta época.',
  )
})

test('una fecha futura no pasa el control de frescura', () => {
  const ahora = Date.parse('2026-09-02T00:00:00Z')
  assert.throws(
    () => exigirFrescura('prueba', '2099-01-01', 10, ahora),
    /FECHA FUTURA/,
  )
})

test('una observación vieja tampoco pasa el control de frescura', () => {
  const ahora = Date.parse('2026-09-02T00:00:00Z')
  assert.throws(
    () => exigirFrescura('prueba', '2026-01-01', 10, ahora),
    /DATO RANCIO/,
  )
})
