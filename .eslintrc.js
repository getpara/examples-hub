const reactPlugin = require('eslint-plugin-react');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    name: 'Base JavaScript and JSX Rules',
    files: ['**/*.js', '**/*.jsx'],
    ignores: ['**/*.min.js', '**/mpcWorker-bundle.js', '**/wasm_exec.js', '**/dist/**', '**/build/**'],
    languageOptions: {
      ecmaVersion: 2015,
      sourceType: 'module',
      globals: {
        document: 'readonly',
        window: 'readonly',
        process: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      prettier: require('eslint-plugin-prettier'),
    },
    rules: Object.assign({}, prettierConfig.rules, {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-debugger': 'error',
      'no-trailing-spaces': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'eol-last': ['error', 'always'],
      'prettier/prettier': 'error',
    }),
  },
  {
    name: 'TypeScript Specific Rules',
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/dist/**', '**/build/**'],
    languageOptions: {
      ecmaVersion: 2015,
      sourceType: 'module',
      parser: tsParser,
      globals: {
        document: 'readonly',
        window: 'readonly',
        process: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      prettier: require('eslint-plugin-prettier'),
    },
    rules: Object.assign({}, prettierConfig.rules, {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      'no-debugger': 'error',
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'prettier/prettier': 'error',
    }),
  },
  {
    name: 'Override for examples directory',
    files: ['examples/**', 'examples/**/*.*'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    name: 'No max-len in assets directory',
    files: ['**/assets/**', '**/assets/**/*.*'],
    rules: {
      'max-len': 'off',
    },
  },
];
