/**
 * Checks determinísticos de diseño (DESIGN.md §8, Plan 01 B3.1).
 *
 * Tres, los que importan primero:
 *   1. Contraste AA sobre los tokens de texto/fondo.
 *   2. Cero colores literales fuera de `app/tracker.css`.
 *   3. Firma de dato: una cifra no existe sin `Dato` completo.
 *
 * Corre en CI (`pnpm check:design`) y falla con exit 1 ante cualquier violación.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const RAIZ = process.cwd()
const CSS = join(RAIZ, 'app/tracker.css')
const AA_TEXTO_CHICO = 4.5

let violaciones = 0

function mal(mensaje: string) {
  console.error('  ✗', mensaje)
  violaciones++
}

function ok(mensaje: string) {
  console.log('  ✓', mensaje)
}

// ---- utilidades --------------------------------------------------------

function lum(hex: string): number {
  const h = hex.replace('#', '')
  const canal = (i: number) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4)
}

function contraste(a: string, b: string): number {
  const la = lum(a)
  const lb = lum(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

function archivos(exts: string[]): string[] {
  const out: string[] = []
  const caminar = (dir: string) => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      if (['node_modules', '.next', '.git'].includes(entrada.name)) continue
      const p = join(dir, entrada.name)
      if (entrada.isDirectory()) caminar(p)
      else if (exts.some((e) => entrada.name.endsWith(e))) out.push(p)
    }
  }
  caminar(RAIZ)
  return out
}

// ---- 1 · contraste AA sobre tokens -------------------------------------

function checkContraste() {
  console.log('▸ Contraste AA sobre tokens')
  const css = readFileSync(CSS, 'utf8')
  const tokens = new Map<string, string>()
  for (const m of css.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)) {
    tokens.set(`--${m[1]}`, m[2])
  }

  const fondo = '--bg'
  const bg = tokens.get(fondo)
  if (!bg) {
    mal(`no encontré el token ${fondo} en tracker.css`)
    return
  }

  for (const t of ['--ink', '--ink-2', '--ink-3', '--nino', '--nina', '--neutral']) {
    const color = tokens.get(t)
    if (!color) {
      mal(`no encontré el token ${t} en tracker.css`)
      continue
    }
    const r = contraste(color, bg)
    if (r < AA_TEXTO_CHICO) {
      mal(`${t} (${color}) da ${r.toFixed(2)}:1 sobre ${fondo} (mínimo ${AA_TEXTO_CHICO}:1)`)
    } else {
      ok(`${t} ${color} = ${r.toFixed(2)}:1 sobre ${fondo}`)
    }
  }
}

// ---- 2 · cero colores literales ----------------------------------------

function checkColoresLiterales() {
  console.log('▸ Colores literales fuera de tracker.css')
  const patrones = [/#[0-9a-fA-F]{3,8}\b/g, /rgba?\(/g, /hsla?\(/g]

  for (const archivo of archivos(['.ts', '.tsx'])) {
    if (archivo.endsWith('scripts/check-design.ts')) continue
    const lineas = readFileSync(archivo, 'utf8').split('\n')
    lineas.forEach((linea, i) => {
      for (const p of patrones) {
        for (const m of linea.matchAll(p)) {
          mal(`${archivo.replace(RAIZ + '/', '')}:${i + 1} → ${m[0]}`)
        }
      }
    })
  }

  if (violaciones === 0) ok('sin colores literales fuera de tracker.css')
}

// ---- 3 · firma de dato --------------------------------------------------

function checkFirmaDato() {
  console.log('▸ Firma de dato (valor + índice + fecha + fuente)')
  const stat = join(RAIZ, 'components/Stat.tsx')
  const valorViejo = join(RAIZ, 'components/Valor.tsx')

  if (existsSync(valorViejo)) {
    mal('components/Valor.tsx todavía existe: renderiza un number pelado, sin Dato')
  }
  if (!existsSync(stat)) {
    mal('falta components/Stat.tsx')
    return
  }
  const src = readFileSync(stat, 'utf8')
  if (!/dato\s*:\s*Dato/.test(src)) {
    mal('components/Stat.tsx no exige un Dato (valor + índice + fecha + fuente)')
  } else {
    ok('toda cifra medida exige Dato (Stat.tsx)')
  }
}

// ---- corrida ------------------------------------------------------------

checkContraste()
checkColoresLiterales()
checkFirmaDato()

if (violaciones > 0) {
  console.error(`\ncheck:design FALLÓ (${violaciones} violaciones)`)
  process.exit(1)
}
console.log('\ncheck:design ✓')
