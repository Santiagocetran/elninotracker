import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parseWeekly } from '../lib/sources/cpc-weekly'
import { parseONI } from '../lib/sources/cpc-oni'
import { parseRONI } from '../lib/sources/cpc-roni'

const weekly = readFileSync('tests/fixtures/wksst9120.for', 'utf8')
const oni = readFileSync('tests/fixtures/oni.ascii.txt', 'utf8')
const roni = readFileSync('tests/fixtures/RONI.ascii.txt', 'utf8')

test('weekly: pisos de filas y extremos', () => {
  const s = parseWeekly(weekly)
  assert.ok(s.length >= 2000, `esperaba ≥ 2000 filas, hay ${s.length}`)
  assert.equal(s[0].fecha, '1981-09-02')
  assert.equal(s.at(-1)!.fecha, '2026-08-26')
  assert.equal(s.at(-1)!.nino34.anom, 2.6)
})

test('weekly: los valores pegados (23.4-0.4) no rompen el parser', () => {
  const s = parseWeekly(weekly)
  const fila = s.find((f) => f.fecha === '1996-01-03')
  assert.ok(fila, 'falta la fila pegada 03JAN1996')
  assert.equal(fila.nino12.sst, 23.4)
  assert.equal(fila.nino12.anom, -0.4)
})

test('oni: pisos de filas, arranque y última lectura', () => {
  const t = parseONI(oni)
  assert.equal(t.length, 918)
  assert.equal(t[0].temporada, 'DJF')
  assert.equal(t[0].anio, 1950)
  assert.equal(t[0].anom, -1.32)
  assert.equal(t.at(-1)!.temporada, 'MJJ')
  assert.equal(t.at(-1)!.anio, 2026)
  assert.equal(t.at(-1)!.anom, 1.39)
})

test('roni: 3 columnas, arranque y última lectura', () => {
  const r = parseRONI(roni)
  assert.equal(r.length, 918)
  assert.equal(r[0].temporada, 'DJF')
  assert.equal(r[0].anio, 1950)
  assert.equal(r[0].anom, -1.19)
  assert.equal(r.at(-1)!.temporada, 'MJJ')
  assert.equal(r.at(-1)!.anio, 2026)
  assert.equal(r.at(-1)!.anom, 0.98)
})
