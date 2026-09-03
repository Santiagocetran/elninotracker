# Handoff · continuar la implementación de v1

Pegar tal cual al abrir una conversación nueva.

---

Trabajás en `/home/santi/sideprojects/El-Niño-Tracker`: un rastreador ENSO en
castellano para Sudamérica, **en producción** en https://elninotracker.vercel.app
Repo público: `Santiagocetran/elninotracker` (MIT + CC BY 4.0), rama `master`.

**Leé primero, en este orden:** `CLAUDE.md`, `DESIGN.md`,
`Plans/02-v1-que-significa-para-mi.md`. El plan manda y ya pasó **dos
auditorías**. `README.md` es el documento fundacional pero sus §6 y §7 están
desactualizados: no los uses como fuente.

## Dónde está el trabajo

v0 cerrado y desplegado. De v1 (Plan 02) están hechos **D0, D1, D2 y D3**:

- Rutas `app/[lang]`, `/` → 308 a `/es`, `/pt` → 404.
- Esquema editorial en `lib/regiones/`: registro cerrado de fuentes, unión
  discriminada de estados, hash que degrada la revisión si cambia el texto.
- **Litoral argentino**, las tres fases, ya en estado `revisado` por el dueño:
  indexado, en el sitemap y enlazado desde la portada.
- "El motor": explicador SVG del mecanismo, tres estados, cero JavaScript.

Gates en verde: `pnpm typecheck`, `pnpm lint`, `pnpm test` (30), `pnpm
check:design`, `pnpm build`. CI en `.github/workflows/ci.yml`.

## Qué sigue — elegilo con el dueño antes de arrancar

1. **D4 · las otras seis regiones.** Cuyo, Pampa húmeda, Costa peruana,
   Altiplano, Sur de Brasil, Chile central. Es el diferencial declarado (§5.2).
   El ciclo completo ya está demostrado con el Litoral: copiá ese patrón.
2. **Escala histórica.** El dueño la pidió como próximo recurso visual: dónde
   cae el evento actual contra 1983, 1997 y 2015. Los datos ya están en la serie
   ONI; falta el componente.
3. **D5 · el mapa.** GIBS + maplibre. Ojo con los criterios de D5: usar el
   `<Default>` de la capa **confirmando que el tile responde** (el de hoy suele
   dar 404), y respetar el presupuesto de JS (≤15 KB inicial, ≤260 KB en
   viewport, verificado en CI).
4. **D6 · SEO.** Sólo sobre contenido `revisado`.

## Reglas que no se negocian

- **Ninguna afirmación climática sin fuente del registro cerrado `FUENTES`.**
  Antes de agregar una fuente, verificá su URL con `curl` **y que el texto que
  vas a citar esté realmente ahí.** Ya pasó que una cita atribuida a
  `climate.gov/enso` no existía en esa página — y esa página además está
  desactualizada 17 meses. El esquema garantiza que haya fuente, no que la
  fuente diga lo que la afirmación dice.
- **Ninguna probabilidad en climatología.** El campo no existe. No lo agregues.
- **Condicional siempre:** "suele", "tiende a", "se asocia con". Nunca "va a".
- **`sin-señal-documentada` es una respuesta legítima**, y preferible a inventar
  una consecuencia. Es lo esperable en fase neutral.
- **Castellano llano.** El dueño corrigió explícitamente que el sitio se había
  vuelto demasiado técnico. Nada de "clasificación descriptiva por umbral" en
  texto visible: eso va abajo, para quien lo busque. Escribí como si le
  explicaras a alguien que no sabe qué es un índice.
- **Cero colores literales** fuera de `app/tracker.css`; dos familias
  tipográficas (Literata + IBM Plex Mono, sin sans); componer con las clases que
  ya existen.
- **El panel describe la fase, no pronostica el evento.** Se selecciona por RONI
  y se presenta como "lo que suele pasar". El Advisory del CPC va aparte.

## Trampas conocidas — no las redescubras

- **`gh` cambia solo de cuenta activa** a `santiagoGrupoRiccitelli` (trabajo,
  sin acceso al repo). El remoto ya fija el usuario en la URL; si aun así el
  push falla: `gh auth switch --user Santiagocetran`.
- **Vercel Hobby rechaza cualquier cron sub-diario.** No lo degrada: falla el
  deployment. `vercel.json` queda en uno por día.
- **`smn.gob.ar` está detrás de Cloudflare.** No es User-Agent. Se enlaza, no se
  automatiza.
- **RONI reemplazó a ONI** como índice operativo del CPC en feb-2026. ONI sólo
  sirve para la serie histórica. Hoy RONI da El Niño débil mientras el CPC
  declara Advertencia de El Niño: **discrepan a propósito** y el sitio los separa.
- **HTTP 200 no significa dato fresco.** El endpoint anterior del CPC devolvía
  200 con datos de 2021.
- Ediciones de texto con `sed`/`replace`: **verificá que hayan aplicado.** Hay
  espacios duros (`\xa0`) escondidos en el diccionario que hacen fallar
  coincidencias exactas en silencio.

## Cómo trabajar

Ejecutá y verificá; no declares nada funcionando sin haberlo corrido. Para lo
visual hay chromium headless disponible — capturá y mirá, no deduzcas.

Si algo del plan resulta irrealizable, frená y decilo en vez de implementar una
versión que no cumple: ya pasó tres veces y las tres se atraparon en auditoría.

Al terminar, si redactaste contenido editorial, **listá cada afirmación con su
fuente** para que el dueño la revise una por una. El dueño es el revisor; no
presentes contenido nuevo como verificado.
