const reactPlugin = require('eslint-plugin-react');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');
const compat = require('@eslint/compat');
const reactQuery = require('@tanstack/eslint-plugin-query');
const reactHooks = require('eslint-plugin-react-hooks');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    name: 'Ensure all JavaScript imports have a .js extension',
    plugins: {
      import: importPlugin,
    },
    files: ['packages/**/src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'always',
          ts: 'never',
          tsx: 'never',
        },
      ],
    },
  },
  {
    name: 'Base JavaScript and JSX Rules',
    files: ['**/*.js', '**/*.jsx'],
    ignores: [
      '**/*.min.js',
      '**/mpcWorker-bundle.js',
      '**/mpcWorkerServer-bundle.js',
      '**/wasm_exec.js',
      '**/dist/**',
      '**/build/**',
      '**/fixExtensions.js',
      '**/appendLoaderExports.ts',
    ],
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
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
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
    ignores: ['**/dist/**', '**/build/**', '**/stencil-generated/**'],
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
      'react': reactPlugin,
      'prettier': require('eslint-plugin-prettier'),
    },
    rules: Object.assign({}, prettierConfig.rules, {
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
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
    ignores: ['**/dist/types/assets/**', '**/dist/types/assets/**/*.*'],
    rules: {
      'max-len': 'off',
    },
  },
  {
    name: 'Override for core components directory',
    files: ['packages/core-components/**/*.ts', 'packages/core-components/**/*.tsx'],
    ignores: ['**/dist/**', '**/loader/**', '**/www/**', '**/stencil.config.ts'],
    plugins: {
      '@stencil-community': require('@stencil-community/eslint-plugin'),
      'storybook': require('storybook'),
      '@typescript-eslint': tsPlugin,
    },
    rules: Object.assign({}, prettierConfig.rules, {
      '@stencil-community/required-prefix': ['error', ['cpsl']],
      '@stencil-community/ban-default-true': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          varsIgnorePattern: '(^_|h)',
        },
      ],
    }),
  },
  {
    name: 'Override for developer portal',
    files: ['sites/developer-portal/**/*.ts', 'sites/developer-portal/**/*.tsx'],
    ignores: ['**/dist/**'],

    plugins: {
      '@tanstack/query': reactQuery,
      'react-hooks': compat.fixupPluginRules(reactHooks),
    },
    rules: Object.assign({}, reactHooks.configs.recommended.rules, reactQuery.configs.recommended.rules),
  },
];
