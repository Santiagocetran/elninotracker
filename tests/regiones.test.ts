import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FUENTES } from '../lib/regiones/fuentes'
import { hashContenido, estadoEfectivo, type Climatologia } from '../lib/regiones/esquema'
import { validarClimatologia } from '../lib/regiones/validar'
import { litoral } from '../lib/regiones/litoral'
import { REGIONES, idsDeRegiones, regionesPublicas } from '../lib/regiones/index'
import { generateMetadata } from '../app/[lang]/regiones/[region]/page'
import sitemap from '../app/sitemap'

test('la región piloto valida sin errores', () => {
  assert.deepEqual(validarClimatologia(litoral), [])
})

test('las tres fases existen y ninguna está vacía', () => {
  for (const fase of ['nino', 'nina', 'neutral'] as const) {
    assert.ok(litoral.porFase[fase].length >= 1, `fase ${fase} vacía`)
  }
})

test('toda afirmación cita fuentes del registro cerrado, con URL https', () => {
  for (const fase of ['nino', 'nina', 'neutral'] as const) {
    for (const a of litoral.porFase[fase]) {
      assert.ok(a.fuentes.length >= 1, `afirmación sin fuentes en ${fase}`)
      for (const id of a.fuentes) {
        const f = FUENTES[id]
        assert.ok(f, `fuente desconocida: ${id}`)
        assert.match(f.url, /^https:\/\//)
        assert.ok(f.consultadoEl, `fuente ${id} sin fecha de consulta`)
      }
    }
  }
})

test('el Litoral está revisado por el dueño, con hash vigente', () => {
  const e = estadoEfectivo(litoral)
  assert.equal(e.estado, 'revisado')
  // estadoEfectivo degrada a 'borrador' si el hash no coincide, así que llegar
  // acá prueba que el hash congelado corresponde al contenido actual.
  assert.ok(e.estado === 'revisado' && e.autor.length > 0, 'revisión sin autor')
})

test('revisado por el dueño NO es validado por un especialista', () => {
  // Distinción del Plan 02 D0.1: el sitio no debe insinuar una autoridad que
  // no tiene. Mientras no haya especialista acreditado, no puede ser 'validado'.
  assert.notEqual(estadoEfectivo(litoral).estado, 'validado')
})

test('una revisión vigente se conserva; editar el texto la degrada a borrador', () => {
  const hash = hashContenido(litoral.porFase)
  const revisado: Climatologia = {
    ...litoral,
    revision: {
      estado: 'revisado',
      autor: 'dueño',
      fecha: '2026-09-02',
      hashContenido: hash,
    },
  }
  assert.equal(estadoEfectivo(revisado).estado, 'revisado')

  // Mutar el texto de una afirmación ya revisada.
  const editado: Climatologia = structuredClone(revisado)
  const primera = editado.porFase.nino[0]
  primera.texto.es = (primera.texto.es ?? '') + ' (edición posterior)'

  assert.equal(
    estadoEfectivo(editado).estado,
    'borrador',
    'editar el texto revisado debe degradar el estado por hash',
  )
})

test('el hash también cambia si cambia una traducción, una fuente o la estación', () => {
  const base = hashContenido(litoral.porFase)

  const conTraduccion = structuredClone(litoral)
  conTraduccion.porFase.nina[0].texto.pt = 'texto pt'
  assert.notEqual(hashContenido(conTraduccion.porFase), base)

  const conFuente = structuredClone(litoral)
  const af = conFuente.porFase.nina[0]
  if (af.clase === 'documentada') {
    ;(af.fuentes as unknown as string[]).push('noaaEnso')
  }
  assert.notEqual(hashContenido(conFuente.porFase), base)

  const conEstacion = structuredClone(litoral)
  const af2 = conEstacion.porFase.nino[0]
  if (af2.clase === 'documentada') af2.estacion = 'todo-el-año'
  assert.notEqual(hashContenido(conEstacion.porFase), base)
})

test('el validador editorial falla si una afirmación no cubre los locales activos', () => {
  const roto: Climatologia = structuredClone(litoral)
  roto.porFase.nino[0].texto = {} // sin 'es'
  const errores = validarClimatologia(roto)
  assert.ok(
    errores.some((e) => e.includes('locale activo "es"')),
    `esperaba un error de cobertura de locale, obtuve: ${JSON.stringify(errores)}`,
  )
})

test('el validador rechaza probabilidad y futuro categórico en el texto', () => {
  const conProb: Climatologia = structuredClone(litoral)
  conProb.porFase.nino[0].texto.es = 'Hay 70% de probabilidad de lluvias.'
  assert.ok(validarClimatologia(conProb).some((e) => /probabilidad/i.test(e)))

  const conFuturo: Climatologia = structuredClone(litoral)
  conFuturo.porFase.nino[0].texto.es = 'El Paraná va a desbordar en primavera.'
  assert.ok(validarClimatologia(conFuturo).some((e) => /condicional/i.test(e)))
})

test('el validador rechaza una fuente que no está en el registro', () => {
  const roto: Climatologia = structuredClone(litoral)
  ;(roto.porFase.nino[0].fuentes as unknown as string[]).push('inventada')
  assert.ok(validarClimatologia(roto).some((e) => /registro cerrado/i.test(e)))
})

// ---- Registro completo (Plan 04 D4a, sección "Tests") --------------------

test('conjunto exacto de ids de región', () => {
  assert.deepEqual(
    idsDeRegiones().sort(),
    ['costa-peruana', 'litoral', 'pampa-humeda', 'sur-de-brasil'].sort(),
  )
})

test('tabla por región: toda región del registro valida, con las tres fases y fuentes reales', () => {
  for (const clima of Object.values(REGIONES)) {
    assert.deepEqual(validarClimatologia(clima), [], `${clima.id} no valida`)

    for (const fase of ['nino', 'nina', 'neutral'] as const) {
      assert.ok(clima.porFase[fase].length >= 1, `${clima.id}/${fase} vacía`)
      for (const a of clima.porFase[fase]) {
        for (const id of a.fuentes) {
          const f = FUENTES[id]
          assert.ok(f, `${clima.id}/${fase}: fuente desconocida ${id}`)
          assert.match(f.url, /^https:\/\//)
        }
      }
    }

    assert.ok(clima.paises.length > 0, `${clima.id}: sin países`)
    for (const pais of clima.paises) {
      assert.ok(
        ['AR', 'BO', 'BR', 'CL', 'EC', 'PE', 'PY', 'UY'].includes(pais),
        `${clima.id}: país "${pais}" fuera del conjunto cerrado`,
      )
    }
  }
})

test('estado editorial esperado por región: las cuatro D4a están revisadas', () => {
  // Litoral (piloto, Plan 02 D3) y sur-de-brasil/pampa-humeda/costa-peruana
  // (Plan 04 D4a) pasaron revisión del dueño el 2026-09-03. Chile
  // central/Cuyo/Altiplano (D4b) siguen sin fuente completa y no tienen
  // archivo todavía — no aparecen acá hasta que se escriban.
  const esperado: Record<string, 'borrador' | 'revisado' | 'validado'> = {
    litoral: 'revisado',
    'sur-de-brasil': 'revisado',
    'pampa-humeda': 'revisado',
    'costa-peruana': 'revisado',
  }
  for (const [id, estado] of Object.entries(esperado)) {
    const clima = REGIONES[id]
    assert.ok(clima, `falta la región "${id}" en el registro`)
    assert.equal(estadoEfectivo(clima).estado, estado, `${id}: estado inesperado`)
  }
})

test('regionesPublicas() es exactamente el conjunto de regiones indexables del registro', () => {
  // Genérico a propósito: no fija qué ids son públicos hoy, así sigue siendo
  // la prueba correcta cuando D4b agregue regiones nuevas en `borrador`.
  const indexables = Object.values(REGIONES)
    .filter((c) => estadoEfectivo(c).estado !== 'borrador')
    .map((c) => c.id)
    .sort()
  assert.deepEqual(
    regionesPublicas().map((c) => c.id).sort(),
    indexables,
  )
  assert.ok(indexables.length > 0, 'no hay ninguna región indexable para probar el mecanismo')
})

test('el sitemap no incluye ninguna región en borrador', async () => {
  const entradas = sitemap()
  const urlsDeRegion = entradas.map((e) => e.url).filter((u) => u.includes('/regiones/'))
  const idsPublicos = new Set(regionesPublicas().map((c) => c.id))
  assert.ok(urlsDeRegion.length > 0, 'el sitemap no tiene ninguna región')
  const idsEnSitemap = new Set<string>()
  for (const url of urlsDeRegion) {
    const id = url.split('/regiones/')[1]
    assert.ok(id && idsPublicos.has(id), `región no pública en el sitemap: ${url}`)
    if (id) idsEnSitemap.add(id)
  }
  // Y a la inversa: ninguna región pública falta en el sitemap.
  assert.deepEqual(idsEnSitemap, idsPublicos)
})

test('generateMetadata da noindex para una región en borrador (mecanismo, con clon sintético)', async () => {
  // Hoy las cuatro regiones del registro están revisadas — no hay ningún
  // borrador real contra el cual probar el camino noindex. Se prueba el
  // MECANISMO con un clon en borrador de una región real, mismo patrón que
  // `regiones.render.test.tsx` usa para el distintivo visual.
  const original = REGIONES['sur-de-brasil']
  assert.ok(original, 'falta sur-de-brasil en el registro')
  ;(REGIONES as Record<string, Climatologia>)['sur-de-brasil'] = {
    ...original,
    revision: { estado: 'borrador' },
  }
  try {
    const m = await generateMetadata({
      params: Promise.resolve({ lang: 'es', region: 'sur-de-brasil' }),
    })
    assert.deepEqual(m.robots, { index: false, follow: true })
    assert.equal(m.alternates, undefined)
  } finally {
    ;(REGIONES as Record<string, Climatologia>)['sur-de-brasil'] = original
  }
})

test('generateMetadata da index para cada región efectivamente revisada del registro', async () => {
  for (const clima of Object.values(REGIONES)) {
    if (estadoEfectivo(clima).estado === 'borrador') continue
    const m = await generateMetadata({ params: Promise.resolve({ lang: 'es', region: clima.id }) })
    assert.notDeepEqual(m.robots, { index: false, follow: true }, `${clima.id}: debería ser indexable`)
  }
})
