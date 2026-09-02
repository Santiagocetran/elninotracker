# El Niño Tracker

**Un rastreador ENSO en español, para Sudamérica, para público general.**

> Estado: idea fundacional. Sin código todavía.
> Documento escrito el 2026-09-02.

---

## 1. Por qué existe esto

Buscar "el niño" en Google desde Argentina hoy devuelve **La Nación e Infobae**. Notas
periodísticas: correctas a veces, desactualizadas casi siempre, imposibles de recorrer, y
sin ninguna forma de ver el estado actual del fenómeno.

Eso es raro, porque el fenómeno está en un momento históricamente relevante:

| Indicador | Valor (NOAA CPC, 2026-08-13) |
|---|---|
| Estado oficial | **El Niño Advisory** |
| Niño 3.4 (julio 2026) | **+1,4 °C** |
| Prob. evento "muy fuerte" | **>90 %** para OND 2026 – verano 2026/27 |
| Prob. superar **+2,5 °C** | **69 %** en OND 2026 |

Superar +2,5 °C lo pondría junto a 1982-83, 1997-98 y 2015-16 — los tres eventos que la
gente todavía recuerda por su nombre. Y para Sudamérica no es un dato abstracto: en el
Litoral argentino significa crecidas del Paraná y del Uruguay; en la costa de Perú y
Ecuador, lluvias e impacto en la pesca; en el sur de Brasil, inundaciones; en el
altiplano, sequía.

Hay mucha gente que quiere seguir esto y no tiene dónde.

## 2. El hueco, verificado

Antes de decidir nada busqué qué existe realmente en español. **El hueco es más chico de
lo que parece a primera vista, pero existe.**

| Qué hay | Cómo está |
|---|---|
| [CIIFEN](https://ciifen.org/el-nino-oscilacion-del-sur/) — centro regional oficial | Riguroso, institucional, poco navegable |
| [AgroENSO](https://agroenso.netlify.app) (INTA + CONICET) | Muy buena app, 35 años de historia — **pero solo impacto agrícola** |
| [Pronóstico Extendido](https://www.pronosticoextendido.net/el-nino/interactivo/) | Mapa interactivo sin narrativa ni explicación |
| [SENAMHI / ENFEN](https://www.senamhi.gob.pe/main.php?dp=lima&p=fenomeno-el-nino) | Oficial y bueno — **solo Perú** |
| [CPC en español](https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc_Sp.shtml) | El comunicado oficial traducido. Existe y casi nadie lo conoce |

Conclusión: **hay fuentes, no hay producto.** Todo lo anterior es institucional (correcto
pero árido), sectorial (agro), o nacional (Perú). No existe un lugar único, atractivo, para
público general, que responda las dos preguntas que la gente realmente tiene:

> **¿Qué está pasando?** y **¿qué significa para mí, donde vivo?**

Ese es el producto.

## 3. Qué NO es

Esto importa tanto como lo que sí es.

- **No es un clon de [earth.nullschool.net](https://earth.nullschool.net/).** nullschool es
  hipnótico porque el viento cambia cada hora: las partículas en movimiento *son* el dato.
  La anomalía de temperatura del mar cambia en escala de semanas. Un globo animado sobre un
  campo casi estático es forma sin función — impresiona una vez y no informa. Además es un
  motor de advección de partículas sobre GRIB2 del GFS: años de trabajo para el efecto
  equivocado.
- **No es un sitio sobre "el Súper Niño 2026".** Ver §4.
- **No es un pronosticador.** Nunca generamos pronóstico propio. Relayamos CPC / IRI / SMN /
  SENAMHI, con probabilidades explícitas y con link a la fuente. Explicar mal el clima es
  fácil y caro en credibilidad.
- **No tiene nada que ver con el Riccitelli Live Dashboard.** Audiencias, alcance y auth
  distintos. Ese dashboard está detrás de Google SSO; esto necesita ser indexable por
  Google, que es justamente el problema del que parte. Repos separados.

## 4. Decisión de diseño más importante: es un rastreador **ENSO**, no de El Niño

El evento actual pico en OND 2026 y decae hacia mediados de 2027. Un sitio sobre *este*
evento tiene ~9 meses de vida útil y después es un cementerio.

Un sitio sobre **ENSO** — las dos fases, El Niño **y** La Niña, más la fase neutral —
sirve para siempre, capta las búsquedas de los dos ciclos, y es **exactamente la misma
cantidad de trabajo**. El Niño es el gancho de entrada, no el alcance.

El dominio y el naming deberían reflejarlo desde el día uno.

## 5. Qué construir

En orden de importancia, no de dificultad.

### 5.1 Estado actual, en una pantalla
Lo primero que ve alguien que llega: en qué fase estamos, qué tan intenso es, hacia dónde
va. Un número grande (Niño 3.4), una etiqueta clara (*El Niño — fuerte*), una frase en
castellano llano, y la fecha de actualización bien visible.

### 5.2 "¿Qué significa para mí?" — por país y región
**Este es el verdadero diferencial.** "Niño 3.4 está en +2,5" no le dice nada a nadie.
Paneles por país/región con lo que ese estado típicamente implica ahí: Litoral argentino,
Cuyo, Pampa húmeda, costa peruana, altiplano, sur de Brasil, Chile central.

Nadie hace esta traducción para público general en español. Todo lo demás del sitio es
commodity; esto no.

### 5.3 El mapa
Anomalía de temperatura superficial del mar, global, actualizada a diario. Atractivo pero
honesto. **`maplibre-gl` ya da WebGL sin escribir un shader** — una capa raster sobre un
mapa base es una fracción del trabajo y rinde casi igual para un campo que cambia por
semanas.

### 5.4 Contexto histórico
La pregunta que todos hacen es *"¿qué tan grande es este comparado con los anteriores?"*.
Una línea de tiempo del índice desde 1950 con los eventos históricos marcados la responde
de un vistazo. Barata de construir, alto valor percibido.

### 5.5 Años análogos (opcional, v2)
Elegir 1997-98 o 2015-16 y ver qué pasó entonces. `AgroENSO` ya hace algo así para agro;
la versión general no existe.

## 6. Datos — todos públicos, todos verificados

Probados el 2026-09-02:

```
psl.noaa.gov/data/correlation/nina34.data                          200 —   8 KB
    Niño 3.4 mensual desde 1948. Texto plano.

cpc.ncep.noaa.gov/data/indices/wksst8110.for                       200 — 102 KB
    TSM semanal, TODAS las regiones Niño (1.2, 3, 3.4, 4). Texto plano.
    Esta es la actualización canónica semanal.

climatereanalyzer.org/clim/sst_daily/json/oisst2.1_world2_sst_day.json  200 — 104 KB
    TSM global diaria, JSON.
```

**Las series temporales y el estado actual son prácticamente gratis** — texto plano y JSON,
sin auth, sin NetCDF, sin procesamiento pesado.

Lo único realmente costoso es **el mapa grillado de anomalía** (§5.3), que sí requiere
procesar OISST en NetCDF o servir tiles pre-renderizados. Ese es el trabajo real del
proyecto.

Otras fuentes a integrar: [NOAA CPC ENSO Discussion](https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml)
(mensual, 2º jueves), [IRI plume](https://iri.columbia.edu/our-expertise/climate/forecasts/enso/current/)
(incertidumbre entre modelos), [BOM](http://www.bom.gov.au/climate/enso/) (segunda opinión
independiente, con SOI).

**Licencias:** NOAA es dominio público. Copernicus exige atribución. Verificar caso por
caso antes de publicar y dejar la atribución visible.

## 7. Stack propuesto

Deliberadamente aburrido y ya conocido:

- **React + Vite + TypeScript**
- **maplibre-gl** para el mapa (WebGL gratis, sin escribir shaders)
- **recharts** para series temporales
- **i18n desde el día uno** — español primero, pero portugués (pt-BR) es la mitad de
  Sudamérica y no se puede agregar después sin dolor
- Un job programado de ingesta → JSON estático servido desde CDN. **No hace falta backend
  ni base de datos para la v1**: los datos son chicos, públicos y cambian una vez por día.
  Eso hace el hosting casi gratis y elimina toda una clase de problemas operativos.

## 8. Los dos riesgos reales

Ninguno de los dos es técnico.

1. **Que quede desactualizado.** Un rastreador con datos de hace tres meses es *peor* que
   no existir: destruye la confianza que es el único activo del sitio. Necesita **pipeline
   automático desde el día uno**, no actualización manual. Si no se puede automatizar, no
   se construye.
2. **Precisión editorial.** El valor está en explicar, y explicar mal el clima es fácil.
   Regla de seguridad: decir lo que dicen las fuentes oficiales, con probabilidades, con
   fecha y con link. Nunca extrapolar. Nunca titular como un diario.

Riesgo menor pero real: **SEO**. El objetivo declarado es ganarle a La Nación e Infobae en
la búsqueda de "el niño". Eso es competir con dominios de autoridad altísima. Requiere
contenido genuinamente mejor, actualizado, y estructurado — no es un problema de código.

## 9. Roadmap

**v0 — Prueba de concepto (¿sirve esto?)**
- [ ] Ingesta de `nina34.data` + `wksst8110.for` → JSON
- [ ] Página única: estado actual + línea de tiempo histórica
- [ ] Deploy con actualización automática funcionando

**v1 — El producto**
- [ ] Mapa de anomalía de TSM
- [ ] Paneles "qué significa para mí" por país/región
- [ ] i18n es/pt
- [ ] Metadatos y estructura para SEO

**v2 — Profundidad**
- [ ] Años análogos
- [ ] Plume de modelos IRI
- [ ] Resumen del comunicado mensual del CPC en castellano llano

## 10. Preguntas abiertas

1. **Nombre y dominio.** Debe reflejar ENSO, no "El Niño 2026" (§4).
2. **Alcance geográfico.** ¿Sudamérica entera, o Argentina primero y se expande? Empezar
   por Argentina es más honesto y más fácil de hacer bien.
3. **¿Quién escribe los textos de impacto regional (§5.2)?** Es la parte de mayor valor y
   la que más riesgo editorial tiene. Puede requerir validar con alguien del área.
4. **¿Hay intención de que sea sostenible** (tráfico, algún modelo) o es explícitamente un
   proyecto propio sin expectativa de retorno? La respuesta cambia cuánto invertir en SEO
   y en mantenimiento.

---

## 11. Licencia

Proyecto de código abierto, con licencias distintas para el código y para el contenido:

| | Licencia |
|---|---|
| Código fuente | [MIT](LICENSE) |
| Textos, explicaciones y paneles regionales | [CC BY 4.0](LICENSE-CONTENT) |
| Datos de índices ENSO (NOAA CPC) | Dominio público |
| Tiles de anomalía de TSM (NASA GIBS) | Dominio público |

Se separan a propósito: una licencia de software aplicada a prosa editorial es
jurídicamente ambigua, y el contenido en castellano —no el código— es la parte
no-commodity de este proyecto (§5.2).

Si reutilizás el contenido, sostené la regla del §8.2: **nunca pronóstico
propio**, siempre fuente, fecha y enlace.

---

## Contexto: de dónde salió esto

Surgió mientras se analizaba agregar alertas meteorológicas al Riccitelli Live Dashboard
(ver `Plans/meteorological-alerts-and-alert-pruning-plan.md` en ese repo). Son **dos
proyectos distintos** y conviene no mezclarlos:

|  | Dashboard `/clima` | Este proyecto |
|---|---|---|
| Audiencia | operación interna (tras SSO) | público general hispanohablante |
| Alcance | Cuenca del Plata, operativo | Sudamérica, informativo |
| Pregunta | "¿salgo a navegar el miércoles?" | "¿qué es esto y cómo me afecta?" |
| Tamaño | días | semanas |

Comparten algo de código de fetching y nada más. Repos separados.
