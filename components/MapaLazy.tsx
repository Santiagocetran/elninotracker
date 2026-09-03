'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import dynamic from 'next/dynamic'

type PropsMapaCliente = { tile: string; fallback: ReactNode }

const MapaCliente = dynamic<PropsMapaCliente>(() => import('./MapaCliente'), { ssr: false })

/**
 * Carga diferida por `IntersectionObserver` (Plan 03 D5, decisión 5): sin el
 * observer, `dynamic(…, { ssr: false })` pediría el chunk al hidratar aunque el
 * mapa estuviera fuera de pantalla. Acá el chunk ni se pide hasta que el bloque
 * entra en viewport.
 */
export function MapaLazy({ tile, fallback }: { tile: string; fallback: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [entra, setEntra] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setEntra(true)
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEntra(true)
          obs.disconnect()
        }
      },
      { rootMargin: '200px 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (entra) return <MapaCliente tile={tile} fallback={fallback} />

  return <div className="mapa__lienzo" ref={ref} />
}
