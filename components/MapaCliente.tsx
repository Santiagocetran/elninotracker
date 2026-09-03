'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import maplibregl from 'maplibre-gl'
import type { Map as MapLibreMap, StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { plantillaAnomalia, plantillaCostas } from '@/lib/sources/gibs'

/** Zoom fijo de verdad: `minZoom === maxZoom`, no sólo un límite de paneo. */
const ZOOM_FIJO = 2.52
const TIMEOUT_MS = 8000

/**
 * Monta el raster GIBS (Plan 03 D5). No interactivo (`interactive: false`),
 * zoom fijo, `renderWorldCopies: false` cerca del antimeridiano y `maxBounds`
 * sobre el Pacífico ecuatorial + Sudamérica (decisión 6). El fallo de tiles o
 * un montaje que no llega a `load`/`idle` muestra `MapaVacio` (decisión 7).
 */
export function MapaCliente({ tile, fallback }: { tile: string; fallback: ReactNode }) {
  const contenedor = useRef<HTMLDivElement>(null)
  const [fallo, setFallo] = useState(false)

  useEffect(() => {
    const el = contenedor.current
    if (!el) return

    const w = window as unknown as { __mapaMontajes?: number }
    w.__mapaMontajes = (w.__mapaMontajes ?? 0) + 1

    let temporizador: ReturnType<typeof setTimeout> | null = null
    let mapa: MapLibreMap | null = null

    const centro: [number, number] = [-105, -10]
    const limites: [[number, number], [number, number]] = [
      [-180, -50],
      [-30, 30],
    ]

    const estilo: StyleSpecification = {
      version: 8,
      sources: {
        costas: {
          type: 'raster',
          tiles: [plantillaCostas()],
          tileSize: 256,
          maxzoom: 13,
        },
        anomalia: {
          type: 'raster',
          tiles: [plantillaAnomalia(tile)],
          tileSize: 256,
          maxzoom: 7,
        },
      },
      layers: [
        { id: 'costas', type: 'raster', source: 'costas' },
        { id: 'anomalia', type: 'raster', source: 'anomalia' },
      ],
    }

    try {
      mapa = new maplibregl.Map({
        container: el,
        style: estilo,
        center: centro,
        zoom: ZOOM_FIJO,
        minZoom: ZOOM_FIJO,
        maxZoom: ZOOM_FIJO,
        interactive: false,
        renderWorldCopies: false,
        maxBounds: limites,
        attributionControl: false,
      })
    } catch {
      setFallo(true)
      w.__mapaMontajes = (w.__mapaMontajes ?? 1) - 1
      return
    }

    const alListo = () => {
      if (temporizador) clearTimeout(temporizador)
    }

    temporizador = setTimeout(() => {
      setFallo(true)
      try {
        mapa?.remove()
      } catch {
        // el mapa pudo no haber terminado de construirse
      }
    }, TIMEOUT_MS)

    mapa.on('load', alListo)
    mapa.on('idle', alListo)

    const alError = () => {
      if (temporizador) clearTimeout(temporizador)
      setFallo(true)
      try {
        mapa?.remove()
      } catch {
        // idem
      }
    }
    mapa.on('error', alError)

    el.querySelector('canvas')?.setAttribute('aria-hidden', 'true')

    return () => {
      if (temporizador) clearTimeout(temporizador)
      mapa?.off('load', alListo)
      mapa?.off('idle', alListo)
      mapa?.off('error', alError)
      try {
        mapa?.remove()
      } catch {
        // Strict Mode puede desmontar antes de que el mapa esté listo
      }
      const w2 = window as unknown as { __mapaMontajes?: number }
      w2.__mapaMontajes = (w2.__mapaMontajes ?? 1) - 1
    }
  }, [tile])

  if (fallo) return <>{fallback}</>

  return <div className="mapa__lienzo" ref={contenedor} />
}

export default MapaCliente
