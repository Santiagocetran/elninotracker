# Plan 03 · v1 — Bloque D5, el mapa

> Corresponde a **Plan 02 (`02-v1-que-significa-para-mi.md`), Bloque D5**.
> Abierto 2026-09-03. Elegido con el dueño entre D4, escala histórica, D5 y D6
> tras cerrar D0–D3 (Litoral revisado, gates en verde).
> **Revisión 1 (2026-09-03):** el dueño auditó el borrador y encontró 4 bloqueos y 6 huecos de
> verificación — ninguno replantea el bloque, todos se resuelven con datos reales de GIBS, del
> build de Next 16/Turbopack y de la propia librería. Ver "Qué cambió en la revisión 1".

## Contexto

Es **el primer JS de cliente del proyecto** — hoy el sitio entero es SSR puro (el explicador
"el motor" en `components/Motor.tsx` usa radios + CSS, cero JavaScript). D5 tiene siete
criterios explícitos y verificables que la revisión 1 de Plan 02 no tenía.

## Qué cambió en la revisión 1

El borrador original tenía cuatro problemas que lo hacían no ejecutable tal cual, y seis huecos
de verificación. Se corrigen con evidencia, no con más supuestos:

1. **El chequeo de presupuesto no funcionaba con Next 16/Turbopack.** No existe
   `.next/app-build-manifest.json`; el artefacto real es `.next/diagnostics/route-bundle-stats.json`.
   Además `/[lang]` ya pesa **454.843 bytes sin comprimir (~134 KB gzip) antes de tocar nada** —
   exigir "≤15 KB de First Load JS total" era imposible desde la línea de base. Se redefine como
   **costo incremental atribuible al mapa**, medido dos veces: por diff de manifiesto (barato,
   corre siempre) y por red real con un navegador (autoritativo).
2. **El fallback no cubría fallos del lado del cliente** (tile roto tras hidratar, WebGL no
   disponible, GIBS caído después de resolver la fecha en el servidor). Se agrega manejo de
   error y timeout en `MapaCliente`, con el mismo componente de estado vacío que usa el servidor.
3. **La resolución de fecha partía de "hoy" en vez de `GetCapabilities`/`DescribeDomains`.** GIBS
   expone `DescribeDomains`, una consulta acotada que devuelve el rango de fechas de una capa en
   ~250 bytes — no hace falta elegir entre 5,5 MB y sondear a ciegas. Se adopta como vía
   primaria, con el sondeo día-por-día como red de seguridad si falla.
4. **Faltaba el mapa base** que exige `CLAUDE.md:82` ("raster layer over a base map"). Bajé un
   tile real de la capa de anomalía y tiene **~74 % de píxeles transparentes sobre tierra** — sin
   una capa debajo, la tierra se ve como el fondo de la página, sin costas ni referencia. Se
   resuelve enteramente dentro de GIBS (capa `Coastlines_15m`), sin sumar un proveedor nuevo.

Y los seis hallazgos de verificación (interactividad, zoom fijo, chequeo de atribución vacuo,
leyenda, timeouts de red, y gates reales en CI) se incorporan en las decisiones de abajo.

## Verificado hoy, con evidencia

- `GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies` (WMTS, `GoogleMapsCompatible_Level7`)
  responde. El tile de "hoy" (2026-09-03) da 404; el de ayer (2026-09-02) da 200 — confirma que
  no se puede asumir la fecha.
- `HEAD` responde igual que `GET` contra el endpoint de tiles: se puede sondear sin bajar el PNG.
- **`DescribeDomains` funciona** y devuelve, para esta capa, `<Domain>2026-08-28/2026-09-02/P1D</Domain>`
  en ~250 bytes:
  `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies/default/GoogleMapsCompatible_Level7/{BBOX}/{TimeStart}--{TimeEnd}.xml`
- El tile `z=2/y=1/x=2` de la capa de anomalía es mixto tierra/océano y **tiene datos reales**
  (parte de sus píxeles con `alpha=255`) en las tres fechas probadas — sirve como tile
  representativo para confirmar disponibilidad sin descargar el mosaico completo.
- GIBS publica capas propias de referencia: `Coastlines_15m`, `Reference_Features_15m`,
  `Reference_Labels_15m` (OSM, estáticas, mismo esquema `GoogleMapsCompatible`, formato PNG con
  transparencia). Resuelven el mapa base sin salir de GIBS.
- El layer de anomalía trae `LegendURL` propia (SVG) en su `GetCapabilities`:
  `https://gibs.earthdata.nasa.gov/legends/GHRSST_Sea_Surface_Temperature_Anomalies_H.svg`.
- **`maplibre-gl` v6 es ESM-only y mueve el worker a un archivo aparte** que hay que enrutar a
  mano con `setWorkerUrl()` — mal encaje con Turbopack, sin soporte confirmado, y exactamente el
  riesgo de "subcontar workers" que se señaló. **`maplibre-gl@4.7.1`** (última versión de la
  serie 4, previa a ese cambio) sigue publicando un bundle autocontenido con el worker embebido
  vía blob — nada que enrutar, nada que se escape del chunk. Bajé el paquete y medí:

  | Archivo | gzip |
  |---|---|
  | `dist/maplibre-gl.js` (entrada `main`, worker incluido) | **211,5 KB** |
  | `dist/maplibre-gl.css` | 9,3 KB |
  | variante `-csp` + su worker aparte | 283 KB — **no entra en el techo de 260 KB** |

  Con la entrada `main` (no la `-csp`), el total ronda 221 KB gzip más el envoltorio propio:
  entra en el techo con margen, y como es un único archivo, no hay piezas ocultas que un chequeo
  estático pueda no ver.
- `interactive: false` es una opción real y documentada del constructor de MapLibre GL JS
  (ejemplo oficial "Display a non-interactive map") que desactiva todos los handlers de
  puntero/teclado de una vez.
- La cita oficial del dataset: *"GHRSST Level 4 MUR Global Foundation Sea Surface Temperature
  Analysis (v4.1)." NASA PO.DAAC, 2015. doi:10.5067/GHGMR-4FJ04.*

## Decisiones de diseño

1. **Resolución de fecha: `DescribeDomains` → candidato → `HEAD` de confirmación → sondeo
   día-por-día solo si eso falla.** `DescribeDomains` da el último período real en ~250 bytes; se
   confirma con **un solo** `HEAD` al tile representativo `z=2/y=1/x=2`. Si `DescribeDomains`
   falla (red, formato inesperado) o el `HEAD` de confirmación falla, se cae al sondeo día por
   día desde la fecha candidata (o desde hoy si ni siquiera hay candidata), hasta 6 días atrás.
   Ninguna de las dos fuentes es un único punto de falla para la otra.
2. **Presupuesto de JS: manifiesto de Next para la estructura, navegador real para los bytes.**
   `.next/diagnostics/route-bundle-stats.json` dice, por ruta, `firstLoadUncompressedJsBytes` y
   `firstLoadChunkPaths` — hoy `/[lang]` y `/[lang]/regiones/[region]` tienen **exactamente los
   mismos** cinco archivos (nada de código propio entra hoy en el bundle de cliente, porque no
   hay un solo `'use client'` en el sitio). Eso da una línea de base auto-calculada sin números
   fijos: **el costo incremental es el conjunto de archivos en `firstLoadChunkPaths('/[lang]')`
   que NO están en `firstLoadChunkPaths('/[lang]/regiones/[region]')`** (la región no renderiza
   el mapa). Ese diff, gzipeado, tiene que ser ≤15 KB — y no puede contener ningún archivo del
   `react-loadable-manifest.json` que registra el `import()` de `MapaCliente`.

   Esto es la parte barata y determinística (corre sin navegador). La cifra autoritativa —la que
   de verdad manda si hay discrepancia— se mide con **`playwright` contra un `next build && next
   start` real**: navegar a `/es`, sumar `responseBodySize` (tamaño *codificado*, el que viaja
   por la red) de los recursos `script`/`stylesheet` pedidos antes de hacer scroll (≤15 KB, y
   cero de ellos con marcador de maplibre), después scrollear el bloque del mapa a viewport,
   esperar red inactiva, y sumar lo nuevo (≤260 KB). Un chequeo estático no puede ver un worker
   separado, una hoja de estilos de terceros o una petición que Turbopack arme distinto a como
   la nombra el manifiesto — un navegador real sí. `playwright` (no `-core`) porque trae el CLI
   de instalación de navegadores; en CI se agrega un paso `npx playwright install --with-deps
   chromium`, cacheado.
3. **La franja de "desactualizado" reutiliza `Degradacion.tsx`.** El plan dice literalmente "se
   marca como desactualizado, **igual que las series**" — el mecanismo ya existe (`FrescuraItem[]`
   → `components/Degradacion.tsx`); se suma un ítem al array en vez de duplicar el patrón.
4. **Mapa base: capas propias de GIBS, no un proveedor nuevo.** El tile de anomalía es
   transparente sobre tierra (~74 % en la prueba de hoy), así que hace falta algo debajo. En vez
   de sumar una decisión de licencia/proveedor nueva, se apilan tres capas, todas de GIBS o CSS
   propio:
   1. Fondo: color plano con un token existente de `tracker.css` (`--surface` o similar) — cero
      peticiones.
   2. `Coastlines_15m` (GIBS, derivada de OSM) — contorno de costas, sin fecha (capa estática).
   3. `GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies` — el dato, encima.

   La atribución tiene que nombrar **tres cosas**: NASA GIBS (servicio), GHRSST L4 MUR v4.1 /
   PO.DAAC (dataset, con el DOI), y OpenStreetMap contributors (origen de `Coastlines_15m`, exigido
   por su licencia ODbL).
5. **Carga diferida por `IntersectionObserver`**, no `next/dynamic` a secas. `dynamic(...,
   {ssr:false})` solo evita el *server* render; sin un observer, el chunk se pediría igual al
   hidratar aunque el mapa esté fuera de pantalla. El criterio de "no entra en el bundle de
   entrada" exige que ni siquiera se **pida** hasta que el bloque entra en viewport — verificado
   con el navegador real del punto 2.
6. **Mapa no interactivo, de verdad, no solo oculto a accesibilidad.** `interactive: false` en el
   constructor apaga todos los handlers (drag, scroll-zoom, doble clic, teclado, gestos táctiles)
   de una vez — es la opción documentada para exactamente este caso. Además, por si el
   comportamiento de esa opción cambia entre versiones: `minZoom === maxZoom` (zoom
   verdaderamente fijo, no solo un límite de paneo), `renderWorldCopies: false` (importante cerca
   del antimeridiano, que el encuadre del Pacífico toca), `maxBounds` fijo sobre el Pacífico
   ecuatorial + Sudamérica (aprox. lon `-180..-30`, lat `-50..30`, ajustado mirándolo en el
   navegador). Con el mapa genuinamente no interactivo — sin foco de teclado, sin handlers — el
   `<canvas>` puede llevar `aria-hidden="true"` de forma correcta, porque no esconde ningún
   control operable. El texto SSR (atribución, fecha, qué se ve, leyenda) es la vía accesible y
   existe con o sin JS.
7. **Fallback también en el cliente.** `MapaCliente` escucha `map.on('error', …)` (tile roto,
   fuente inválida) y aplica un timeout de montaje (si no dispara `load`/`idle` en ~8 s, se da
   por fallado). Cualquiera de los dos casos renderiza el mismo componente `MapaVacio` que usa el
   servidor cuando no hay tile resuelto — un solo componente de estado vacío, dos disparadores.
   `map.remove()` se llama al desmontar, con guarda para el doble-montaje de React Strict Mode en
   desarrollo (`next.config.ts` ya tiene `reactStrictMode: true`).
8. **Leyenda.** Se embebe el SVG oficial de leyenda de GIBS para esta capa (`alt` descriptivo) más
   una frase en castellano llano de los extremos de la escala ("azul = más frío que lo habitual;
   rojo = más cálido"). Es la leyenda **de NASA para su propia imagen**, no una paleta que el
   sitio adopte como propia — no choca con A2 (la prohibición es reusar arcoíris en gráficos
   *nuestros*).
9. **Red con timeout y presupuesto explícito.** Tanto `DescribeDomains` como cada `HEAD` de
   sondeo llevan `AbortSignal.timeout` propio (no se reutiliza `traer()` de `lib/red.ts`: esa
   función rechaza cualquier respuesta de menos de 1000 bytes como "sospechosamente corta", y
   `DescribeDomains` responde ~250 bytes por diseño — reusarla sin cambios rompería el caso feliz).
   Un 4xx/5xx o un timeout en cualquier paso se trata como "ese candidato no sirve" y se sigue
   con el siguiente, nunca como excepción no capturada.
10. **Los checks de comportamiento real corren en CI, no solo a mano.** El script de presupuesto
    (punto 2) ya corre contra un navegador en CI. Se agregan ahí mismo, con el mismo navegador:
    (a) bloquear las rutas de tiles GIBS (`page.route(...).abort()`) y confirmar que aparece
    `MapaVacio`; (b) contra `next dev` (no `next start`: Strict Mode solo duplica efectos en
    desarrollo) navegar, montar y desmontar el bloque dos veces, y confirmar por un contador
    (`window.__mapaMontajes`, incrementado/decrementado desde `MapaCliente`, solo con fines de
    test) que cada montaje tuvo su `map.remove()`.

## Corrección a `DESIGN.md`

`DESIGN.md` §8.6 dice que la atribución del mapa la verifica `check-design.ts`. Un chequeo
estático no puede confirmar qué queda "presente en el DOM" — eso solo lo prueba un render. La
verificación real vive en `tests/mapa.render.test.tsx` (ver abajo), siguiendo el mismo reparto por
capa que ya define Plan 02 D2.3 ("Tests de render: … enlaces de fuente presentes"). Se corrige la
nota de `DESIGN.md` §8.6 para que apunte ahí en vez de a `check-design.ts`.

## Archivos

**Nuevos:**

- `lib/sources/gibs.ts` — config de las capas (anomalía + `Coastlines_15m`), tileMatrixSet,
  `cadenciaMaximaDias: 5`, el tile representativo `z/y/x` para confirmación, atribución del
  dataset (nombre, DOI, PO.DAAC). `resolverTileGIBS(ahora)`: `DescribeDomains` → confirmación →
  sondeo de respaldo (decisión 1). Fetches propios con `AbortSignal.timeout`, no vía `traer()`
  (decisión 9). Mismo estilo que `lib/sources/cpc-*.ts` en la forma del módulo.
- `lib/mapa.ts` — `getMapaGIBS()`: `'use cache'` + `cacheLife('hours')` (mismo contrato que
  `lib/datos.ts`), envuelve `resolverTileGIBS` y no lanza — un fallo de red es `null`.
- `components/Mapa.tsx` — server component. Recibe `{ tile, d }`. Compone: título, intro, leyenda
  SVG + texto, atribución (dataset + GIBS + OSM), fecha, y — con tile — el contenedor que monta
  `MapaLazy`, pasándole `<MapaVacio d={d} />` como `fallback`.
- `components/MapaVacio.tsx` — server component puro: link a NASA Worldview
  (`https://worldview.earthdata.nasa.gov`) y el texto de "no disponible ahora". Se usa server-side
  (sin tile resuelto) y como `fallback` del lado del cliente (decisión 7) — un solo componente.
- `components/MapaLazy.tsx` — `'use client'`: `IntersectionObserver` + `next/dynamic(() =>
  import('./MapaCliente'), { ssr: false })`. Único código que corre en la carga inicial; tiene
  que entrar en el techo incremental de 15 KB (decisión 2).
- `components/MapaCliente.tsx` — `'use client'`, monta `maplibre-gl@4.7.1` (import de su JS +
  `maplibre-gl/dist/maplibre-gl.css` acá, así ambos quedan en el chunk diferido). Estilo con las
  tres capas de la decisión 4, `interactive:false` + `minZoom===maxZoom` + `renderWorldCopies:false`
  + `maxBounds` (decisión 6), manejo de `error`/timeout con fallback a `MapaVacio` (decisión 7),
  `map.remove()` en cleanup con guarda de Strict Mode, contador `window.__mapaMontajes` solo para
  el test de CI (decisión 10).
- `scripts/check-mapa-presupuesto.ts` — dos fases. (a) Estructural y barata: lee
  `.next/diagnostics/route-bundle-stats.json` y `react-loadable-manifest.json`, calcula el diff
  descrito en decisión 2, falla si algo de maplibre aparece en el bundle de entrada. (b)
  Autoritativa: `next build`, `next start` en un puerto libre, `playwright` mide bytes reales de
  red antes/después del scroll contra los dos techos, bloquea tiles GIBS para probar `MapaVacio`,
  y corre el ciclo montaje/desmontaje contra `next dev` para Strict Mode (decisión 10). Sale con
  1 y mensaje explícito ante cualquier violación, igual que `check-design.ts`.
- `tests/gibs.test.ts` — `resolverTileGIBS` con `fetch` mockeado (`node:test`, stub de
  `globalThis.fetch` restaurado en cada test): `DescribeDomains` da un período reciente y el
  `HEAD` de confirmación responde 200 → usa esa fecha sin sondear; `DescribeDomains` falla →
  sondeo día por día, con 404/429/500 tratados como "seguir al día anterior"; `fetch` que lanza
  (error de red) tratado igual; nada responde en la ventana → `null`.
- `tests/mapa.render.test.tsx` — `renderToStaticMarkup(<Mapa .../>)`, igual que
  `tests/regiones.render.test.tsx`: con tile, el HTML incluye el nombre del dataset, la fecha, un
  link con el DOI/PO.DAAC, y menciones a NASA/GIBS y OpenStreetMap; sin tile, aparece el link a
  Worldview y no hay ningún `<canvas>` ni referencia a maplibre.

**Editados:**

- `app/[lang]/page.tsx` — nueva sección `<Mapa tile={mapa} d={d} />` entre "Qué significa para
  mí" y "El histórico" (orden fijo de `DESIGN.md` §4 — de paso, se corrige el comentario de esa
  sección, que hoy dice "5" siendo la sexta). `getMapaGIBS()` se pide junto a `getDatos()`. La
  franja de `Degradacion` recibe `estado.frescura` más un ítem por el tile si `mapa` no es null.
- `lib/diccionarios/es.ts` (+ el tipo `Diccionario`) — clave `mapa`: título, intro, texto de
  leyenda, atribución (con placeholders para los tres reconocimientos), prefijo de fecha, texto
  del estado vacío + enlace a Worldview. Nada de literales nuevos en JSX.
- `app/tracker.css` — clase `.mapa` (marco, atribución visible, fecha del tile — `DESIGN.md` §6) y
  variantes para el estado vacío y la leyenda. El CSS de maplibre-gl no pasa por acá — se importa
  desde `MapaCliente.tsx`.
- `DESIGN.md` §8.6 — corrección de referencia (ver "Corrección a DESIGN.md" arriba).
- `package.json` — dependencia `maplibre-gl@^4.7.1` (no `^6`: ver "Verificado hoy"); dependencia
  de desarrollo `playwright@^1.62`; script `check:mapa`.
- `.github/workflows/ci.yml` — paso `npx playwright install --with-deps chromium` (cacheado por
  versión) y paso `pnpm check:mapa` después de `pnpm build` (necesita `.next` generado).

## Verificación

1. `pnpm install` (dependencias nuevas: `maplibre-gl`, `playwright` dev).
2. `pnpm typecheck && pnpm lint && pnpm test` — incluye los dos archivos de test nuevos.
3. `pnpm build && pnpm check:mapa` — confirma el diff estructural y, con navegador real, los dos
   techos de bytes, el fallback ante tiles bloqueados, y el ciclo de montaje/desmontaje.
4. `pnpm dev`, abrir `/es`, y mirar a mano con Chromium: confirmar que el mapa NO pide red hasta
   el scroll, que el encuadre es el correcto (Pacífico ecuatorial + Sudamérica, sin rotación, sin
   zoom libre), que la leyenda es legible, y que con JS desactivado el bloque sigue mostrando
   atribución + fecha + link. Capturar screenshots antes y después del scroll.
5. Confirmar visualmente que `Coastlines_15m` se ve por debajo de los huecos transparentes de la
   capa de anomalía (el 74 % de tierra transparente medido hoy).
