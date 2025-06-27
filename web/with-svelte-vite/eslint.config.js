import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import sveltePlugin from 'eslint-plugin-svelte'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.svelte-kit'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...sveltePlugin.configs['flat/recommended'],
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
)