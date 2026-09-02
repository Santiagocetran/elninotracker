import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FUENTES } from '../lib/regiones/fuentes'
import { hashContenido, estadoEfectivo, type Climatologia } from '../lib/regiones/esquema'
import { validarClimatologia } from '../lib/regiones/validar'
import { litoral } from '../lib/regiones/litoral'

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
