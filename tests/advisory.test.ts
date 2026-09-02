import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parseAdvisory } from '../lib/sources/cpc-advisory'

const fixture = readFileSync('tests/fixtures/ensodisc_Sp.shtml', 'utf8')

test('advisory: extrae estado, sinopsis y fechas del comunicado en español', () => {
  const a = parseAdvisory(fixture)
  assert.equal(a.estado, 'Advertencia de El Niño')
  assert.match(a.sinopsis, /El Niño se está fortaleciendo/)
  assert.match(a.sinopsis, /90%/)
  assert.equal(a.fecha, '2026-08-13')
  assert.equal(a.proxima, '2026-09-10')
})

test('advisory: decodifica entidades HTML de los años 90', () => {
  const a = parseAdvisory(fixture)
  // El fixture trae &ntilde;, &aacute; y &#37; sin escapar en UTF-8.
  assert.ok(!a.estado.includes('&'), 'quedaron entidades sin decodificar en el estado')
  assert.ok(!a.sinopsis.includes('&'), 'quedaron entidades sin decodificar en la sinopsis')
})

test('advisory: falla ruidosamente si cambia el markup, no devuelve algo inventado', () => {
  assert.throws(() => parseAdvisory('<html><body>otra cosa</body></html>'), /estado del sistema/i)
  assert.throws(
    () => parseAdvisory('<html>Estatus del Sistema de alerta del ENSO: Advertencia</html>'),
    /sinopsis/i,
  )
})
