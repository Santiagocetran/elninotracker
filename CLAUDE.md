# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

Next.js 16 app (App Router, i18n bajo `app/[lang]`), git repo on `master`. `pnpm build` ya no
corre la ingesta: la portada obtiene los datos en runtime por una función cacheada y cae a
`data/seed.json` (versionado) si NOAA no responde. `pnpm ingest` es la validación estricta a
demanda que refresca ese seed.

```
pnpm dev            next dev
pnpm build          next build (cache components + seed fallback)
pnpm ingest         fetch NOAA → valida invariantes + escribe data/seed.json (exit 1 si rancio/futuro)
pnpm seed           regenera data/seed.json desde tests/fixtures
pnpm test           tsx --test (parsers, copy, regiones, render)
pnpm lint           eslint — falla ante un literal de texto en JSX (chrome → diccionario)
pnpm typecheck      tsc --noEmit
pnpm check:design   contraste AA · colores literales · firma de dato
```

`/` redirige 308 a `/es`. `/pt` devuelve 404 hasta tener traducción real. ESLint no usa
`typescript-eslint` (rechaza TS 7.0): parsea TSX con Babel, sin análisis de tipos.

**Three documents disagree; know which to trust.**

| | Status |
|---|---|
| `Plans/01-v0-prueba-de-concepto.md` | **Done except B3.4/B3.5.** Read for the defects it fixed. |
| `Plans/02-v1-que-significa-para-mi.md` | **Current.** D0–D3 done (i18n + rutas + ESLint + esquema editorial), Litoral ya `revisado`. D5 (mapa, `Plans/03-v1-D5-el-mapa.md`) hecho. D4 (seis regiones restantes, `Plans/04-v1-D4-regiones.md`) en curso, D6 (SEO) pendiente. Start here. |
| `DESIGN.md` | Current, except §8's claim that "sin fuente no compila" — that is aspirational, not enforced. |
| `CLAUDE.md` | Current. |
| `README.md` | **Partly stale.** §6 lists a dead endpoint, §7 prescribes Vite + Recharts. Founding doc, owner's call to amend. |

### Operational traps — learned the hard way

- **Deployed:** `https://elninotracker.vercel.app`. Public repo, MIT (code) +
  CC BY 4.0 (content).
- **Vercel Hobby rejects any sub-daily cron.** It does not degrade it — the
  deployment fails with "Hobby accounts are limited to daily cron jobs". Keep
  `vercel.json` at one per day.
- **`gh`'s active account decides git push identity, and it keeps flipping.**
  This machine also has a work account (`santiagoGrupoRiccitelli`) that has no
  `workflow` scope and no access to this repo. `origin` now pins the user in the
  URL (`https://Santiagocetran@github.com/...`) so a flip no longer breaks the
  push. If it still fails: `gh auth switch --user Santiagocetran`.

### Known-broken, audited 2026-09-02 — fixed in this pass

The five defects below are fixed and covered by tests/checks (Plan 01 B0/B2/B3.1):

- Homepage phase copy and gender agreement (`app/page.tsx`, `lib/copy.ts`) — B0.1.
- RONI (operativo) vs ONI (histórico) vs semanal (observación) vs Advisory — B0.2.
- `--ink-3` contrast and SVG decade labels (`app/tracker.css`, `components/Serie.tsx`) — B0.3.
- Future dates fail the freshness check (`lib/validacion.ts`) — B2.2.
- `scripts/check-design.ts` exists and fails on real violations — B3.1.

v0 works; v1 is under way. Four of seven regions (`lib/regiones/`: `litoral`, `sur-de-brasil`,
`pampa-humeda`, `costa-peruana`) are `revisado` by the owner as of 2026-09-03 (Plan 02 D3, Plan
04 D4a): indexed, in the sitemap, linked from the homepage. The remaining three — Chile
central (El Niño only, La Niña unsourced), Cuyo, Altiplano — are D4b, blocked on missing
sources (`Plans/04-v1-D4-regiones.md`); D4 does not close until those three validate.
The map (`components/Mapa.tsx`, GIBS + maplibre, `Plans/03-v1-D5-el-mapa.md`) is done.
`/datos` is still out of scope (v2).

## What the product is

A Spanish-language ENSO tracker for South America, for a general audience. It answers two questions:
**"¿Qué está pasando?"** and **"¿qué significa para mí, donde vivo?"**

The second one — regional impact panels by country/region (§5.2 of the README) — is the only
non-commodity part of the product. Everything else (current state, timeline, SST map) exists elsewhere;
the plain-Spanish translation of index values into local consequences does not.

## Decisions that are already made — do not relitigate

- **ENSO tracker, not an El Niño 2026 site.** Both phases plus neutral. A site scoped to the current
  event has ~9 months of life. Naming, routing, copy, and data model must all be phase-agnostic.
- **Never generate a forecast.** The site relays CPC / IRI / SMN / SENAMHI / BOM, always with explicit
  probabilities, an update date, and a link to the source. Never extrapolate, never write newspaper-style
  headlines. Editorial precision is the site's only asset.
- **Not a nullschool clone.** SST anomaly changes on a scale of weeks; particle advection is the wrong
  effect for a near-static field. Use `maplibre-gl` with a raster layer over a base map.
- **No backend, no database for v1.** A scheduled ingest job writes static JSON served from a CDN.
  Data is small, public, and changes about once a day.
- **Automated pipeline from day one.** Stale data is worse than no site. If a data source can't be
  automated, it doesn't get built.
- **Unrelated to the Riccitelli Live Dashboard.** Different audience and auth (that one is behind Google
  SSO; this must be indexable by Google). Separate repos, no shared infrastructure.

## Data sources — re-verified 2026-09-02, README §6 is partly wrong

**Do not copy the endpoint list from `README.md` §6. Two of its three sources are unusable as described.**

```
✅ cpc.ncep.noaa.gov/data/indices/wksst9120.for      Weekly SST + anomaly, all Niño regions.
                                                     CANONICAL WEEKLY UPDATE. Base 1991-2020.
✅ cpc.ncep.noaa.gov/data/indices/oni.ascii.txt      ONI (official 3-month index), DJF 1950 →.
                                                     Use this for monthly anomaly + history.
⚠️ climatereanalyzer.org/.../oisst2.1_world2_sst_day.json
                                                     Global daily SST. 403s without a browser
                                                     User-Agent. Academic host, no SLA — most
                                                     fragile of the set.
❌ cpc.ncep.noaa.gov/data/indices/wksst8110.for      DEAD DATA. Returns HTTP 200 + 102 KB but the
                                                     last week in it is 27JAN2021. Superseded by
                                                     wksst9120.for.
❌ psl.noaa.gov/data/correlation/nina34.anom.data    Frozen at 2010.
ℹ️ psl.noaa.gov/data/correlation/nina34.data         Alive, but ABSOLUTE SST (ERSST v6), not
                                                     anomaly. Needs a climatology to be useful.
```

**HTTP 200 does not mean fresh data.** Every ingest job must assert on the *last observation date*
in the payload and fail loudly when it is older than the expected cadence. This is README risk #1
made concrete — it already happened, in the founding document.

### The map is cheaper than README §6 claims

NASA GIBS serves ready-made daily SST-anomaly raster tiles — no NetCDF, no tile pipeline, no auth,
no API key. WMTS, `GoogleMapsCompatible_Level7`, current to yesterday:

```
gibs.earthdata.nasa.gov/wmts/epsg3857/best/GHRSST_L4_MUR_Sea_Surface_Temperature_Anomalies/
    default/{date}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png
```

This turns §5.3 ("el trabajo real del proyecto") into a maplibre raster source. The remaining cost is
purely aesthetic: the tiles ship with NASA's rainbow colormap, which cannot be restyled. Rendering an
owned palette means fetching raw values instead (ERDDAP / OISST) and colormapping client-side.

### Index semantics — an editorial trap

Weekly Niño 3.4 anomaly and ONI are **not comparable numbers**. ONI is a 3-month running mean; the
weekly value is instantaneous and always more extreme. As of 2026-08-26 weekly Niño 3.4 is +2.6 °C
while the latest ONI (MJJ 2026) is +1.39 °C. Never present one as an update to the other, and always
label which index a number is.

Also to integrate: NOAA CPC ENSO Discussion (monthly, 2nd Thursday), IRI plume, BOM (independent
second opinion, with SOI).

**Licensing:** NOAA/NASA are public domain; Copernicus requires attribution. Verify per source and
keep attribution visible in the UI.

## Stack — decided 2026-09-02, supersedes README §7

**Next.js 16 (App Router) + TypeScript on Vercel.** The README proposes React + Vite; that was
overridden. SEO is a stated product goal (§8: beat La Nación and Infobae on "el niño"), and a Vite
SPA ships an empty root div. Server-rendered HTML, `generateMetadata`, sitemaps, JSON-LD
(`Dataset` + `Article`) and native i18n routing (`/[lang]`; `/es` live, `/pt` 404 until
translated — Plan 02 D1) are the reason for the change.

- **Ingest:** Vercel Cron → Route Handler → ISR revalidation. No backend, no database (README §7).
- **Map:** `maplibre-gl` + GIBS raster tiles (see above).
- **Charts:** server-rendered SVG with `d3-scale`/`d3-shape` for the historical series — zero client
  JS, indexable. `visx` only where real interaction is needed. **Not Recharts**: the charts are the
  product here, and Recharts constrains exactly where control is needed.
- **Type:** Literata + IBM Plex Mono via `next/font/google`. Two families, no sans — see below.
- **Not needed:** `vgpu` (Vercel Labs WebGPU). maplibre gives WebGL and GIBS gives the tiles. It
  would only become relevant if the map moves to an owned colormap over raw values — explicitly
  deferred.

## Design

**`DESIGN.md` is binding.** Read it before writing any UI. It follows Vercel's three-layer split:
judgment in prose (`DESIGN.md`), reusable mechanics (`app/tracker.css`), machine-verifiable rules
(`scripts/check-design.ts`). Put each fix in exactly one layer.

Decided: dark-first "editorial instrument" register (`#0A0B0D`), a single accent that is **dictated
by the current ENSO phase** (warm for El Niño, cool for La Niña, slate for neutral), Literata +
IBM Plex Mono with **no sans at all** — serif is what we write, mono is what was measured, and the
big homepage number is therefore mono — and a homepage led by that number
(README §5.1) — never by the map. `/datos`, the dense control-room page, is **deferred to v2**
(Plan 02 D0.4); it was promised for v1 in three documents and none of them said otherwise.

`DESIGN.md` §7 names ten anti-patterns. §8 lists the deterministic checks, including the
freshness assertion that `wksst8110.for` would have failed.

## Working conventions

- All user-facing copy is **Spanish** (pt-BR later via i18n) — plain language, not institutional prose.
  Code, identifiers, and comments in English.
- Every displayed data point carries a visible update date and a link to its official source.
- Build in the order of §5 of the README (importance, not difficulty), and follow the §9 roadmap:
  v0 = ingest + single page (current state + historical timeline) + working automatic deploy.

## Open questions (README §10)

Name/domain, geographic scope (Argentina first vs. all of South America), who authors the regional
impact copy, and whether the project is meant to be sustainable. These affect design decisions —
ask rather than assume.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
