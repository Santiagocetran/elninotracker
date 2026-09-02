/**
 * Descargas con timeout y reintentos (Plan 01 B2.3).
 *
 * El timeout no es opcional: sin él, el fallback a seed de B1.1 nunca se
 * dispara cuando la red cuelga — el build quedaría esperando para siempre.
 */

import { site } from '@/site.config'

const UA = `Mozilla/5.0 (compatible; ${site.nombre}/0.1; +${site.url})`

function dormir(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms))
}

export async function traer(
  url: string,
  { timeoutMs = 10_000, reintentos = 2 } = {},
): Promise<string> {
  let ultimoError: unknown

  for (let intento = 0; intento <= reintentos; intento++) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': UA },
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`)
      const texto = await r.text()
      if (texto.length < 1000) {
        throw new Error(`${url} → respuesta sospechosamente corta (${texto.length} b)`)
      }
      return texto
    } catch (e) {
      ultimoError = e
      if (intento < reintentos) {
        await dormir(500 * 2 ** intento)
      }
    }
  }

  throw ultimoError
}
