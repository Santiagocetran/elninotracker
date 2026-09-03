import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { Mapa } from '../components/Mapa'
import { getDiccionario } from '../lib/diccionarios'
import { es } from '../lib/diccionarios/es'
import { GIBS } from '../lib/sources/gibs'

const d = getDiccionario('es')

test('con tile, el bloque cita dataset, fecha, DOI/PO.DAAC, GIBS y OSM', () => {
  const html = renderToStaticMarkup(<Mapa tile="2026-09-02" d={d} />)

  assert.ok(html.includes(GIBS.dataset.nombre), 'falta el nombre del dataset')
  assert.ok(html.includes('2 sep 2026'), 'falta la fecha del tile')
  assert.ok(html.includes(`href="${GIBS.dataset.doiUrl}"`), 'falta el link al DOI')
  assert.ok(html.includes(es.mapa.datasetEnlace), 'falta la etiqueta del link al dataset')
  assert.ok(html.includes(GIBS.servicio.nombre), 'falta la mención a NASA GIBS')
  assert.ok(html.includes(GIBS.osm.nombre), 'falta la mención a OpenStreetMap')
})

test('sin tile, aparece el link a Worldview y no hay canvas ni maplibre', () => {
  const html = renderToStaticMarkup(<Mapa tile={null} d={d} />)

  assert.ok(html.includes(`href="${GIBS.worldviewUrl}"`), 'falta el link a Worldview')
  assert.ok(html.includes(es.mapa.vacio), 'falta el texto de estado vacío')
  assert.ok(!html.includes('<canvas'), 'no debe haber canvas sin tile')
  assert.ok(!html.toLowerCase().includes('maplibre'), 'no debe mencionar maplibre sin tile')
})
