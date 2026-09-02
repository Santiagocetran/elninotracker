# Prompt de implementación · v0, bloques B0 → B2 → B1 → B3.1

Copiar y pegar tal cual a otro agente.

---

Trabajás en `/home/santi/sideprojects/El-Niño-Tracker`, un rastreador ENSO en
español para Sudamérica. Next.js 16 + TypeScript, sin Tailwind.

**Leé primero, en este orden:** `CLAUDE.md`, `DESIGN.md`,
`Plans/01-v0-prueba-de-concepto.md`. El plan manda; `README.md` está parcialmente
desactualizado (§6 y §7) y no es autoridad.

**Alcance: los bloques B0, B2, B1 y B3.1 del plan, en ese orden.** No hagas
deploy (B3.3), ni el Advisory (B3.2), ni el panel regional (B3.5): requieren
credenciales y criterio editorial humano.

## Contexto verificado — no lo re-investigues

- El CPC adoptó **RONI** en feb-2026 como índice operativo de ENSO. `ONI` sólo
  sirve para serie histórica. Endpoint: `.../data/indices/RONI.ascii.txt`,
  **3 columnas** (`SEAS YR ANOM`), 918 filas, DJF 1950 → MJJ 2026.
- MJJ 2026: ONI `+1.39` (moderado) vs RONI `+0.98` (débil). La portada hoy
  sobredeclara el evento en una clase de intensidad.
- `wksst8110.for` está muerto: devuelve 200 con datos de enero 2021. Usar
  `wksst9120.for`.
- `wksst9120.for` es de ancho fijo y los valores **se pegan** (`23.4-0.4`). Un
  `split()` por espacios lo rompe en silencio. El parser actual ya lo maneja.
- Frescura del ONI/RONI se mide contra el **fin** del trimestre, no su centro.

## Bugs a corregir, ya reproducidos

1. `app/page.tsx:40` — con anomalía negativa la portada dice *"El Pacífico está
   −1,2 °C más caliente que lo normal"*. También: `La Niña · moderado` sin
   concordancia de género, y en neutral queda *"figura como ."*.
2. `app/page.tsx` llama a ONI "el índice oficial del que depende la
   clasificación". Falso. Ver B0.2 para las cuatro cosas que hay que separar.
3. `scripts/ingest.ts:30` — una fecha futura pasa el control de frescura
   (`2099-01-01` → −26.419 días → PASA).
4. `app/tracker.css` — `--ink-3` (`#6b6e72`) da **3,84:1** sobre `--bg`: falla
   AA y colorea `.fuente` y `.eje`.
5. `components/Serie.tsx:102` — `.eje` fija `color`, pero `<text>` de SVG usa
   `fill`. Las etiquetas de década salen negras sobre fondo negro.
6. `pnpm check:design` falla: `scripts/check-design.ts` no existe.

## Reglas que no se negocian

- **Todo número lleva índice, fecha y fuente.** Nunca mezclar RONI, ONI y
  semanal como si fueran comparables (`DESIGN.md` A5).
- **Nunca llamar "oficial" a un cálculo propio.** Es "clasificación descriptiva
  por umbral".
- **Cero colores literales** fuera de `app/tracker.css`. Todo por token.
- **Dos familias tipográficas**, sin sans: Literata (nuestras palabras) e IBM
  Plex Mono (valores medidos).
- **Componer con las clases** de `tracker.css`. Los estilos inline que hay en
  `page.tsx` son deuda: migralos, no los imites.
- **HTTP 200 no significa dato fresco.** Es el error que originó todo el plan.

## Criterio de aceptación

- Fixtures por fase (cálida, fría, neutral) renderizan texto correcto y con
  género concordante. **Probado, no mirado.**
- Fixtures congelados de las cuatro fuentes; los tests de parsers fallan al
  mutar un fixture a propósito.
- Con cache vacío, checkout limpio y NOAA inaccesible, `pnpm build` termina bien
  usando `data/seed.json` y marca la portada como degradada si el seed está
  fuera de cadencia.
- `.github/workflows` corre typecheck + tests + `check:design`, y `check:design`
  falla de verdad al introducir una violación a propósito.
- `pnpm typecheck` y `pnpm build` limpios.

## Cómo trabajar

Ejecutá y verificá; no declares nada funcionando sin haberlo corrido. Si algo
del plan resulta irrealizable —ya pasó dos veces— frená y decilo en vez de
implementar una versión que no cumple. Al terminar, informá qué quedó sin hacer
y por qué.
