# Plan 01 · v0 — Prueba operativa

> Corresponde a **README §9, v0**.
> Abierto 2026-09-02 · **revisión 2 (2026-09-02), tras segunda auditoría.**

## Qué cambió en la revisión 2

**Hallazgo mayor: estamos usando un índice superado.** El CPC adoptó **RONI**
(Relative Oceanic Niño Index) en **febrero de 2026** como índice operativo de
monitoreo y pronóstico de ENSO. ONI sigue siendo válido para la serie histórica,
pero no para describir el estado actual.

Verificado contra `RONI.ascii.txt` (918 filas, DJF 1950 → MJJ 2026):

| Temporada | ONI | RONI |
|---|---|---|
| MJJ 2026 | +1,39 → moderado | **+0,98 → débil** |
| AMJ 2026 | +0,95 → débil | +0,49 → neutral |
| DJF 2026 | −0,39 → neutral | **−0,91 → La Niña débil** |

Consecuencia: la portada **sobredeclara el evento en una clase de intensidad**,
y su texto llama a ONI "el índice oficial del que depende la clasificación", lo
cual hoy es falso. En DJF los dos índices ni coinciden en la fase. Esto sube a
B0.2 y arrastra una cuarta fuente de datos.

Otros cambios de esta revisión:

- **B1.2 prometía algo imposible.** Si una revalidación falla, Next conserva el
  HTML anterior — que conserva también el `saludIngesta` anterior. La página no
  puede reportar "el último intento falló". Se fija una política explícita.
- **"El build deja de depender de NOAA" era falso.** Next ejecuta los `fetch()`
  de una ruta prerenderizada durante `next build`. Sólo tolera la caída si la
  función captura el error y cae al seed. Corregido el criterio y la redacción.
- **Orden inconsistente:** B0 bloquea el deploy, pero B0.2 sólo cierra con B3.3,
  que estaba después del deploy. Reordenado.
- **B2 antes que B1:** no se construye el cache antes de tener invariantes.
- **ISR es perezosa:** revalida con la primera request después del TTL. "Se
  actualiza sola" sin tráfico requiere un cron que visite la portada.

## Qué cambió en la revisión 1

Una auditoría encontró que la versión anterior de este plan describía una
arquitectura que no puede funcionar, y que la portada comunica información
falsa fuera de la fase cálida. Ambas cosas se verificaron y son ciertas. Los
cambios:

1. **T2 era irrealizable.** ISR re-renderiza la página, pero `data/*.json` entra
   por `import` estático y queda horneado en el bundle. Revalidar no traía datos
   nuevos. Rediseñado en B2.
2. **T7 sube a bloqueante.** Si la portada promete "estado actual del ENSO", no
   puede clasificarlo por su cuenta con una sola lectura.
3. **Bloque 0 nuevo.** La portada dice "más caliente" con anomalía negativa.
   Nada se despliega antes de arreglar eso.
4. **El objetivo estaba sobredimensionado.** "¿Sirve esto?" no se contesta sin
   §5.2, que es el diferencial. Renombrada a *prueba operativa* y se incorpora
   un único panel regional para que la pregunta de producto tenga respuesta.

---

## Definición de terminado

v0 está listo cuando:

1. La portada dice la verdad **en las tres fases**, no sólo en la cálida.
2. Usa **RONI** para describir el estado actual, y distingue cuatro cosas que
   hoy están mezcladas: índice operativo, contexto histórico, observación
   reciente, y estado declarado por el CPC.
3. Se actualiza sola, sin deploy, y lo demuestra con una actualización real
   observada.
4. Cuando la **observación** excede su cadencia, degrada visiblemente. Los
   fallos de descarga son alerta operativa, no estado de la UI (ver B1.2).
5. Hay **un** panel regional validado, para saber si el diferencial funciona.

Fuera de v0: el mapa, la animación del motor, `/datos`, y los paneles regionales
restantes.

---

## Bloque 0 · Correcciones bloqueantes

No se despliega nada con esto abierto.

### B0.1 · La portada miente en fase fría
`app/page.tsx:40` tiene "más caliente" fijo en el texto. Con anomalía negativa
produce *"El Pacífico está −1,2 °C más caliente que lo normal"*. Verificado
renderizando con datos forzados.

También: `La Niña · moderado` no concuerda en género, y en fase neutral
`nombreIntensidad` es `null`, dejando *"el evento figura como ."*
(`app/page.tsx:69`).

**Listo cuando:** existe un fixture por fase (cálida, fría, neutral) y las tres
renderizan texto correcto y con género concordante. Esto se prueba, no se mira.

### B0.2 · Dejar de llamar oficial a nuestro cálculo
Dos problemas distintos, uno se cierra acá y otro en B3.3.

**Ahora (bloqueante):** el texto de `app/page.tsx` llama a ONI "el índice oficial
del que depende la clasificación". Es falso desde febrero de 2026. Además
`lib/enso.ts:28` clasifica desde una sola lectura, cuando el ENSO Alert System
del CPC pondera también atmósfera, pronósticos y juicio experto — las cinco
temporadas son criterio del registro histórico, no la regla operativa completa.

La portada debe separar cuatro cosas y nombrarlas:

| | Qué es | Fuente |
|---|---|---|
| **RONI** | Índice operativo actual del CPC | `RONI.ascii.txt` |
| **Niño 3.4 semanal** | Observación más reciente | `wksst9120.for` |
| **ONI** | Contexto y comparación histórica | `oni.ascii.txt` |
| **ENSO Advisory** | Estado oficial declarado | comunicado del CPC (B3.3) |

Nuestro cálculo por umbral puede quedarse, pero se llama **"clasificación
descriptiva por umbral"** — nunca "oficial".

**Listo cuando:** ninguna cadena de la portada atribuye carácter oficial a un
cálculo propio, y el estado actual se describe con RONI.

### B0.3 · Contraste y SVG
- `--ink-3` (`#6b6e72`) da **3,84:1** sobre `--bg`: falla AA para texto chico, y
  es el color de `.fuente` y `.eje`. Aclarar el token.
- `.eje` fija `color`, pero `<text>` de SVG se pinta con `fill`. Las etiquetas de
  década de `components/Serie.tsx:102` salen negras sobre fondo negro.

**Listo cuando:** todos los pares texto/fondo pasan AA, verificado por cálculo,
y las décadas se ven.

---

## Bloque 2 · Robustez de ingesta

Va **antes** de B1: no se construye el cache sobre parsers sin invariantes.

### B2.1 · Cuarta fuente — RONI
`RONI.ascii.txt` tiene **3 columnas** (`SEAS YR ANOM`), no 4 como `oni.ascii.txt`:
necesita su propio parser, no una reutilización.

### B2.2 · Invariantes
Hoy sólo se exige ≥1 fila parseada, y **una fecha futura pasa el control de
frescura** (`2099-01-01` → −26.419 días → PASA). Verificado.

- Última observación **no futura** y dentro de cadencia.
- Pisos de filas: weekly ≥ 2.000, ONI ≥ 900, RONI ≥ 900, comienzo en 1950.
- Fechas únicas y estrictamente crecientes.
- Rangos físicos plausibles para SST y anomalía.

### B2.3 · Red
`fetch()` sin timeout ni reintentos. Agregar ambos con backoff. El timeout no es
opcional: sin él, el fallback a seed de B1.1 nunca se dispara — el build cuelga.

### B2.4 · Fixtures y tests
No hay ninguno. Congelar copias reales de las cuatro fuentes como fixtures y
testear los parsers, incluido el caso de valores pegados (`23.4-0.4`) que rompe
un `split()` ingenuo y falla en silencio.

**Listo cuando:** los tests corren en CI y fallan al mutar un fixture a propósito.

---

## Bloque 1 · Arquitectura de actualización

### B1.1 · Ingesta a runtime cacheado
El server component obtiene los datos por una función cacheada, en vez de leer
JSON generado en build.

Por qué esta y no un cron externo que commitea JSON:

| | runtime cacheado | cron → commit → deploy |
|---|---|---|
| Refresca sin deploy | sí | no |
| Almacén de "último bueno" | cache de ISR | el repo |
| Churn en git | ninguno | 918 filas por corrida |
| Piezas nuevas | ninguna | workflow + credenciales de push |

Tres precisiones que la auditoría corrigió:

1. **Se cachea el resultado agregado y validado**, no cada respuesta HTTP cruda.
   Así un 200 corrupto no reemplaza al último resultado válido.
2. **Un solo contrato de cache.** Elegir `fetch(..., { next: { revalidate } })`
   *o* Cache Components (`'use cache'` + `cacheLife`). No mezclar.
3. **El build no "deja de depender" de NOAA: lo tolera.** Next ejecuta los
   `fetch()` de una ruta prerenderizada durante `next build`. La tolerancia
   existe sólo si la función captura el error y cae explícitamente a
   `data/seed.json` versionado.

**Listo cuando:** con cache vacío, checkout limpio y NOAA inaccesible, `pnpm
build` termina bien usando el seed y genera una portada marcada como degradada
si el seed está fuera de cadencia.

### B1.2 · Frescura y salud son cosas distintas
- `frescura` — antigüedad de la **observación**. Es del dato.
- `saludIngesta` — si el último **intento de descarga** funcionó. Es del sistema.

**Límite del diseño elegido, explícito:** si una revalidación falla, Next
conserva el HTML anterior, que conserva el `saludIngesta` anterior. La página no
puede saber que hubo un intento fallido sin almacenamiento externo.

**Política de v0:** los fallos de descarga son **alerta operativa**, no estado
visible. La UI degrada únicamente cuando la observación excede su cadencia —
condición que sí es legible desde el propio dato. Persistir `ultimoIntento` /
`ultimoExito` queda para v1, si hace falta.

### B1.3 · Estado degradado visible
Cuando la observación supera su cadencia, la portada lo dice **arriba**, con
antigüedad y fecha de la última observación buena. Nunca un número viejo como si
fuera de hoy.

### B1.4 · Cron que visite la portada ✅
ISR revalida con la primera request **posterior** al TTL. Sin tráfico, no se
actualiza nada. Un cron que visite la portada es parte del mecanismo, no un
extra.

**Restricción del plan Hobby, descubierta al desplegar:** Vercel Hobby sólo
admite cron **diario**. Un `0 * * * *` no es una advertencia — **rechaza el
deployment** con *"Hobby accounts are limited to daily cron jobs"*. Fue la causa
de que el primer deploy no produjera nada.

Queda en `0 12 * * *` (09:00 ART). Alcanza: el CPC publica el weekly los lunes y
RONI/ONI una vez por mes; el cron sólo pone un piso, porque con tráfico orgánico
la página revalida cada hora igual. Subir la frecuencia requiere plan Pro.

---

## Bloque 3 · Publicar y observar

Orden interno corregido: el deploy va **después** del estado oficial, porque B0.2
no cierra sin él y B0 bloquea el deploy.

### B3.1 · CI y checks determinísticos
No existe `.github/workflows`. Crear una CI concreta que corra `typecheck`,
tests de parsers y `check:design`.

`scripts/check-design.ts` no existe y `pnpm check:design` falla. Las tres que
importan primero: contraste AA sobre tokens, colores literales fuera de
`tracker.css`, y firma de dato.

Nota honesta: `DESIGN.md` §8 afirma que "sin fuente no compila". **Hoy es falso**
— `components/Valor.tsx:11` recibe un `number` pelado. O se hace cumplir, o se
corrige la afirmación.

### B3.2 · Estado oficial del CPC ✅
Relayar el *ENSO Advisory* vigente: texto declarado, fecha y link. Cierra B0.2.

Es la fuente **más frágil** del conjunto: HTML o texto editorial, no un `.txt` de
columnas fijas. Necesita su propio fixture, y su fallo no debe tumbar la portada
— si no se puede leer, se omite el bloque y se deja el link.

**Hecho.** Se usa `ensodisc_Sp.shtml`, la traducción **oficial de NOAA** — así no
traducimos ni interpretamos nosotros, que era el riesgo del README §8.2. El
README §2 ya señalaba que existe y casi nadie la conoce.

El parser ancla en el texto del comunicado, no en el markup (HTML de los 90 con
`<font>` y tablas anidadas). Verificado: con la fuente inalcanzable la portada
sigue viva, muestra el fallback, **no inventa un estado** y deja el enlace.

Por qué el bloque es imprescindible y no decorativo: en agosto de 2026 nuestro
umbral sobre RONI daba **débil**, mientras el CPC mantenía **Advertencia de El
Niño** con >90% de probabilidad de un evento **muy fuerte**. Mostrar uno solo de
los dos desinforma en cualquiera de las dos direcciones.

### B3.3 · Deploy ✅
Commit, remote, proyecto `elninotracker` en Vercel.
**Listo cuando:** `curl` —no el navegador— muestra el H1 y el valor en el HTML.

Hecho: `https://elninotracker.vercel.app` responde 200 y su HTML crudo trae
`<title>`, la fase (`El Niño · débil`), el H1 con el valor y el trimestre. Repo
público bajo MIT (código) y CC BY 4.0 (contenido).

### B3.4 · Observar una actualización real
No se cierra el día que se escribe. Se cierra cuando pasa una semana sin que
nadie toque nada y la fecha del dato avanzó sola.

### B3.5 · Un panel regional
Uno solo: el Litoral.

**Qué significa "validado", explícito:** fuente oficial citada, revisor
identificado por nombre, fecha de vigencia, y lenguaje condicional. **No se
inventa una probabilidad regional**: si la fuente describe asociaciones
históricas, el texto dice asociación histórica, no probabilidad. Sin revisor
asignado, este ítem no se ejecuta (README §10.3).

---

## Bloque 4 · Después del deploy

- **i18n.** Rutas, extracción de cadenas, `/es` habilitado y `/pt` **apagado**
  hasta tener traducciones reales. La aceptación por `grep` no sirve:
  comentarios e identificadores están legítimamente en castellano. Hace falta
  una regla ESLint sobre literales de JSX.
- **SEO.** `sitemap.ts`, `robots.ts`, JSON-LD, OG image.

---

## Deuda documental

Tres fuentes de verdad se contradicen y hay que arreglarlo antes de sumar más
automatización:

- `CLAUDE.md` decía que sólo existe el README, que no hay código y que no es un
  repo git. **Corregido en esta revisión.**
- `README.md` §6 y §7 todavía prescriben Vite, Recharts y `wksst8110.for`, que
  está muerto. Es el documento fundacional del dueño: se corrige con él, no por
  cuenta propia.
- `DESIGN.md:257` documenta `fuenteUrl`; el código usa `fuente: { nombre, url }`.
- "Cambiar el nombre cuesta una línea" es inexacto: `site.config.ts` lo tiene en
  `nombre`, `dominio` y `url`, y la URL se repite en el User-Agent de la ingesta.

---

## Orden

```
B0  verdad editorial · fases · RONI/ONI · accesibilidad   ← bloquea todo
B2  parsers · invariantes · red · fixtures y tests
B1  cache del resultado validado · seed · política de fallos · cron
B3  CI → estado oficial → deploy → observación → panel regional
B4  i18n · SEO
```

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Otra fuente muere en silencio como `wksst8110.for` | B2.1 + B1.3: se detecta y se muestra, no se oculta |
| Publicamos una fase mal descrita | B0.1 con fixture por fase; es la falla que más cuesta en credibilidad |
| Confundir nuestro umbral con el estado del CPC | B0.2 y B3.2 |
| Seguir clasificando con un índice superado | B0.2: RONI es el operativo desde feb-2026 |
| El Advisory es HTML editorial y se rompe | B3.2: su fallo omite el bloque, no tumba la portada |
| El panel regional se escribe sin validar | B3.5 es uno solo, a propósito, y necesita revisión externa (README §10.3) |
