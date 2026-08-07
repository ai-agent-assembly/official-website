// Flat ESLint config for the official website (Docusaurus + TS + React).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'build/',
      '.docusaurus/',
      'node_modules/',
      'design/',
      // Screenshot evidence, same as design/ — no lintable source, and
      // walking it cost eslint ~90s of wall time once AAASM-5585's captures
      // landed (2.3s CPU against 91s wall: filesystem, not analysis).
      'verify/',
      '*.config.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Node-runtime scripts under `scripts/` are executed via `node <file>` and
    // legitimately use `console` and `process`. Declare these as globals for
    // that file scope so `no-undef` stays accurate for browser-scoped source
    // while still linting the script's code paths.
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {react, 'react-hooks': reactHooks},
    languageOptions: {
      parserOptions: {ecmaFeatures: {jsx: true}},
    },
    settings: {react: {version: 'detect'}},
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  prettier,
);
