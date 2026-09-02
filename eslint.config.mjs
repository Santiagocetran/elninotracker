import js from '@eslint/js'
import babelParser from '@babel/eslint-parser'
import react from 'eslint-plugin-react'
import globals from 'globals'

/**
 * ESLint plano (Plan 02 D1).
 *
 * Una sola cosa la hace obligatoria: **ninguna cadena de interfaz hardcodeada en
 * JSX.** El chrome vive en `lib/diccionarios/<idioma>.ts` y esta regla lo fuerza
 * — un literal en JSX rompe la CI.
 *
 * No usa `typescript-eslint`: la 8.x rechaza TypeScript 7.0 en tiempo de import
 * (ver issue typescript-eslint/typescript-eslint#10940). El parser de Babel lee
 * TSX sin depender del compilador de TS; para esta regla no hace falta análisis
 * de tipos.
 */

const parserTsx = {
  parser: babelParser,
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      babelrc: false,
      configFile: false,
      presets: [
        '@babel/preset-typescript',
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    },
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
  },
}

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'eslint.config.mjs',
      'data/**',
    ],
  },

  // Config y scripts sueltos en JS: reglas base, nada de React.
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },

  // Todo el código TS/TSX del proyecto: parseo con Babel.
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ...parserTsx,
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // Sólo lo que se renderiza: la regla de literales.
  {
    files: ['app/**/*.tsx', 'components/**/*.tsx'],
    plugins: { react },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/jsx-no-literals': [
        'error',
        {
          noStrings: true,
          // Símbolos de puntuación que no son prosa traducible. Todo lo demás
          // —cualquier palabra— pasa por el diccionario.
          allowedStrings: ['·', '—', '→', '· ', ' · '],
          ignoreProps: true,
          noAttributeStrings: false,
        },
      ],
    },
  },
]
