import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { PanelRegion } from '../components/PanelRegion'
import { getDiccionario } from '../lib/diccionarios'
import { FUENTES } from '../lib/regiones/fuentes'
import { litoral } from '../lib/regiones/litoral'
import { es } from '../lib/diccionarios/es'
import { generateMetadata } from '../app/[lang]/regiones/[region]/page'

const d = getDiccionario('es')

function render(faseActual: 'nino' | 'nina' | 'neutral' | null) {
  return renderToStaticMarkup(
    <PanelRegion clima={litoral} lang="es" faseActual={faseActual} d={d} />,
  )
}

test('el panel en borrador muestra el distintivo visible', () => {
  const html = render('nino')
  assert.ok(
    html.includes(es.region.borrador.distintivo),
    'falta el sello BORRADOR',
  )
  assert.ok(html.includes(es.region.borrador.explicacion))
})

test('el panel enlaza a todas las fuentes citadas', () => {
  const html = render('nino')
  const idsUsados = new Set<string>()
  for (const fase of ['nino', 'nina', 'neutral'] as const) {
    for (const a of litoral.porFase[fase]) for (const id of a.fuentes) idsUsados.add(id)
  }
  assert.ok(idsUsados.size >= 3)
  for (const id of idsUsados) {
    assert.ok(
      html.includes(`href="${FUENTES[id as keyof typeof FUENTES].url}"`),
      `falta el enlace a la fuente ${id}`,
    )
  }
})

test('la fase actual (RONI) se marca como tal y aparece primero', () => {
  const html = render('nino')
  assert.ok(html.includes(es.region.faseActualRotulo))
  const posNino = html.indexOf(es.region.fases.nino)
  const posOtras = html.indexOf(es.region.otrasFases)
  assert.ok(posNino > -1 && posOtras > -1 && posNino < posOtras)
})

test('sin fase de RONI se muestran las tres, sin adivinar', () => {
  const html = render(null)
  assert.ok(html.includes(es.region.sinFaseActual))
  assert.ok(!html.includes(es.region.otrasFases))
  for (const f of ['nino', 'nina', 'neutral'] as const) {
    assert.ok(html.includes(es.region.fases[f]), `falta la fase ${f}`)
  }
})

test('la ruta del borrador declara noindex y no emite canonical', async () => {
  const m = await generateMetadata({
    params: Promise.resolve({ lang: 'es', region: 'litoral' }),
  })
  assert.deepEqual(m.robots, { index: false, follow: true })
  assert.equal(m.alternates, undefined)
})

test('el panel encuadra el contenido como asociación histórica, no pronóstico', () => {
  const html = render('nino')
  assert.ok(html.includes(es.region.fraseEncuadre))
  assert.ok(html.includes('El sudeste de Sudamérica es una de las zonas'))
})
