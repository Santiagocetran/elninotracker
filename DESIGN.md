# DESIGN.md

Guía de criterio visual y editorial para el rastreador ENSO. Escrita para humanos y para
agentes que generan UI.

Este archivo es **una de tres capas**. No mezclarlas:

| Capa | Qué vive acá | Archivo |
|---|---|---|
| **Criterio** (este archivo) | Juicio en prosa: jerarquía, encuadre, tono, anti-patrones | `DESIGN.md` |
| **Mecánica** | Tokens y clases reutilizables. El agente compone con ellas, no inventa | `app/tracker.css` |
| **Checks** | Lo verificable por máquina | `scripts/check-design.ts` |

Cuando aparezca un error: si es de juicio, va a la prosa de acá. Si es mecánica repetida, va al
CSS. Si se puede verificar automáticamente, va a un check. **Nunca a las tres.**

---

## 1. Qué es esto, visualmente

**Un instrumento editorial en oscuro.**

Dos mitades que no se negocian:

- **Editorial**: alguien llega de Google, en el celular, buscando "el niño". No sabe qué es
  Niño 3.4. Se va en 40 segundos. La página tiene que responderle antes de eso.
- **Instrumento**: los números se ven medidos, no ilustrados. Ejes finos, cifras monoespaciadas,
  cero decoración. Un meteorólogo tiene que poder mirarlo sin incomodarse.

La tensión entre las dos es el producto. Si sólo es editorial, es una nota de diario. Si sólo es
instrumento, es CIIFEN — que ya existe y nadie usa.

**Referencia de densidad:** la portada es una página, no un tablero. La sala de control existe,
pero vive en `/datos` (**diferida a v2** — ver Plan 02 D0.4) y se entra a propósito.

---

## 2. Color

### Ground

```
--bg          #0A0B0D   fondo
--surface     #121417   paneles, cards
--surface-2   #17191D   hover, filas alternas
--line        #1E2126   bordes, grillas de gráfico
--ink         #E8E8E6   texto primario
--ink-2       #9A9C9F   secundario, etiquetas
--ink-3       #6B6E72   terciario, ejes, notas al pie
```

### El acento lo define la fase

**Un solo acento activo por vez, y lo dicta el fenómeno, no el diseñador.** El sitio cambia de
color con el ENSO. Esto es la decisión §4 del README hecha visible: no es un sitio sobre El Niño,
es un sitio sobre las dos fases.

```
El Niño    --accent  #F4703A   ámbar cálido
La Niña    --accent  #43B0C4   cian frío
Neutral    --accent  #7D8A99   pizarra desaturada
```

Todo lo demás del sitio es gris. El acento se usa para: el número grande, el estado de fase, la
línea activa de una serie, y nada más. **Si hay más de un color saturado en pantalla, algo está mal.**

### Intensidad = luminosidad, no matiz

Débil / moderado / fuerte / muy fuerte se expresan como pasos del mismo acento. Nunca cambiando
de color. Un usuario tiene que poder leer la intensidad sin leyenda.

### Escala divergente de datos

Para series y cualquier mapa propio: 7 pasos, frío → neutro → cálido, perceptualmente uniforme.

```
#2E6E8E  #4E96AE  #8FBFCC  #2A2D31  #D9A273  #E07A45  #C2452A
   -3       -2       -1        0        +1       +2      +3
```

El cero es ground, no blanco. **Prohibido el arcoíris** (ver anti-patrón A2).

---

## 3. Tipografía

Dos familias. **No hay sans.**

- **Literata** (TypeTogether) — todo lo que escribimos nosotros.
- **IBM Plex Mono** (IBM) — todo valor medido.

La división es **semántica, no decorativa**:

> Si está en mono, es un dato y tiene fuente y fecha.
> Si está en serif, lo escribimos nosotros y nos hacemos cargo.

El lector aprende la regla sin que se la expliquen. Las etiquetas de interfaz (`NIÑO 3.4`,
`FUENTE:`, `26 AGO 2026`) son mono en versalitas, porque son metadato de medición, no prosa.

### Escala

```
display    IBM Plex Mono 500   clamp(4.5rem, 15vw, 8.5rem)  tracking -0.03em
h1         Literata      600   2.75rem   tracking -0.015em
h2         Literata      600   1.6rem
cuerpo     Literata      400   1.125rem  line-height 1.65   max-width 66ch
dato       IBM Plex Mono 500   variable  tabular-nums
etiqueta   IBM Plex Mono 500   0.8125rem uppercase  letter-spacing 0.09em   --ink-2
eje        IBM Plex Mono 400   0.8125rem                                    --ink-3
```

### Reglas

**El número de portada es mono, no serif.** Es un valor medido: le toca la familia del dato. Un
titular serif gigante lo convertiría en afirmación nuestra — que es exactamente A3.

**`font-variant-numeric: tabular-nums` en toda cifra.** Sin excepción: los números que cambian a
diario no pueden bailar entre actualizaciones.

**Compensación óptica en oscuro.** Sobre `#0A0B0D` el texto se ve más fino de lo que es. Por eso:
cuerpo nunca por debajo de 1.125rem, y **jamás pesos 300 o menores**. Es la razón concreta por la
que Instrument Serif quedó descartada en la evaluación: un solo peso, alto contraste, y el cuerpo
se desintegra sobre negro. Cualquier candidata futura se prueba **renderizada sobre el fondo real**,
no sobre blanco.

**Nunca falsa itálica ni falsa negrita.** Literata tiene itálica real y eje de peso variable.

### Implementación

`next/font/google`, ambas variables, subset `latin` — verificado que cubre español y portugués
completos (ñ ã õ ç â ê ô à ¿ ¡). No hace falta `latin-ext`.

```ts
import { Literata, IBM_Plex_Mono } from 'next/font/google'
```

## 4. Encuadre de página

### Portada `/`

Orden fijo, de arriba a abajo. Cada bloque responde una pregunta y sólo una:

1. **El estado** — fase + intensidad + el número enorme + fecha. Sin scroll, en móvil.
2. **La frase** — una oración en castellano llano que traduce el número. Máximo 2 líneas.
3. **Qué significa para mí** — entrada a los paneles regionales. Es el diferencial: va arriba del mapa.
4. **El mapa** — anomalía de TSM, encuadrado y citado.
5. **El histórico** — 1950 → hoy, con los eventos nombrados marcados.
6. **Fuentes** — tabla con qué se actualizó, cuándo, y link.

El mapa **nunca** va primero. Es lindo y no informa; ver anti-patrón A7.

### `/datos` (diferida a v2 — Plan 02 D0.4)

Acá sí: multipanel, denso, todos los índices, las cuatro regiones Niño, SOI, plume de IRI. Es la
sala de máquinas. Se asume que quien entra sabe lo que busca.

---

## 5. Cómo se escribe

- **Castellano rioplatense llano.** "El Pacífico está mucho más caliente que lo normal", no "se
  registra una anomalía positiva de magnitud significativa".
- **Probabilidad, fecha y link. Siempre los tres.** "69 % de probabilidad de superar +2,5 °C en
  OND 2026 — NOAA CPC, 13 ago 2026 →".
- **Nunca extrapolar.** Decimos lo que dicen las fuentes oficiales. No pronosticamos.
- **Nunca titular como diario.** Ver anti-patrón A3.
- **La incertidumbre se muestra, no se esconde.** Un rango o una probabilidad da más confianza que
  un número solo, no menos.
- **Arquitectura localizada desde el día uno; traducción pt-BR diferida.** Nada de
  texto hardcodeado, ni siquiera en un placeholder: rutas, diccionarios y esquema
  soportan pt-BR desde v1. Pero `/pt` devuelve 404 hasta que exista traducción
  real — servir castellano bajo bandera portuguesa es peor que no ofrecerlo
  (Plan 02 D1).

---

## 6. Componentes

Cada uno existe como clase en `tracker.css`. Componer con ellas.

- **`.stat`** — el número medido. **Firma obligatoria: valor + índice + fecha + fuente.** No existe
  un `.stat` sin las cuatro. El tipo de TypeScript lo fuerza; ver §8.
- **`.serie`** — línea temporal. Grilla `--line`, ejes `--ink-3`, una sola línea en `--accent`.
  Renderizada en servidor como SVG cuando no necesita interacción.
- **`.mapa`** — contenedor del raster GIBS. Marco propio, atribución NASA visible, fecha del tile.
- **`.region`** — panel de impacto regional. Nombre del lugar, qué implica, con qué probabilidad,
  según quién.
- **`.fuente`** — el par fecha + link. Aparece pegado a todo dato, nunca agrupado al pie y olvidado.

### 6.1 · El motor — la única animación que se justifica

Un **corte transversal del Pacífico ecuatorial**, de Indonesia a Perú, que alterna entre dos
estados: normal y El Niño. Muestra las tres cosas que son el fenómeno y que no se ven en un mapa:

1. Los **alisios** soplando de este a oeste, y debilitándose.
2. La **pileta de agua cálida** acumulada al oeste, derramándose hacia el este.
3. La **termoclina** aplanándose — y con ella el fin del afloramiento frente a Perú.

Reglas para que sea explicación y no espectáculo:

- **SVG, no WebGL.** Es un esquema, no un render. Liviano, indexable, accesible, funciona sin JS.
- **Dos estados, no un loop continuo.** El usuario controla la transición, o se dispara al entrar
  en viewport y para. Nada que se mueva para siempre en el fondo.
- **Esquemático y declarado como tal.** No es dato en vivo: es un diagrama. Lleva etiqueta que lo
  aclare, y por lo tanto no lleva `.fuente` de dato — lleva referencia bibliográfica.
- **Tres etiquetas, no quince.** Si necesita leyenda, falló.
- **`prefers-reduced-motion` sirve el estado final estático.**

Esto cubre el viento sin caer en A7. La versión en vivo del viento, si alguna vez entra, es un
índice —el SOI, que es presión atmosférica y ya está en la ingesta— no un campo animado.

---

## 7. Anti-patrones

Nombrados para poder reconocerlos y rechazarlos en review.

**A1 · El tablero de aeropuerto.** Doce paneles al mismo peso visual. Sin jerarquía no hay lectura:
el ojo rebota y se va. Cada pantalla tiene un solo elemento dominante.

**A2 · El arcoíris.** Escalas de color arcoíris para datos cuantitativos. Inventan bordes que no
existen y son ilegibles con daltonismo. Los tiles de GIBS vienen así y **no se pueden restilar** —
por eso se encuadran como imagen satelital citada, con marco propio, y su paleta nunca se usa como
color de marca ni se replica en otro gráfico.

**A3 · El titular de diario.** "El Súper Niño que golpeará el Litoral". Destruye en una línea la
única ventaja del sitio. Los diarios ya hacen eso y por eso existe este proyecto.

**A4 · El número desnudo.** "+2.6" sin índice, sin fecha, sin fuente. Un dato sin procedencia no es
un dato, es una afirmación.

**A5 · La mezcla de índices.** Presentar el weekly de Niño 3.4 (+2,6) como si actualizara al ONI
(+1,39). Son cosas distintas: el ONI es media móvil de 3 meses, el weekly es instantáneo y siempre
más extremo. Toda cifra lleva su índice pegado.

**A6 · El glow.** Biseles, sombras neón, marcos HUD, gradientes decorativos. Chrome que no dice
nada, envejece en 18 meses y contradice el registro instrumental.

**A7 · El globo hipnótico.** Un globo 3D con partículas de viento en vivo, como ambiente. No es
que la animación esté prohibida: está prohibida la animación que no explica. Un globo es una
superficie, y la historia del ENSO pasa **en profundidad** — la termoclina inclinándose. El globo
muestra que algo se mueve; no muestra por qué el océano se calienta. Ver §6.1 para la forma que sí
sirve.

**A8 · La precisión falsa.** "+2,6134 °C". Los decimales que la fuente no garantiza son mentira
tipográfica. Una decimal para anomalías, cero para probabilidades.

**A9 · El semáforo.** Verde/rojo como codificación. Falla con daltonismo y además en clima "rojo =
malo" no siempre aplica: El Niño trae sequía en el altiplano y lluvia en la costa peruana al mismo
tiempo. La escala es frío/cálido, no bueno/malo.

**A10 · La certeza sin probabilidad.** "Va a haber crecidas en el Litoral". Siempre "más probable
que lo normal", con el número y la fuente.

---

## 8. Checks determinísticos

En `scripts/check-design.ts`, corriendo en CI:

1. **Firma de dato.** El tipo `Dato = { valor, indice, fecha, fuente }` es obligatorio para
   renderizar cualquier cifra; `fuente` es `{ nombre, url }`. Sin fuente no compila. (A4)
2. **Frescura.** El build falla si la última observación de una serie es más vieja que su cadencia
   esperada. HTTP 200 no significa dato fresco — `wksst8110.for` devolvía 200 con datos de 2021.
3. **Sin colores literales.** Ningún hex fuera de `tracker.css`. Todo por token. (A6, A9)
4. **Contraste AA** en todo par texto/fondo, verificado sobre los tokens.
5. **`tabular-nums`** presente en toda clase que renderice cifras.
6. **Atribución del mapa** presente cuando hay un tile de GIBS en el DOM.
7. **Sin strings hardcodeados** en JSX: todo texto pasa por i18n.
8. **Decimales** dentro de lo declarado por índice. (A8)

---

## 9. Cómo evoluciona

Igual que en Vercel: la frecuencia de la queja valida el arreglo. Cuando algo se rompe seguido, se
codifica en la capa que corresponde — y ese conteo tiene que empezar a bajar. Si no baja, el
arreglo está mal puesto de capa.
