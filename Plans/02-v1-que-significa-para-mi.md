# Plan 02 · v1 — "¿Qué significa para mí?"

> Corresponde a **README §9, v1** y **§5.2**, que el propio README llama
> *"el verdadero diferencial"*.
> Abierto 2026-09-02. **Pendiente de auditoría antes de ejecutar.**

## Por qué esta fase es distinta a la v0

La v0 era un problema de ingeniería: parsear, validar, cachear, desplegar. Los
errores eran verificables por máquina y se atraparon con tests.

**La v1 es un problema editorial.** El riesgo dejó de ser que el build falle y
pasó a ser que el sitio afirme algo falso sobre el clima de una región donde
vive gente que va a tomar decisiones. Eso no lo atrapa ningún test.

Por lo tanto este plan invierte el orden habitual: **primero el modelo que hace
imposible mentir, después el contenido.**

## Decisión del dueño, registrada

El README §10.3 preguntaba quién escribe los textos de impacto regional. Está
respondido: **los redacta el asistente, los revisa y corrige el dueño del
proyecto**, y se despliegan antes de esa revisión.

Consecuencia asumida: **contenido sin revisar va a estar público**. Eso es
aceptable sólo si el sitio lo dice en la cara del lector. De ahí C0.3, que no es
negociable ni postergable.

---

## Definición de terminado

1. Existe un panel por región para **las tres fases**, no sólo la actual.
2. **Ninguna afirmación sin fuente oficial citada**, verificable por check.
3. **Ninguna probabilidad inventada.** Una asociación histórica se llama
   asociación histórica; una probabilidad sólo existe si la publicó un organismo,
   con su fecha y su enlace.
4. El contenido no revisado se muestra **marcado como borrador en la página**.
5. El mapa de anomalía de TSM está, encuadrado y atribuido.
6. `/es` funciona con i18n real; `/pt` existe apagado.

Fuera de v1: años análogos, plume del IRI, resumen del comunicado mensual (son
v2, README §9).

---

## Bloque C0 · El modelo que impide mentir

Va primero. Sin esto, escribir contenido es escribir deuda.

### C0.1 · Tipo de afirmación
Una afirmación regional es una de dos cosas, y el tipo lo hace explícito:

```ts
type Afirmacion =
  | { tipo: 'asociacion-historica'; texto: string; fuente: Fuente }
  | { tipo: 'pronostico-oficial'; texto: string; probabilidad?: string;
      vigencia: string; fuente: Fuente }
```

`probabilidad` **sólo existe** en la variante oficial. El compilador impide
adjuntarle un número a una asociación histórica. Es la misma estrategia que el
tipo `Dato` en v0, aplicada a prosa.

### C0.2 · Estructura de región
```ts
type Region = {
  id: string                  // 'litoral', 'altiplano', …
  nombre: string
  paises: string[]
  porFase: Record<Fase, Afirmacion[]>   // las TRES fases, obligatorio
  revisadoPor: string | null            // null = borrador
  revisadoEl: string | null
}
```

`porFase` como `Record<Fase, …>` obliga a cubrir cálida, fría y neutral. Es la
misma trampa que B0.1 en v0 —donde la portada mentía en fase fría— resuelta por
tipo en vez de por disciplina.

### C0.3 · Marca de borrador visible
Si `revisadoPor === null`, el panel muestra un distintivo **en la página**, no
un comentario en el código. Texto explícito: redactado a partir de fuentes
citadas, todavía sin revisión de un especialista.

**Listo cuando:** ocultar la marca requiere completar `revisadoPor`, y un check
falla si un panel sin revisor se renderiza sin distintivo.

### C0.4 · Checks
Extender `scripts/check-design.ts`:
- toda `Afirmacion` tiene `fuente` con URL absoluta;
- ninguna `asociacion-historica` contiene un patrón de probabilidad
  (`\d+\s*%`, "probabilidad de", "chance de");
- toda región cubre las tres fases;
- toda región sin `revisadoPor` renderiza la marca de borrador.

---

## Bloque C1 · El contenido

### C1.1 · Alcance geográfico
El README §10.2 sigue abierto (Argentina primero vs. Sudamérica entera). Se
propone resolverlo por la vía barata: **las siete regiones que el propio §5.2 ya
nombra**, sin expandir.

Litoral argentino · Cuyo · Pampa húmeda · Costa peruana · Altiplano ·
Sur de Brasil · Chile central

### C1.2 · Fuentes citables — verificadas 2026-09-02

```
✅ climate.gov/enso            NOAA, blog ENSO. Divulgación en inglés, sólida.
✅ iri.columbia.edu            Pronóstico estacional y mapas de impacto.
✅ ciifen.org                  Centro regional oficial para el Pacífico sudeste.
✅ senamhi.gob.pe / ENFEN      Oficial de Perú. La mejor fuente para costa y altiplano.
✅ bom.gov.au/climate/enso     Segunda opinión independiente, con SOI.
✅ portal.inmet.gov.br         Oficial de Brasil.
❌ smn.gob.ar                  BLOQUEADO POR CLOUDFLARE ("Just a moment...").
                               No es un problema de User-Agent: es desafío de bot.
                               Se puede enlazar, NO se puede automatizar ni citar
                               programáticamente.
```

El bloqueo del SMN importa: es el servicio meteorológico del país de arranque y
no es legible por máquina. Refuerza C1.3.

### C1.3 · El contenido NO se scrapea
Los paneles son **contenido editorial versionado en el repo**, no una ingesta.

Razones, en orden de peso:
1. La asociación entre fase ENSO e impacto regional es conocimiento estable de
   literatura, no un dato que cambie cada semana. No hay nada que refrescar.
2. Scrapear seis organismos con seis formatos, uno de ellos detrás de
   Cloudflare, es exactamente la fragilidad que mata proyectos como este.
3. Versionado en git, el contenido es diffeable y revisable — que es justo lo
   que el flujo de revisión del dueño necesita.

Lo que **sí** es dinámico y ya está resuelto: la fase actual (RONI) y el estado
declarado (Advisory). El panel que se muestra se elige con eso.

### C1.4 · Redacción
Siete regiones × tres fases. Reglas de escritura, además de `DESIGN.md` §5:

- **Lenguaje condicional siempre.** "suele", "tiende a", "se asocia con" — nunca
  "va a haber".
- **Estacionalidad explícita.** El impacto de El Niño en el Litoral no es igual
  en octubre que en abril. Si la fuente acota la estación, el texto la acota.
- **Decir cuándo no se sabe.** Una región con señal débil o inconsistente lo
  dice. Es más creíble que inventar una consecuencia.
- **Sin catástrofe.** Ver `DESIGN.md` A3. "Crecidas más probables que lo normal",
  no "el Paraná se desborda".

---

## Bloque C2 · El mapa

### C2.1 · Raster GIBS
`maplibre-gl` con la capa `GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies`
(WMTS, verificada al día en v0). Sin NetCDF, sin pipeline de tiles.

**Costo nuevo y real:** es el **primer JavaScript de cliente del proyecto**.
Hasta ahora la portada era HTML y SVG sin JS. `maplibre-gl` pesa ~200 KB
comprimido. Por lo tanto:

- carga diferida, sólo cuando el bloque entra en viewport;
- la página debe seguir siendo útil sin él;
- el mapa **no** sube a la portada por encima del contenido (`DESIGN.md` §4: el
  mapa nunca va primero).

### C2.2 · Encuadre y atribución
La paleta arcoíris de NASA no se puede restilar (decisión ya tomada en v0). Se
encuadra como **imagen satelital citada**: marco propio, atribución NASA
visible, fecha del tile. Su paleta no se replica en ningún otro gráfico (A2).

---

## Bloque C3 · i18n

Deuda heredada de la v0 (B4). Se paga acá porque los paneles regionales
multiplican el texto por siete y esperar lo vuelve impagable.

- Extraer cadenas a archivos de mensajes.
- `/es` funcionando; **`/pt` apagado** hasta tener traducción real.
- Aceptación por **regla ESLint sobre literales de JSX**, no por `grep`:
  comentarios e identificadores están legítimamente en castellano.

---

## Bloque C4 · SEO

`sitemap.ts`, `robots.ts`, JSON-LD (`Dataset` para las series, `Article` para
las explicaciones), OG image.

Cada región es una URL propia (`/regiones/litoral`): son siete páginas de
búsqueda de cola larga —"el niño litoral", "la niña sequía altiplano"— que es
donde un dominio sin autoridad puede competir. La portada sola no rankea contra
La Nación; siete páginas específicas y bien estructuradas sí tienen chance.

---

## Orden

```
C0  modelo que impide mentir      ← nada se escribe antes
C1  contenido de las 7 regiones
C3  i18n                          ← antes de que el texto crezca más
C2  mapa
C4  SEO
```

C3 va antes que C2 a propósito: el mapa no agrega texto, los paneles sí, y la
deuda de i18n se encarece con cada cadena.

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| **Publicar una afirmación climática falsa** | C0.1 y C0.4 la vuelven inexpresable sin fuente; C0.3 avisa al lector que falta revisión |
| Inventar una probabilidad | El tipo lo impide; el check lo detecta |
| Un panel miente en la fase que no probamos | `Record<Fase, …>` obliga a las tres. Es la lección de B0.1 |
| El mapa rompe el rendimiento | Carga diferida, y la página funciona sin él |
| El contenido sin revisar se olvida así | `revisadoPor: null` es visible en la página, no sólo en el repo |
| Ampliar a más regiones antes de validar una | C1.1 congela el alcance en las siete del §5.2 |

---

## Lo que este plan NO resuelve

Honestidad sobre sus propios límites, para el auditor:

- **No convierte al asistente en especialista.** El contenido va a estar
  sostenido por fuentes citadas y escrito en condicional, pero la revisión
  humana sigue siendo necesaria y el plan la asume pendiente.
- **No hay verificación automática de veracidad.** Los checks garantizan que
  toda afirmación tenga fuente y que ninguna asociación histórica lleve
  probabilidad. **No garantizan que el texto describa correctamente a su
  fuente.** Eso sólo lo puede hacer un lector.
- **No resuelve el §10.4** (si el proyecto es sostenible). Sigue abierto.
