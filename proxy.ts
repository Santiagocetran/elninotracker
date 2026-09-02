import { NextResponse, type NextRequest } from 'next/server'
import { LOCALE_POR_DEFECTO } from '@/lib/i18n'

/**
 * `/` no tiene contenido propio: el idioma es parte de la ruta desde v1
 * (Plan 02 D0.2). Redirección **permanente** (308) a `/es`.
 *
 * `/pt` y cualquier otro idioma NO pasan por acá: caen en `app/[lang]`, donde el
 * layout llama a `notFound()` para todo locale que no esté activo. Eso da 404,
 * que es lo correcto hasta que exista traducción real.
 */
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL(`/${LOCALE_POR_DEFECTO}`, request.url), 308)
}

export const config = {
  matcher: '/',
}
