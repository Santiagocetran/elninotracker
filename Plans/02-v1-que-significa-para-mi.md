# Plan 02 · v1 — "¿Qué significa para mí?"

> Corresponde a **README §9, v1** y **§5.2**, que el propio README llama
> *"el verdadero diferencial"*.
> Abierto 2026-09-02 · **revisión 2 tras auditoría, mismo día.**

## Qué cambió en la revisión 2

La revisión 1 tituló un bloque *"el modelo que impide mentir"* y la auditoría
mostró que no lo impedía. Los cambios de fondo:

1. **Se separa climatología de pronóstico.** La revisión 1 se contradecía:
   metía `pronostico-oficial` dentro de contenido que declaraba estable y sin
   necesidad de refresco. Un pronóstico vence; una asociación histórica no.
2. **El pronóstico regional sale de v1.** No existe ingesta confiable para él
   —el SMN está bloqueado por Cloudflare— y sin ingesta un pronóstico versionado
   a mano es dato rancio esperando su turno. El outlook global ya vive en el
   bloque del Advisory, que sí es automático.
3. **Borrador ya no significa "público e indexable".** Se despliega, que es lo
   que el dueño pidió, pero con `noindex` y fuera de sitemap, navegación y
   portada. Se revisa por URL directa.
4. **Se corrige una afirmación falsa del propio plan.** Decía "sin revisión de
   un especialista" cuando el revisor es el dueño, que no está establecido como
   especialista en clima. Ahora la escalera de estados lo dice con precisión.
5. **i18n y rutas van antes del contenido.** Escribir 21 paneles en castellano y
   después extraer cadenas es deuda garantizada, y `DESIGN.md:169` exige pt-BR
   desde el día uno.
6. **Los checks se reparten por capa.** `check-design.ts` es análisis estático y
   no puede verificar lo que se renderiza. Además **ESLint no está instalado**,
   así que la revisión 1 pedía como criterio algo inejecutable.
7. **`/datos` se difiere formalmente.** `DESIGN.md:34`, `DESIGN.md:152` y
   `CLAUDE.md:161` lo ubican en v1; la revisión 1 lo hizo desaparecer en
   silencio. Ver D0.

---

## Definición de terminado

1. Existe climatología por región para **las tres fases**, con arrays no vacíos.
2. **Ninguna afirmación sin fuente oficial identificada**, verificable.
3. **Ninguna probabilidad en climatología.** Estructuralmente imposible.
4. Contenido en borrador: desplegado, con distintivo visible, **`noindex`, fuera
   de sitemap, navegación y portada**.
5. Mapa de anomalía de TSM con fallback, presupuesto de JS y atribución al
   dataset.
6. `/es` completo; `/pt` resuelto según D1.

---

## Bloque D0 · Decisiones previas a escribir código

Ninguna es técnica. Todas bloquean.

### D0.1 · Escalera de estados editoriales
```ts
type EstadoEditorial = 'borrador' | 'revisado' | 'validado'
```

| Estado | Quién | Indexable | Dónde aparece |
|---|---|---|---|
| `borrador` | nadie todavía | **no** (`noindex`) | sólo por URL directa |
| `revisado` | el dueño | sí | navegación, sitemap, portada |
| `validado` | especialista nombrado | sí | además acredita al revisor |

El dueño pidió desplegar antes de revisar y eso se respeta: **el borrador se
publica y se mira en producción.** Lo que no se hace es ofrecérselo a Google.
Indexar una afirmación climática sin revisar ataca el único activo del sitio.

`validado` existe porque `revisado` no es lo mismo que revisión de especialista,
y el sitio no debe insinuar lo contrario.

### D0.2 · Matriz de rutas
```
/                        → redirección permanente a /es
/es                      portada
/es/regiones/[region]    panel regional
/pt…                     ver D1
sitemap                  sólo entradas 'revisado' o 'validado'
hreflang / canonical     sólo entre idiomas realmente traducidos
```

### D0.3 · Precedencia de señal
RONI y el Advisory **pueden discrepar** — hoy discrepan: RONI da *débil* y el
CPC declara *Advertencia de El Niño*. La portada ya los separa a propósito.

Regla: **la fase que elige el panel es la de RONI**, y el panel se presenta como
*"lo que suele pasar en esta región durante una fase así"* — asociación
histórica, nunca consecuencia pronosticada del evento en curso. El Advisory
conserva su bloque independiente y no selecciona nada.

Si RONI no está disponible, no se adivina: el panel muestra la climatología de
las tres fases o ninguna, nunca una elegida al azar.

### D0.4 · `/datos` — diferido formalmente
Se difiere a **v2**. Razón: v1 ya carga siete regiones, i18n, mapa y SEO, y
`/datos` no aporta al diferencial del §5.2.

**Requisito:** actualizar `DESIGN.md:34`, `DESIGN.md:152` y `CLAUDE.md:161`
**antes** de empezar D2. Un plan no difiere nada si los otros documentos siguen
prometiéndolo.

---

## Bloque D1 · Rutas e i18n

Va antes del contenido: cada panel nuevo encarece la extracción.

- `app/[lang]/…` según la guía de i18n del App Router.
- Mensajes en archivos por idioma, no en componentes.
- **`/pt`:** devuelve 404 hasta tener traducción real. No se sirve castellano
  bajo bandera portuguesa, y no entra a sitemap ni a hreflang. `DESIGN.md:169`
  exige que la *arquitectura* soporte pt-BR desde el día uno — no que se mienta
  con una traducción inexistente.
- **Instalar y configurar ESLint** (hoy no existe) con una regla sobre literales
  de JSX. Sin esto, el criterio de "ninguna cadena hardcodeada" no es
  verificable.

**Listo cuando:** ESLint corre en CI y falla al introducir un literal en JSX.

---

## Bloque D2 · Esquema y validadores

### D2.1 · Climatología — el único tipo de v1
```ts
type Fuente = {
  id: string                  // 'senamhi', 'ciifen', 'noaa-climate-gov'
  clase: 'organismo-oficial' | 'centro-regional' | 'literatura'
  nombre: string
  url: string                 // absoluta, verificada
}

type Afirmacion = {
  texto: string
  estacion: string | null     // 'primavera-verano' | null si aplica todo el año
  confianza: 'alta' | 'media' | 'baja' | 'sin-señal-clara'
  fuentes: [Fuente, ...Fuente[]]   // al menos una, POR afirmación
}

type Climatologia = {
  id: string
  nombre: string
  paises: string[]
  porFase: Record<Fase, [Afirmacion, ...Afirmacion[]]>  // no vacío por tipo
  estadoEditorial: EstadoEditorial
  revisadoPor: string | null
  revisadoEl: string | null
  hashRevisado: string | null   // hash del contenido al momento de revisar
}
```

Qué corrige cada pieza, respecto de la auditoría:

- `fuentes` es **por afirmación**, no por panel: una URL no puede quedar
  respaldando un párrafo entero de afirmaciones distintas.
- `[Afirmacion, ...Afirmacion[]]` hace que un array vacío **no compile**.
- `clase` distingue organismo oficial de literatura; un check puede exigir que
  toda afirmación tenga al menos una fuente de clase `organismo-oficial`.
- `confianza` incluye `sin-señal-clara`: decir que no se sabe es una respuesta
  válida y más creíble que inventar una consecuencia.
- `hashRevisado` **invalida la revisión si el texto cambia después**. Sin esto,
  `revisadoPor` sobrevive a una edición posterior y miente.
- **No hay campo de probabilidad.** No existe, así que no se puede inventar.

### D2.2 · Outlook — fuera de v1
La variante de pronóstico regional se elimina. Vuelve cuando exista una ingesta
automática y fechada que la sostenga, con `publicadoEl` y `venceEl`, y con
ocultamiento automático al vencer. Mientras tanto, el único pronóstico del sitio
es el global del Advisory, que ya es automático.

### D2.3 · Verificación, repartida por capa
La auditoría tiene razón: `check-design.ts` es estático y no puede afirmar nada
sobre lo renderizado.

| Capa | Verifica |
|---|---|
| TypeScript + esquema | forma de los datos, arrays no vacíos, ausencia de probabilidad |
| Tests unitarios | fuente oficial presente, hash de revisión vigente, selección de fase |
| Tests de render | distintivo de borrador, `noindex`, enlaces de fuente presentes |
| ESLint | literales en JSX (tras D1) |
| `check-design.ts` | reglas visuales determinísticas, como hasta ahora |

**Ninguna de estas verifica que el texto describa correctamente a su fuente.**
Ver "Lo que este plan no resuelve".

---

## Bloque D3 · Una región piloto

**Una sola región, las tres fases, el flujo completo de punta a punta** antes de
escribir las otras seis.

Región: **Litoral argentino** — la de señal ENSO más fuerte y clara de las
siete, y la que el README nombra primero.

**Listo cuando:** el panel existe en las tres fases, pasa todos los validadores,
se despliega como `borrador` con `noindex`, el dueño lo revisa, pasa a
`revisado`, entra al sitemap, y una edición posterior del texto **invalida la
revisión automáticamente** por hash.

Recién con ese ciclo demostrado se escriben las otras seis.

---

## Bloque D4 · Las seis regiones restantes

Cuyo · Pampa húmeda · Costa peruana · Altiplano · Sur de Brasil · Chile central.
Alcance congelado en las siete del §5.2; no se amplía en v1.

### Fuentes citables — verificadas 2026-09-02
```
✅ climate.gov/enso           NOAA, divulgación ENSO
✅ iri.columbia.edu           pronóstico estacional y mapas de impacto
✅ ciifen.org                 centro regional oficial del Pacífico sudeste
✅ senamhi.gob.pe / ENFEN     oficial de Perú — la mejor para costa y altiplano
✅ portal.inmet.gov.br        oficial de Brasil
✅ bom.gov.au/climate/enso    segunda opinión independiente, con SOI
❌ smn.gob.ar                 BLOQUEADO POR CLOUDFLARE ("Just a moment...").
                              No es User-Agent: es desafío de bot. Se puede
                              enlazar; no automatizar ni citar por máquina.
```

### Reglas de redacción
- **Condicional siempre:** "suele", "tiende a", "se asocia con". Nunca "va a".
- **Estación explícita** cuando la fuente la acota.
- **Decir cuándo no se sabe** (`confianza: 'sin-señal-clara'`).
- **Sin catástrofe** (`DESIGN.md` A3): "crecidas más probables que lo normal",
  no "el Paraná se desborda".

---

## Bloque D5 · El mapa

`maplibre-gl` + capa GIBS `GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies`
(WMTS verificada en v0, al día).

Criterios que la revisión 1 no tenía:

- **Última fecha disponible:** se descubre desde `WMTSCapabilities.xml`, no se
  asume "ayer". El último rango temporal de la capa da el borde real.
- **Antigüedad máxima:** si el tile más nuevo supera los 5 días, el bloque se
  marca como desactualizado, igual que las series.
- **Fallo de tile:** error o 404 muestra un estado vacío con enlace a NASA
  Worldview. Nunca un cuadro gris sin explicación.
- **Sin JavaScript:** el bloque muestra un texto que describe el estado y enlaza
  a la fuente. La página sigue siendo útil.
- **Encuadre:** límites y zoom fijos sobre el Pacífico ecuatorial y Sudamérica;
  no se entrega un globo libre.
- **Accesibilidad:** el mapa no puede ser la única vía a ningún dato.
- **Presupuesto de JS medible:** es el **primer JS de cliente del proyecto**.
  Carga diferida por viewport, y un techo declarado que la CI verifica.
- **Atribución al dataset**, no sólo al servicio: GHRSST Level 4 MUR, además de
  NASA GIBS. NASA pide citar el dataset, no el entregador de imágenes.
- La paleta arcoíris no se replica en ningún otro gráfico (A2).

---

## Bloque D6 · SEO

Sólo para contenido `revisado` o `validado`.

`sitemap.ts` con alternates localizados, `robots.ts`, JSON-LD (`Dataset` para
series, `Article` para explicaciones), OG image.

Cada región es una URL propia: siete páginas de cola larga —"el niño litoral",
"la niña sequía altiplano"— es donde un dominio sin autoridad puede competir. La
portada sola no le gana a La Nación.

---

## Orden

```
D0  decisiones de política, precedencia y /datos   ← nada arranca antes
D1  rutas · i18n · ESLint
D2  esquema y validadores
D3  UNA región piloto, ciclo completo hasta 'revisado'
D4  las seis restantes
D5  mapa
D6  SEO, sólo sobre contenido revisado
```

---

## Riesgos

| Riesgo | Mitigación |
|---|---|
| **Publicar una afirmación climática falsa** | D0.1: borrador no indexable; D2 exige fuente oficial por afirmación |
| Google indexa contenido sin revisar | `noindex` + fuera de sitemap hasta `revisado` |
| Inventar una probabilidad | No existe el campo en el esquema de v1 |
| La revisión sobrevive a una edición del texto | `hashRevisado` la invalida |
| Un panel miente en la fase no probada | `Record<Fase, [Afirmacion, ...]>` obliga a las tres, no vacías |
| Confundir climatología con pronóstico | D0.3: el panel dice "suele pasar", el Advisory queda aparte |
| El mapa rompe rendimiento | D5: carga diferida, techo de JS verificado en CI |
| `/datos` prometido en tres documentos | D0.4 lo difiere y exige corregirlos antes de D2 |

---

## Lo que este plan NO resuelve

- **No convierte al asistente en especialista**, ni al dueño tampoco. Por eso
  `validado` es un estado distinto de `revisado`.
- **No hay verificación automática de veracidad.** Los checks garantizan que
  toda afirmación tenga fuente oficial y que ninguna lleve probabilidad. **No
  garantizan que el texto describa correctamente a su fuente.** Eso sólo lo hace
  un lector, y es el motivo de la escalera de D0.1.
- **No resuelve el §10.4** (si el proyecto es sostenible). Sigue abierto.
