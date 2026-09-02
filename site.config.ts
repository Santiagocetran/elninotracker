/**
 * Identidad del sitio. Un solo lugar.
 *
 * El nombre contiene "El Niño" por decisión explícita, en contra de README §4.
 * Costo asumido: cuando el ENSO pase a fase fría, el nombre va a contradecir a
 * su propia portada. Está centralizado acá justamente para que revertirlo sea
 * una línea y no una refactorización.
 */
export const site = {
  nombre: 'El Niño Tracker',
  dominio: 'elninotracker.vercel.app',
  url: 'https://elninotracker.vercel.app',
  descripcion:
    'El estado actual de El Niño y La Niña, en castellano, y qué significa para Sudamérica.',
  idiomas: ['es', 'pt-BR'] as const,
  idiomaPorDefecto: 'es',
} as const
