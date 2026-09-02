# Plan 02 · v1 — "¿Qué significa para mí?"

> Corresponde a **README §9, v1** y **§5.2**, que el propio README llama
> *"el verdadero diferencial"*.
> Abierto 2026-09-02 · **revisión 3 tras segunda auditoría, mismo día.**
> Aprobado para ejecución.

## Qué cambió en la revisión 3

Cuatro correcciones de modelo. Ninguna replantea el proyecto.

1. **El estado editorial permitía combinaciones imposibles** — `validado` con
   revisor `null`. Ahora es una unión discriminada donde el estado *es* la
   evidencia, y `validado` exige especialista y credencial.
2. **Una fuente podía autodeclararse oficial.** `{ clase: 'organismo-oficial',
   url: 'https://example.com' }` pasaba el check. Ahora hay registro cerrado y
   las afirmaciones referencian ids, no objetos.
3. **El contenido editorial chocaba con i18n.** Decía que las cadenas viven en
   archivos por idioma y a la vez ponía `texto: string` en el esquema. Se
   separan: chrome en diccionario y verificado por ESLint; contenido editorial
   en el esquema por locale y verificado por un validador de ids.
4. **`confianza: alta|media|baja` era una afirmación sin fuente** disfrazada de
   metadato: parecía evaluación científica y nadie definía quién la asignaba. Se
   elimina. Queda `evidencia: consistente | mixta`, que describe la fuente.

Además: `estacion` pasa a tipo cerrado, `sin-señal-documentada` se vuelve una
clase de primera —para no empujar a inventar contenido en fase neutral—, el
presupuesto del mapa pasa a tener números verificables, el mapa usa el
`<Default>` de GIBS confirmando el tile, y los borradores **no** se bloquean en
`robots.txt` porque el crawler necesita entrar para leer el `noindex`.

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

### D0.1 · Estado editorial derivado de la evidencia
Los campos sueltos permitían estados imposibles —`validado` con revisor `null`—
así que el estado **es** la evidencia, en una unión discriminada:

```ts
type RevisionDueño = {
  autor: string
  fecha: string
  hashContenido: string
}

type RevisionEditorial =
  | { estado: 'borrador' }
  | ({ estado: 'revisado' } & RevisionDueño)
  | {
      estado: 'validado'
      revisionDueño: RevisionDueño
      especialista: string
      credencial: string      // por qué esta persona puede validar esto
      fecha: string
      hashContenido: string
    }
```

No se puede declarar `validado` sin acreditar quién validó y con qué credencial.

**El hash cubre** texto, estación, evidencia, fuentes **y traducciones**. Si
cualquiera cambia, el estado **degrada automáticamente a `borrador`**: no se
"conserva" una revisión sobre contenido que ya no es el revisado.

| Estado | Indexable | Dónde aparece |
|---|---|---|
| `borrador` | **no** (`noindex`) | sólo por URL directa |
| `revisado` | sí | navegación, sitemap, portada |
| `validado` | sí | además acredita al especialista |

El dueño pidió desplegar antes de revisar y eso se respeta: **el borrador se
publica y se mira en producción.** Lo que no se hace es ofrecérselo a Google.

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

**Dos coberturas distintas, no confundirlas:**

| | Vive en | Se verifica con |
|---|---|---|
| Chrome de interfaz | diccionario por idioma | ESLint sobre literales de JSX |
| Contenido editorial | `texto: Record<Locale, string>` en el esquema | validador por id: toda afirmación cubre los locales activos, con las mismas fuentes |

ESLint **no** cubre el contenido editorial y no debe intentarlo: son datos, no
cadenas de interfaz.

- **Corregir `DESIGN.md:169`**, que dice "pt-BR desde el día uno" mientras el
  plan devuelve 404. La redacción correcta es *arquitectura localizada en v1,
  traducción pt-BR diferida*. Actualizar también el roadmap del README.

**Listo cuando:** ESLint corre en CI y falla al introducir un literal en JSX, y
el validador editorial falla si una afirmación no cubre los locales activos.

---

## Bloque D2 · Esquema y validadores

### D2.1 · Climatología — el único tipo de v1

**Registro cerrado de fuentes.** Un objeto libre permitía inventar
`{ clase: 'organismo-oficial', url: 'https://example.com' }` y pasar el check.
Las afirmaciones referencian **ids**, no objetos:

```ts
const FUENTES = {
  senamhi:  { organismo: 'SENAMHI', clase: 'organismo-oficial', titulo: '…',
              url: '…', consultadoEl: '2026-09-02', seccion: '…' },
  enfen:    { … },
  ciifen:   { … },
  inmet:    { … },
  iri:      { … },
  noaaEnso: { … },
} as const

type FuenteId = keyof typeof FUENTES
```

Cada registro lleva organismo, título, URL, fecha de consulta y —para documentos
largos— página o sección. Así la referencia sigue siendo revisable aunque el
sitio cambie.

**La afirmación:**

```ts
type Estacion = 'todo-el-año' | 'primavera-verano' | 'otoño-invierno'
              | 'primavera' | 'verano' | 'otoño' | 'invierno'

type Afirmacion =
  | {
      clase: 'documentada'
      texto: Record<Locale, string>          // el contenido editorial vive acá
      estacion: Estacion
      evidencia: 'consistente' | 'mixta'     // lo que dice la fuente, no una nota nuestra
      fuentes: [FuenteId, ...FuenteId[]]
    }
  | {
      clase: 'sin-señal-documentada'
      texto: Record<Locale, string>
      fuentes: [FuenteId, ...FuenteId[]]     // que respalden la AUSENCIA de señal
    }
```

Tres cosas que corrige respecto de la revisión 2:

- **`confianza: alta|media|baja` se elimina.** Parecía una evaluación científica
  y nadie definía quién la asignaba: era una afirmación sin fuente disfrazada de
  metadato. Queda `evidencia: consistente | mixta`, que describe lo que dice la
  fuente, no nuestra impresión.
- **`estacion` es un tipo cerrado**, no texto libre.
- **`sin-señal-documentada` es una clase de primera**, con sus propias fuentes.
  Obligar arrays no vacíos sin esto empujaba a inventar contenido para la fase
  neutral. Decir "acá no hay señal clara, y esto lo respalda" es una respuesta
  completa.

**El texto editorial vive en el esquema, por locale** — no en el diccionario de
interfaz. Los dos se separan a propósito (ver D1).

```ts
type Climatologia = {
  id: string
  nombre: Record<Locale, string>
  paises: string[]
  porFase: Record<Fase, [Afirmacion, ...Afirmacion[]]>
  revision: RevisionEditorial
}
```

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

- **Última fecha disponible:** se toma el `<Default>` de la dimensión temporal
  de la capa **y se confirma que el tile responde**, retrocediendo día a día si
  no. Verificado el 2026-09-02: el tile de ese día devuelve **404** y el del
  2026-09-01 devuelve 200. Asumir "ayer", o el fin del último intervalo, rompe
  el mapa.
- **Antigüedad máxima:** si el tile más nuevo supera los 5 días, el bloque se
  marca como desactualizado, igual que las series.
- **Fallo de tile:** error o 404 muestra un estado vacío con enlace a NASA
  Worldview. Nunca un cuadro gris sin explicación.
- **Sin JavaScript:** el bloque muestra un texto que describe el estado y enlaza
  a la fuente. La página sigue siendo útil.
- **Encuadre:** límites y zoom fijos sobre el Pacífico ecuatorial y Sudamérica;
  no se entrega un globo libre.
- **Accesibilidad:** el mapa no puede ser la única vía a ningún dato.
- **Presupuesto de JS, con números:** es el **primer JS de cliente del
  proyecto**. Dos techos que la CI verifica por separado:
  **≤ 15 KB comprimidos de JS inicial** en la ruta (el mapa no entra en el
  bundle de entrada) y **≤ 260 KB comprimidos** al entrar en viewport, que es
  lo que pesa `maplibre-gl`. "Un techo declarado" no era verificable.
- **Atribución al dataset**, no sólo al servicio: GHRSST Level 4 MUR, además de
  NASA GIBS. NASA pide citar el dataset, no el entregador de imágenes.
- La paleta arcoíris no se replica en ningún otro gráfico (A2).

---

## Bloque D6 · SEO

Sólo para contenido `revisado` o `validado`.

**Los borradores NO se bloquean en `robots.txt`.** El crawler necesita poder
entrar para leer el `noindex`; bloquearlo en robots consigue lo contrario de lo
buscado. Quedan fuera de sitemap, de los `alternates` canónicos y de todo enlace
interno — que es lo que efectivamente los mantiene fuera del índice.

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
