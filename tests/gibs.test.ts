import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolverTileGIBS } from '../lib/sources/gibs'

/**
 * `resolverTileGIBS` con `fetch` mockeado (Plan 03 D5). Se restaura
 * `globalThis.fetch` en cada test. El contrato que se prueba es el de la
 * decisión 1: DescribeDomains → confirmación → sondeo, y ningún paso lanza.
 */

const HOY = new Date(Date.UTC(2026, 8, 3))

function respuesta(ok: boolean, status: number, texto = '') {
  return { ok, status, text: async () => texto } as unknown as Response
}

type Registro = { url: string; method: string }

function instalarFetch(handler: (url: string, method: string) => Promise<Response>) {
  const original = globalThis.fetch
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    return handler(String(input), (init?.method ?? 'GET').toUpperCase())
  }) as typeof fetch
  return () => {
    globalThis.fetch = original
  }
}

function fechaDesdeUrl(url: string): string {
  const m = /\/default\/(\d{4}-\d{2}-\d{2})\//.exec(url)
  return m?.[1] ?? ''
}

test('DescribeDomains reciente + HEAD de confirmación → usa esa fecha sin sondear', async () => {
  const registros: Registro[] = []
  const restaurar = instalarFetch(async (url, method) => {
    registros.push({ url, method })
    if (method === 'GET') {
      return respuesta(true, 200, '<Domain>2026-08-28/2026-09-02/P1D</Domain>')
    }
    return respuesta(true, 200)
  })

  try {
    const tile = await resolverTileGIBS(HOY)
    assert.equal(tile, '2026-09-02')
    assert.equal(registros.filter((r) => r.method === 'HEAD').length, 1)
  } finally {
    restaurar()
  }
})

test('DescribeDomains falla → sondeo día por día; 404/429 se saltan', async () => {
  const registros: Registro[] = []
  const restaurar = instalarFetch(async (url, method) => {
    registros.push({ url, method })
    if (method === 'GET') return respuesta(false, 500)
    const fecha = fechaDesdeUrl(url)
    if (fecha === '2026-09-03') return respuesta(false, 404)
    if (fecha === '2026-09-02') return respuesta(false, 429)
    if (fecha === '2026-09-01') return respuesta(true, 200)
    return respuesta(false, 404)
  })

  try {
    const tile = await resolverTileGIBS(HOY)
    assert.equal(tile, '2026-09-01')
    const headFechas = registros
      .filter((r) => r.method === 'HEAD')
      .map((r) => fechaDesdeUrl(r.url))
    assert.deepEqual(headFechas, ['2026-09-03', '2026-09-02', '2026-09-01'])
  } finally {
    restaurar()
  }
})

test('error de red en todos los pasos → null, sin lanzar', async () => {
  const restaurar = instalarFetch(async () => {
    throw new Error('red caída')
  })

  try {
    assert.equal(await resolverTileGIBS(HOY), null)
  } finally {
    restaurar()
  }
})

test('candidata de DescribeDomains no confirmada y ventana sin nada → null', async () => {
  const restaurar = instalarFetch(async (url, method) => {
    if (method === 'GET') {
      return respuesta(true, 200, '<Domain>2026-08-28/2026-09-02/P1D</Domain>')
    }
    return respuesta(false, 404)
  })

  try {
    assert.equal(await resolverTileGIBS(HOY), null)
  } finally {
    restaurar()
  }
})
