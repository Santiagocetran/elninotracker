/**
 * Presupuesto de JS del mapa (Plan 03 D5, decisión 2 y 10).
 *
 * Dos fases:
 *   (a) Estructural y barata: diff de `route-bundle-stats.json` entre `/[lang]`
 *       y `/[lang]/regiones/[region]`, gzipeado, contra 15 KB; y que ningún
 *       chunk diferido (react-loadable-manifest) ni maplibre esté en el bundle
 *       de entrada.
 *   (b) Autoritativa con navegador real: bytes de red antes/después del scroll,
 *       fallback con tiles GIBS bloqueados, y ciclo de montaje/desmontaje contra
 *       `next dev` (Strict Mode).
 *
 * Necesita `.next` generado (`pnpm build`); si falta, lo genera. Sale con 1 y
 * mensaje explícito ante cualquier violación, igual que `check-design.ts`.
 */

import { spawn, type ChildProcess } from 'node:child_process'
import { createServer } from 'node:net'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { chromium } from 'playwright'
import { es } from '../lib/diccionarios/es'

const RAIZ = process.cwd()
const NEXT_BIN = join(RAIZ, 'node_modules', 'next', 'dist', 'bin', 'next')
const ROUTE_STATS = join(RAIZ, '.next', 'diagnostics', 'route-bundle-stats.json')
const LOADABLE = join(
  RAIZ,
  '.next',
  'server',
  'app',
  '[lang]',
  'page',
  'react-loadable-manifest.json',
)
const TECHO_INCREMENTAL = 15 * 1024
const TECHO_MAPA = 260 * 1024

let violaciones = 0
function mal(mensaje: string) {
  console.error('  ✗', mensaje)
  violaciones++
}
function ok(mensaje: string) {
  console.log('  ✓', mensaje)
}

// ---- utilidades de servidor ---------------------------------------------

function puertoLibre(): Promise<number> {
  return new Promise((resolver, rechazar) => {
    const srv = createServer()
    srv.listen(0, '127.0.0.1', () => {
      const address = srv.address()
      if (address && typeof address === 'object') {
        const puerto = address.port
        srv.close(() => resolver(puerto))
      } else {
        srv.close(() => rechazar(new Error('no pude reservar un puerto')))
      }
    })
  })
}

function lanzar(args: string[]): ChildProcess {
  const p = spawn(process.execPath, [NEXT_BIN, ...args], {
    cwd: RAIZ,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  })
  p.stdout?.on('data', () => {})
  p.stderr?.on('data', () => {})
  return p
}

async function esperarHttp(url: string, timeoutMs: number): Promise<void> {
  const inicio = Date.now()
  return new Promise((resolver, rechazar) => {
    const intentar = async () => {
      try {
        const r = await fetch(url)
        if (r.ok) return resolver()
      } catch {
        // el proceso todavía no atiende
      }
      if (Date.now() - inicio > timeoutMs) {
        return rechazar(new Error(`timeout esperando ${url}`))
      }
      setTimeout(intentar, 500)
    }
    intentar()
  })
}

async function detener(p: ChildProcess): Promise<void> {
  if (!p || p.exitCode !== null) return
  p.kill('SIGTERM')
  await new Promise((resolver) => {
    const t = setTimeout(() => {
      p.kill('SIGKILL')
      resolver(undefined)
    }, 3000)
    p.once('exit', () => {
      clearTimeout(t)
      resolver(undefined)
    })
  })
}

// ---- fase (a): estructural ----------------------------------------------

type EntradaRuta = {
  route: string
  firstLoadUncompressedJsBytes: number
  firstLoadChunkPaths: string[]
}

function cargarRouteStats(): EntradaRuta[] {
  if (!existsSync(ROUTE_STATS)) {
    throw new Error(`falta ${ROUTE_STATS}; corré pnpm build primero`)
  }
  return JSON.parse(readFileSync(ROUTE_STATS, 'utf8')) as EntradaRuta[]
}

function chunksDe(entradas: EntradaRuta[], route: string): string[] {
  const entrada = entradas.find((x) => x.route === route)
  if (!entrada) throw new Error(`no encontré la ruta ${route} en route-bundle-stats.json`)
  return entrada.firstLoadChunkPaths
}

function archivosDeLoadable(): string[] {
  if (!existsSync(LOADABLE)) return []
  const salida: string[] = []
  const caminar = (v: unknown) => {
    if (typeof v === 'string' && v.includes('/static/chunks/')) {
      salida.push(v.startsWith('.next/') ? v : join('.next', v))
    } else if (Array.isArray(v)) {
      v.forEach(caminar)
    } else if (v && typeof v === 'object') {
      Object.values(v).forEach(caminar)
    }
  }
  caminar(JSON.parse(readFileSync(LOADABLE, 'utf8')) as unknown)
  return salida
}

function gz(archivo: string): number {
  return gzipSync(readFileSync(join(RAIZ, archivo))).length
}

function checkEstructural() {
  console.log('▸ Diff estructural del bundle de entrada')
  const entradas = cargarRouteStats()
  const pagina = new Set(chunksDe(entradas, '/[lang]'))
  const region = new Set(chunksDe(entradas, '/[lang]/regiones/[region]'))
  const diff = [...pagina].filter((p) => !region.has(p))

  let bytes = 0
  for (const p of diff) bytes += gz(p)

  if (bytes > TECHO_INCREMENTAL) {
    mal(`diff gzipeado ${bytes} b > ${TECHO_INCREMENTAL} b`)
  } else {
    ok(`diff incremental gzipeado: ${bytes} b (≤ ${TECHO_INCREMENTAL} b)`)
  }

  for (const p of pagina) {
    const contenido = readFileSync(join(RAIZ, p), 'utf8')
    if (/maplibre/i.test(contenido)) {
      mal(`${p} contiene maplibre en el bundle de entrada`)
    }
  }

  const loadables = archivosDeLoadable()
  const colados = loadables.filter((p) => pagina.has(p))
  if (colados.length > 0) {
    mal(`chunks diferidos colaron al bundle de entrada: ${colados.join(', ')}`)
  } else {
    ok('ningún chunk diferido (MapaCliente) está en el bundle de entrada')
  }
}

// ---- fase (b): navegador real -------------------------------------------

type Recurso = { url: string; tipo: string }

/**
 * Tamaño gzipeado del archivo servido en `url`. `next start` sí comprime
 * (`Content-Encoding: gzip`), pero lo hace con `Transfer-Encoding: chunked` y
 * sin `Content-Length` — no hay un tamaño de red que leer del header. Se
 * recalcula gzip sobre el archivo en disco como proxy: verificado contra el
 * tamaño real de un chunk servido (7315 b reales vs 7309 b acá, ~0,1% de
 * diferencia), suficiente para un techo en KB.
 */
function gzipDesdeUrl(url: string): number {
  const pathname = new URL(url).pathname.replace(/^\/_next\//, '.next/')
  const archivo = join(RAIZ, pathname)
  if (!existsSync(archivo)) return 0
  return gzipSync(readFileSync(archivo)).length
}

function sumarGzip(lista: Recurso[]): number {
  return lista.reduce((acc, r) => acc + gzipDesdeUrl(r.url), 0)
}

async function urlsDePagina(
  browser: import('playwright').Browser,
  puerto: number,
  ruta: string,
): Promise<Set<string>> {
  const page = await browser.newPage()
  const urls = new Set<string>()
  page.on('response', (res) => {
    const tipo = res.request().resourceType()
    if (tipo === 'script' || tipo === 'stylesheet') urls.add(res.url())
  })
  await page.goto(`http://127.0.0.1:${puerto}${ruta}`, { waitUntil: 'networkidle' })
  await page.close()
  return urls
}

async function presupuestoRed(browser: import('playwright').Browser, puerto: number) {
  console.log('▸ Presupuesto de red con navegador real')

  // La región no renderiza el mapa: es la línea de base del costo incremental.
  const base = await urlsDePagina(browser, puerto, '/es/regiones/litoral')

  const page = await browser.newPage()
  const recursos: Recurso[] = []
  page.on('response', (res) => {
    const tipo = res.request().resourceType()
    if (tipo !== 'script' && tipo !== 'stylesheet') return
    recursos.push({ url: res.url(), tipo })
  })

  await page.goto(`http://127.0.0.1:${puerto}/es`, { waitUntil: 'networkidle' })

  const antes = recursos.slice()
  const incrementales = antes.filter((r) => !base.has(r.url))
  const bytesAntes = sumarGzip(incrementales)
  const conMapLibreAntes = incrementales.filter((r) => /maplibre/i.test(r.url))

  if (bytesAntes > TECHO_INCREMENTAL) {
    mal(`costo incremental antes del scroll ${bytesAntes} b > ${TECHO_INCREMENTAL} b`)
  } else {
    ok(`antes del scroll: +${bytesAntes} b de script+style (≤ ${TECHO_INCREMENTAL} b)`)
  }
  if (conMapLibreAntes.length > 0) {
    mal(`maplibre en el bundle de entrada: ${conMapLibreAntes.map((r) => r.url).join(', ')}`)
  } else {
    ok('sin maplibre antes del scroll')
  }

  await page.locator('.mapa').scrollIntoViewIfNeeded()
  await page
    .waitForFunction(
      () => (window as unknown as { __mapaMontajes?: number }).__mapaMontajes === 1,
      undefined,
      { timeout: 15_000 },
    )
    .catch(() => {})
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(500)

  const nuevos = recursos.filter((r) => !antes.includes(r))
  const bytesNuevos = sumarGzip(nuevos)

  if (bytesNuevos > TECHO_MAPA) {
    mal(`bytes nuevos del mapa ${bytesNuevos} > ${TECHO_MAPA}`)
  } else {
    ok(`después del scroll: +${bytesNuevos} b de script+style (≤ ${TECHO_MAPA} b)`)
  }

  const montajes = await page.evaluate(
    () => (window as unknown as { __mapaMontajes?: number }).__mapaMontajes,
  )
  if (montajes !== 1) {
    mal(`esperaba 1 mapa montado en producción, hay ${montajes}`)
  } else {
    ok('el mapa montó en producción')
  }

  await page.close()
}

async function fallbackTilesBloqueados(browser: import('playwright').Browser, puerto: number) {
  console.log('▸ Fallback con tiles GIBS bloqueados')
  const page = await browser.newPage()
  await page.route('**/gibs.earthdata.nasa.gov/**/*.png', (route) => route.abort())

  await page.goto(`http://127.0.0.1:${puerto}/es`, { waitUntil: 'networkidle' })
  await page.locator('.mapa').scrollIntoViewIfNeeded()
  await page.waitForSelector('.mapa__vacio', { timeout: 15_000 })

  const texto = await page.locator('.mapa__vacio').innerText()
  if (!texto.includes(es.mapa.vacio)) {
    mal('MapaVacio no muestra el texto esperado')
  } else {
    ok('MapaVacio aparece con los tiles bloqueados')
  }

  await page.close()
}

async function faseStrictMode(puerto: number) {
  console.log('▸ Ciclo montaje/desmontaje contra next dev (Strict Mode)')
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=swiftshader', '--enable-webgl'],
  })
  try {
    const page = await browser.newPage()
    const errores: string[] = []
    page.on('pageerror', (e) => errores.push(`pageerror: ${e.message}`))
    page.on('console', (m) => {
      if (m.type() === 'error') errores.push(`console.error: ${m.text()}`)
    })

    // `next dev` bloquea sus recursos dev (HMR, chunks) para orígenes que no
    // sean `localhost`; usar 127.0.0.1 acá rompe la hidratación.
    await page.goto(`http://localhost:${puerto}/es`, {
      waitUntil: 'networkidle',
      timeout: 120_000,
    })
    await page.locator('.mapa').scrollIntoViewIfNeeded()
    await page
      .waitForFunction(
        () => (window as unknown as { __mapaMontajes?: number }).__mapaMontajes === 1,
        undefined,
        { timeout: 30_000 },
      )
      .catch(() => {})
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(500)

    const montajes = await page.evaluate(
      () => (window as unknown as { __mapaMontajes?: number }).__mapaMontajes,
    )
    if (montajes !== 1) {
      mal(`Strict Mode: esperaba 1 mapa montado (neto), hay ${montajes}`)
      for (const e of errores.slice(0, 5)) console.error('    ', e)
    } else {
      ok('Strict Mode: el doble montaje quedó en 1 (cada montaje tuvo su remove)')
    }

    await page.close()
  } finally {
    await browser.close()
  }
}

// ---- corrida -------------------------------------------------------------

async function main() {
  if (!existsSync(ROUTE_STATS)) {
    console.log('▸ No hay .next; corriendo next build…')
    const build = lanzar(['build'])
    const code = await new Promise<number>((resolver) => build.once('exit', resolver))
    if (code !== 0) {
      console.error('next build falló')
      process.exit(1)
    }
  }

  checkEstructural()

  const puertoStart = await puertoLibre()
  const start = lanzar(['start', '-p', String(puertoStart)])
  try {
    await esperarHttp(`http://127.0.0.1:${puertoStart}/es`, 120_000)
    const browser = await chromium.launch({
      headless: true,
      args: ['--use-gl=swiftshader', '--enable-webgl'],
    })
    try {
      await presupuestoRed(browser, puertoStart)
      await fallbackTilesBloqueados(browser, puertoStart)
    } finally {
      await browser.close()
    }
  } finally {
    await detener(start)
  }

  const puertoDev = await puertoLibre()
  const dev = lanzar(['dev', '-p', String(puertoDev)])
  try {
    await esperarHttp(`http://127.0.0.1:${puertoDev}/es`, 180_000)
    await faseStrictMode(puertoDev)
  } finally {
    await detener(dev)
  }

  if (violaciones > 0) {
    console.error(`\ncheck:mapa FALLÓ (${violaciones} violaciones)`)
    process.exit(1)
  }
  console.log('\ncheck:mapa ✓')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
