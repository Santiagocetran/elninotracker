# Plan 04 · v1 — Bloque D4, las seis regiones restantes

> Corresponde a **Plan 02 (`02-v1-que-significa-para-mi.md`), Bloque D4**.
> Abierto 2026-09-03, después de cerrar D5 (el mapa).
> **Revisión 1 (2026-09-03):** el dueño auditó el borrador y encontró tres
> hallazgos altos y tres medios — la arquitectura estaba bien, la estrategia
> editorial no. Corregido con texto crudo verificado de las fuentes, no con
> más supuestos. Ver "Qué cambió en la revisión 1".
> **Revisión 2 (2026-09-03):** la revisión 1 seguía usando el mismo
> razonamiento que decía eliminar — silencio de un documento como prueba de
> ausencia — pero aplicado a la fase neutral en vez de a una región. Corregido
> con una fuente que sí describe el mecanismo (no la ausencia regional). Ver
> "Qué cambió en la revisión 2".

## Contexto

README §5.2 fija las siete regiones; Litoral ya está `revisado`. Quedan:
**Cuyo, Pampa húmeda, costa peruana, altiplano, sur de Brasil, Chile central.**

El esquema, el validador y el patrón de archivo ya existen y no cambian de
forma (D2.1–D3). El trabajo real es **investigar qué dice cada fuente oficial
de cada región, en cada fase, con qué palabras exactas — y no escribir nada
que la fuente no respalde**. CLAUDE.md ya registra el costo de equivocarse acá:
una cita atribuida a `climate.gov/enso` no existía en esa página.

## Qué cambió en la revisión 1

El borrador clasificaba mal la dificultad y proponía un atajo que el propio
esquema prohíbe. Corregido con el texto **crudo** de las dos páginas NOAA que
ya están en `FUENTES` (`elninosfc.shtml`, `laninasfc.shtml` — las bajé con
`curl`, no las resumí de memoria):

1. **Chile central SÍ tiene fuente directa — el borrador decía que no.**
   `noaaCpcElNino` dice, textual: *"wetter than normal conditions tend to be
   observed (...) during June-August (JJA) in the intermountain regions of the
   United States and **over central Chile**."* Es un dato real que ya estaba en
   el registro y no lo usé. Corrige la clasificación y el orden de trabajo.
2. **`sin-señal-documentada` no es "la fuente no lo menciona".** El esquema
   exige una fuente que respalde la AUSENCIA de señal (`esquema.ts` — el
   comentario del campo `fuentes` en esa variante), no el silencio de una
   fuente sobre otra cosa. El `FAQ` del CPC que proponía como comodín solo
   define qué es la fase neutral — no dice nada de ninguna región. **Corregido:**
   esa clase se reserva para (a) la fase **neutral**, donde `noaaCpcImpactos`
   no tiene sección neutral para NINGUNA región del mundo — ausencia
   estructural del documento, ya usada así en Litoral — o (b) una fase
   El Niño/La Niña donde una fuente diga explícitamente que la relación es
   débil o inconsistente para esa región. Si no existe eso, **la fase queda
   bloqueada**, no rellenada.
3. **Las etiquetas geográficas no coinciden con lo que dicen las fuentes.**
   El texto exacto de NOAA es *"coastal Ecuador, **northwestern** Peru"* — no
   "costa peruana" en general (esa frase no cubre el sur, ni Arequipa/Tacna).
   Y "central Argentina" en estos documentos es la región de clima húmedo
   templado (la Pampa) — **no está claro que incluya Cuyo**, que es árido y
   está del otro lado del país, pegado a la cordillera. Usar la misma fuente
   para las dos regiones sin más sería exactamente el error que el dueño
   señaló: extender una etiqueta amplia más allá de lo que la fuente dice.

Además: **`CLAUDE.md` tenía dos líneas obsoletas** (Litoral seguía descripto
como `borrador`, D5 como pendiente) — ya corregidas en este mismo pase, sin
esperar a que cierre D4.

## Qué cambió en la revisión 2

Cinco correcciones más, la primera de fondo:

1. **Neutral seguía siendo silencio disfrazado.** La revisión 1 decía "el
   documento no tiene sección neutral para ninguna región" y lo trataba como
   evidencia de ausencia — es el mismo error que la propia revisión 1
   denunciaba, solo que aplicado a una fase en vez de a una región. Bajé el
   FAQ del CPC completo (`ensofaq.shtml`) y NO dice "por lo tanto no hay
   impacto regional en neutral" — dice, textual: *"During ENSO-neutral
   periods the ocean temperatures, tropical rainfall patterns, and
   atmospheric winds over the equatorial Pacific Ocean are near the
   long-term average."* Es una afirmación sobre el **mecanismo** (el Pacífico
   ecuatorial, la causa), no sobre ninguna región de Sudamérica (el efecto).
   **Corregido:** el texto de neutral para las siete regiones ya no dice "no
   hay señal documentada para esta región" (una afirmación regional que
   ninguna fuente respalda) sino que describe el mecanismo, apoyado en la
   propia lógica causal de `noaaCpcImpactos` (los patrones regionales que
   describe se originan en el calentamiento/enfriamiento anómalo del
   Pacífico): en neutral esa anomalía no existe, así que el mecanismo que
   produce esos patrones no está activo. Es una afirmación **general y
   verificable**, no una conclusión regional sin fuente. Ver la redacción
   modelo en "Protocolo de cita", punto 7. (Nota aparte: el texto de neutral
   de Litoral, ya `revisado`, tiene la misma imprecisión regional-por-omisión
   y queda fuera de este plan — tocarlo degradaría su revisión por hash y es
   decisión del dueño, no de D4.)
2. **`seccion` es de la fuente, no de la afirmación — no alcanza para citar
   dos pasajes distintos de la misma URL.** `noaaCpcElNino` ya existe con
   `seccion` genérica para Brasil/Argentina; Perú y Chile citan pasajes
   distintos de esa misma página. **Corregido:** en vez de tocar el esquema
   (reabrir D2.1) o mantener una matriz de evidencia separada del código, se
   agregan entradas **hermanas** en `FUENTES` — misma URL, mismo
   `consultadoEl`, `seccion` propia y acotada al pasaje real — sin tocar ni
   renombrar `noaaCpcElNino`/`noaaCpcLaNina` (Litoral los referencia por id y
   su hash depende de eso). Ver la lista de IDs nuevos más abajo.
3. **La lista de tests era una intención, no un compromiso.** Se enumeran
   explícitamente los seis tests de la sección "Tests", uno por hueco
   encontrado, en vez de una promesa genérica de "cobertura tabla-por-región".
4. **"Terminado" no distinguía cierre total de entrega parcial.** Se separa en
   D4a (regiones con evidencia completa hoy) y D4b (investigación de las que
   faltan). El título del documento sigue siendo D4 completo; D4a es lo que
   se entrega en este pase.
5. **La regex de países no valida ISO, solo formato.** Se reemplaza por un
   conjunto cerrado de códigos válidos (los países sudamericanos relevantes al
   proyecto), mismo criterio que ya usa el registro de `FUENTES` y `LOCALES` —
   cerrado, no abierto.

## Matriz región × fase × fuente (verificada, no de memoria)

Construida antes de escribir ningún archivo, como pide el dueño. "Bloqueada"
significa: no se escribe esa fase todavía, se sigue investigando.

| Región | El Niño | La Niña | Neutral |
|---|---|---|---|
| **Sur de Brasil** | ✅ `noaaCpcElNino`, DJF, más húmedo ("southern Brazil") | ✅ `noaaCpcLaNina`, **JJA** (no DJF — la fuente no es simétrica), más seco ("southern Brazil") | ✅ mecanismo general (ver punto 1 de la revisión 2) |
| **Pampa húmeda** | ✅ `noaaCpcElNino`, DJF, más húmedo ("central Argentina") | ✅ `noaaCpcLaNina`, JJA, más seco ("central Argentina") | ✅ mecanismo general |
| **Costa peruana** | ✅ `noaaCpcElNinoNwPeru` (entrada hermana nueva), DJF, más húmedo ("northwestern Peru") — **texto acotado al norte**, no a toda la costa | ✅ `noaaCpcLaNinaNwPeru` (entrada hermana nueva), DJF, más seco ("northwestern Peru") — misma acotación | ✅ mecanismo general |
| **Chile central** | ✅ `noaaCpcElNinoCentralChile` (entrada hermana nueva), JJA, más húmedo ("central Chile") — hallazgo de la revisión 1 | ❌ **bloqueada** — la página de La Niña no menciona Chile en absoluto | ✅ mecanismo general, pero solo se despliega si El Niño y La Niña están las dos resueltas |
| **Cuyo** | ⚠️ **bloqueada** — "central Argentina" no es claramente Cuyo; necesita fuente propia (candidato: literatura de IANIGLA sobre nieve andina, sin verificar) | ⚠️ **bloqueada**, mismo motivo | — |
| **Altiplano** | ❌ **bloqueada** — sin fuente en el registro; candidato SENAMHI/ENFEN (`gob.pe/institucion/senamhi/informes-publicaciones`, responde 200, sin explorar el contenido todavía). También falta decidir qué países lleva `paises` (Perú/Bolivia/Chile/Argentina comparten altiplano) — parte de la misma investigación | ❌ **bloqueada** | — |

**Una región no se despliega con una fase bloqueada** — el esquema exige las
tres fases con arrays no vacíos, y rellenar una fase bloqueada con cualquier
cosa es precisamente el riesgo que esta revisión corrige. Con la corrección
de neutral (revisión 2), **Sur de Brasil y Pampa húmeda están completas hoy**.
Costa peruana necesita solo decidir la redacción de la acotación geográfica.
Chile central, Cuyo y Altiplano necesitan una ronda más de investigación antes
de escribir un solo archivo.

### D4a / D4b — qué se cierra en este pase y qué no

- **D4a (este pase):** Sur de Brasil, Pampa húmeda, Costa peruana. Sumado a
  Litoral (ya `revisado`), quedan **4 de 7** regiones con archivo y contenido.
  D4 **no cierra** con esto — el título del bloque sigue abierto.
- **D4b (investigación, sin fecha fija):** Chile central (falta La Niña),
  Cuyo (fuente completa), Altiplano (fuente completa + países). D4 cierra
  recién cuando las tres tengan sus tres fases resueltas y entren a `TODAS`.

## Protocolo de cita (para cada afirmación nueva, sin excepción)

Antes de escribir una `Afirmacion`, registrar y verificar:

1. **Región exacta que cubre la fuente** (no la etiqueta editorial de la
   región — la frase textual: "northwestern Peru", no "costa peruana").
2. **Fase** (El Niño / La Niña) y **estación** (DJF/JJA/etc, tal como la da
   la fuente — no asumir simetría entre fases, como probó ser falso para Sur
   de Brasil).
3. **Variable**: precipitación, temperatura, u otra — no mezclar sin decirlo.
4. **Naturaleza del dato**: composición climatológica histórica (lo que es
   `noaaCpcElNino`/`noaaCpcLaNina`), no un pronóstico ni una observación de un
   evento puntual.
5. **Sección/página exacta, por pasaje, no por URL.** `seccion` vive en
   `FUENTES`, que es por URL — si dos regiones citan pasajes distintos de la
   misma página (Perú y Chile en `elninosfc.shtml`, junto con Brasil/Argentina
   que ya usa `noaaCpcElNino`), **no se reusa la misma entrada**: se crea una
   hermana con su propio id, misma URL y `consultadoEl`, `seccion` acotada al
   pasaje real. Nunca se toca ni renombra una entrada que Litoral ya referencia
   (`noaaCpcElNino`, `noaaCpcLaNina`, etc. — su hash depende del id).
6. **Por qué una página sin cambios recientes sigue siendo la referencia
   correcta**: `elninosfc.shtml`/`laninasfc.shtml` son composiciones
   climatológicas de décadas de eventos, no páginas de estado — no necesitan
   actualizarse para seguir siendo válidas, a diferencia de una página de
   "última condición" (que sí sería sospechosa si no cambió en años). Anotarlo
   en el comentario de `fuentes.ts` para que quien audite después no lo lea
   como negligencia.
7. **Neutral no afirma ausencia regional — describe el mecanismo.** Modelo de
   redacción (reemplaza el patrón "no hay señal documentada para esta región"
   de la revisión 1): *"En condiciones neutrales, el Pacífico ecuatorial está
   cerca de su temperatura y presión habituales — no hay ni el calentamiento
   de El Niño ni el enfriamiento de La Niña. Como los patrones de lluvia que
   se describen para esta región dependen de esa anomalía, en neutral no
   operan de la misma manera: el clima de la zona responde a otros factores."*
   Cita `noaaCpcFaq` (define neutral, sobre el Pacífico) y `noaaCpcImpactos`
   (describe el mecanismo causal). Ninguna de las dos dice nada de la región
   puntual — y el texto ya no pretende que lo digan.

## Endurecer el registro antes de escribir contenido

Encontrado en la auditoría, dos huecos reales en `lib/regiones/`:

- **`paises: string[]` no se valida.** `validar.ts` no revisa que no esté
  vacío, y una regex de formato (`/^[A-Z]{2}$/`) aceptaría códigos que no
  existen (`ZZ`). Se reemplaza por un **conjunto cerrado**, mismo criterio que
  `FUENTES`/`LOCALES`: `PAISES_VALIDOS = ['AR','BO','BR','CL','EC','PE',
  'PY','UY'] as const` (los ocho países sudamericanos relevantes al alcance
  del proyecto — ampliable si hace falta). `validarClimatologia` exige
  `paises.length > 0` y cada código dentro de ese conjunto.
- **IDs duplicados se pisan en silencio.** `lib/regiones/index.ts` arma
  `REGIONES` con `Object.fromEntries` — si dos regiones comparten `id`, la
  segunda reemplaza a la primera sin error. Se agrega una verificación en el
  mismo módulo, antes de construir `REGIONES`, que junta los ids en un
  `Set` y lanza si el tamaño no coincide con `TODAS.length`.
- **Formato del `id`** (usado en la URL `/es/regiones/[id]`): se agrega un
  chequeo de slug seguro (`/^[a-z0-9-]+$/`) en `validarClimatologia`.

## Tests — hoy solo cubren Litoral por nombre, no las siete regiones

`tests/regiones.test.ts` importa `litoral` directamente en cada test;
`tests/regiones.render.test.tsx` renderiza solo `litoral`. Ninguno de los dos
prueba, sobre el registro completo:

- el conjunto exacto de ids esperado;
- que las seis nuevas queden en `borrador` (no `revisado` por accidente);
- que `generateMetadata` devuelva `robots: { index: false }` para una región
  en `borrador` (hoy solo se prueba el caso indexable, con Litoral);
- que `regionesPublicas()` excluya a las seis mientras sigan en `borrador`.

**Se agregan, explícitamente, estos seis tests** (no una promesa genérica de
"cobertura tabla-por-región"):

1. **Conjunto exacto de siete ids** — `assert.deepEqual(idsDeRegiones().sort(),
   ['altiplano', 'costa-peruana', ...].sort())`, actualizado a medida que D4a/
   D4b agregan regiones. Falla si sobra o falta una.
2. **Tabla por región** (recorriendo `Object.values(REGIONES)`, no un id
   fijo): `validarClimatologia` da `[]`, las tres fases no vacías, toda fuente
   citada existe y es `https`, `paises` no vacío y dentro del conjunto
   cerrado.
3. **Estado esperado por región** — Litoral es `revisado`; las demás (D4a en
   adelante) son `borrador`. Un solo test con el mapa `id → estado esperado`,
   no una muestra.
4. **`regionesPublicas()` excluye los borradores** — su resultado, hoy y tras
   D4a, es exactamente `[litoral]`.
5. **`sitemap()` no incluye ninguna región en borrador** — test de integración
   sobre `app/sitemap.ts` (no solo sobre `regionesPublicas()`, que es la
   función que usa; se prueba también la salida real del sitemap).
6. **`generateMetadata` da `noindex` para cada región en borrador, no solo
   una muestra** — recorre las regiones no-Litoral y confirma
   `robots.index === false` y `alternates === undefined` para todas.

Los tests existentes de Litoral (revisado, hash, degradación) quedan igual:
son específicos de ESE estado, no del mecanismo genérico.

## Orden de trabajo

1. **Ahora, antes de cualquier región**: endurecer `validar.ts`/`index.ts`
   (lista cerrada de países, ids únicos) y agregar los seis tests de la
   sección anterior (menos el de conjunto-de-ids, que arranca con solo
   Litoral y se actualiza en cada paso siguiente). Corre en verde con Litoral
   solo — es la base sobre la que se agregan las regiones sin repetir los
   mismos huecos.
2. **D4a — Sur de Brasil, Pampa húmeda, Costa peruana**: las tres fases de
   cada una están resueltas (El Niño/La Niña con fuente directa, neutral con
   el mecanismo general de la revisión 2). Costa peruana necesita además la
   entrada hermana `noaaCpcElNinoNwPeru`/`noaaCpcLaNinaNwPeru` en `FUENTES`
   antes de escribir el archivo. D4a termina con **4 de 7** regiones
   (sumando Litoral).
3. **D4b — Chile central**: escribir El Niño con `noaaCpcElNinoCentralChile`
   (entrada hermana nueva). Antes de crear el archivo, investigar una fuente
   específica para La Niña — sin eso, la región no se despliega (una fase
   bloqueada no es una fase vacía disimulada).
4. **D4b — Cuyo y Altiplano**: investigación dedicada (candidatos: IANIGLA
   para Cuyo, informes técnicos de SENAMHI/ENFEN para Altiplano, y para
   Altiplano además decidir `paises`). Se escriben solo si aparece una fuente
   real para las tres fases; D4 no se da por cerrado hasta que las dos
   validen.

## Trabajo técnico (mecánico, mismo patrón que Litoral)

- `lib/regiones/{sur-de-brasil,pampa-humeda,costa-peruana,chile-central,cuyo,
  altiplano}.ts` — uno por región, mismo shape que `litoral.ts`. Solo se crea
  el archivo cuando las tres fases de esa región están resueltas (ver orden
  arriba); ninguno se commitea a medio resolver.
- `lib/regiones/fuentes.ts` — tres entradas hermanas ya decididas para D4a/D4b
  temprano: `noaaCpcElNinoNwPeru`, `noaaCpcLaNinaNwPeru`,
  `noaaCpcElNinoCentralChile` (misma URL que las existentes, `seccion` acotada
  al pasaje real — punto 5 del protocolo de cita). Más adelante, solo si
  aparece una fuente real para Cuyo/Altiplano/Chile-La Niña, con
  `consultadoEl`, `seccion` exacta, y la nota del protocolo sobre por qué
  sigue siendo válida pese a no cambiar.
- `lib/regiones/index.ts` — se agrega cada región resuelta a `TODAS`, más la
  verificación de ids únicos de la sección anterior.
- Rutas/sitemap: sin cambios — `generateStaticParams` y `regionesPublicas()`
  ya son dinámicos (confirmado leyendo `app/[lang]/regiones/[region]/page.tsx`
  y `lib/regiones/index.ts`).
- `CLAUDE.md`: ya corregido en este pase (Litoral `revisado`, D5 hecho). Al
  cerrar D4 del todo, actualizar la fila de la tabla otra vez si quedan
  Cuyo/Altiplano sin resolver.

## Reglas de redacción (sin cambios — Plan 02 D4)

- Condicional siempre: "suele", "tiende a", "se asocia con". Nunca "va a".
- Estación explícita, **la que dice la fuente**, no asumida.
- Sin catástrofe (A3), sin probabilidad, sin precisión falsa (A8).
- Ninguna fuente nueva entra a `FUENTES` sin `curl` + lectura de la sección
  exacta, primero.

## Verificación

1. `pnpm typecheck && pnpm test` después del endurecimiento del validador
   (paso 1) — debe seguir en verde con Litoral solo, antes de tocar regiones.
2. Por cada región agregada: los tests tabla-por-región la cubren
   automáticamente al entrar a `REGIONES` — no hace falta un test nuevo por
   archivo.
3. `pnpm lint && pnpm check:design && pnpm build`.
4. Abrir cada `/es/regiones/{id}` nueva en el navegador: distintivo de
   borrador, tres fases con contenido, cada fuente linkea a una URL real.
5. **Al terminar cada región, listar sus afirmaciones con fuente exacta y
   sección para que el dueño la revise** (CLAUDE.md) — ninguna pasa a
   `revisado` en este trabajo.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Repetir el error de esta revisión: extender una fuente más allá de lo que dice, incluida la fase neutral | Protocolo de cita obligatorio (7 puntos); matriz construida sobre texto crudo, no resúmenes |
| Chile central/Cuyo/Altiplano quedan sin resolver indefinidamente | Es preferible a inventar contenido — D4a entrega **4 de 7** regiones (Litoral + las tres de esta pasada) mientras D4b sigue investigando; D4 no se declara cerrado hasta que las siete validen |
| IDs duplicados o `paises` inválido pasan sin error | Endurecido en `validar.ts`/`index.ts` antes de agregar contenido nuevo |
| Publicar contenido no revisado como definitivo | Todas se despliegan en `borrador`; el dueño revisa por URL, región por región |
