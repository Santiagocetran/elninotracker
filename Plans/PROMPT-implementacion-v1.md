# Prompt de implementación · v1, bloques D0 → D1 → D2 → D3

Copiar y pegar tal cual a otro agente.

---

Trabajás en `/home/santi/sideprojects/El-Niño-Tracker`, un rastreador ENSO en
español para Sudamérica, ya desplegado en https://elninotracker.vercel.app

**Leé primero, en este orden:** `CLAUDE.md`, `DESIGN.md`,
`Plans/02-v1-que-significa-para-mi.md`. El plan manda. `README.md` es el
documento fundacional pero está parcialmente desactualizado (§6, §7).

**Alcance: D0, D1, D2 y D3.** Es decir: decisiones de política, rutas + i18n +
ESLint, esquema y validadores, y **una sola región piloto** (Litoral argentino)
con el ciclo completo. **No escribas las otras seis regiones** (D4), ni el mapa
(D5), ni SEO (D6): el plan exige demostrar el ciclo con una antes de expandir.

## Qué hace distinta a esta fase

En v0 los errores eran verificables por máquina. Acá no: vas a **redactar
afirmaciones sobre el clima de una región donde vive gente que toma decisiones
con eso**. Ningún test atrapa una afirmación falsa.

El plan pasó por dos auditorías. Ambas encontraron que versiones anteriores del
modelo *parecían* impedir mentir sin lograrlo. Implementá el esquema tal como
quedó, sin relajarlo.

## Reglas que no se negocian

- **Ninguna afirmación sin fuente.** Las fuentes salen del **registro cerrado**
  `FUENTES`; una afirmación referencia `FuenteId`, nunca un objeto libre. No
  agregues una fuente al registro sin verificar su URL con `curl`.
- **Ninguna probabilidad en climatología.** El campo no existe. No lo agregues.
- **Condicional siempre:** "suele", "tiende a", "se asocia con". Nunca "va a".
- **Decir cuándo no se sabe.** `sin-señal-documentada` es una respuesta legítima
  y preferible a inventar una consecuencia. Es especialmente probable en fase
  neutral: no fuerces contenido para llenar el array.
- **Sin catástrofe** (`DESIGN.md` A3): "crecidas más probables que lo normal",
  no "el Paraná se desborda".
- **El panel describe la fase, no pronostica el evento.** Se selecciona por
  RONI y se presenta como *"lo que suele pasar en esta región durante una fase
  así"*. El Advisory conserva su bloque aparte y no selecciona nada (D0.3).
- **Cero colores literales** fuera de `app/tracker.css`; dos familias
  tipográficas; componer con las clases existentes.

## Contexto verificado — no lo re-investigues

- Fuentes que responden: `climate.gov/enso`, `iri.columbia.edu`, `ciifen.org`,
  `senamhi.gob.pe`, `portal.inmet.gov.br`, `bom.gov.au/climate/enso`.
- **`smn.gob.ar` está detrás de un desafío de Cloudflare** ("Just a moment...").
  No es User-Agent. Se puede enlazar; no automatizar.
- Hoy RONI da **El Niño débil** (+0,98 MJJ) mientras el CPC declara
  **Advertencia de El Niño**. Discrepan a propósito y el sitio ya los separa.
- El repo usa pnpm. `pnpm test`, `pnpm typecheck`, `pnpm check:design`,
  `pnpm build` deben quedar en verde.
- `origin` fija el usuario en la URL. Si un push falla con "denied to
  santiagoGrupoRiccitelli": `gh auth switch --user Santiagocetran`.

## Criterio de aceptación

**D0/D1**
- `/` redirige permanente a `/es`; existe `app/[lang]`; `/pt` devuelve 404.
- ESLint instalado, corriendo en CI, y **falla** al introducir un literal en JSX.
- `DESIGN.md` y `CLAUDE.md` ya no prometen `/datos` para v1 (ya corregido).

**D2**
- Un `estadoEditorial: 'validado'` sin especialista **no compila**.
- Una afirmación con array de fuentes vacío **no compila**.
- Cambiar el texto de una afirmación revisada **degrada su estado a borrador**
  por hash. Probalo mutando el texto en un test.
- El validador editorial falla si una afirmación no cubre los locales activos.

**D3 — la región piloto**
- Litoral argentino, las **tres** fases, con fuentes reales del registro.
- Se despliega como `borrador`: distintivo visible en la página, `noindex`,
  fuera de sitemap, fuera de navegación y de la portada, alcanzable por URL.
- **No se bloquea en `robots.txt`**: el crawler necesita entrar para leer el
  `noindex`.
- Un test de render verifica distintivo, `noindex` y presencia de enlaces a las
  fuentes.

## Cómo trabajar

Ejecutá y verificá; no declares nada funcionando sin haberlo corrido. Si algo
del plan resulta irrealizable —ya pasó— frená y decilo en vez de implementar
una versión que no cumple.

Al terminar, informá qué quedó sin hacer, y **listá explícitamente cada
afirmación que redactaste con su fuente**, para que el dueño pueda revisarlas
una por una. Es contenido sin revisar: no lo presentes como verificado.
