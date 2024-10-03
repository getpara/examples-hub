const reactPlugin = require('eslint-plugin-react');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierConfig = require('eslint-config-prettier');
const eslintCommentsPlugin = require('eslint-plugin-eslint-comments');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const jestPlugin = require('eslint-plugin-jest');
const compat = require('@eslint/compat');
const reactQuery = require('@tanstack/eslint-plugin-query');
const reactHooks = require('eslint-plugin-react-hooks');
const stencilPlugin = require('@stencil-community/eslint-plugin');
const storybookPlugin = require('eslint-plugin-storybook');

const mergePrettierRules = rules => {
  const prettierRules = prettierConfig.rules || {};
  Object.keys(prettierRules).forEach(key => {
    rules[key] = prettierRules[key];
  });
  return rules;
};

module.exports = [
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
      'examples/react-native-example/metro.config.js',
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
    rules: mergePrettierRules({
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
    name: 'React Native Base Rules',
    files: ['packages/react-native-sdk/**/*.{js,jsx,ts,tsx}', 'examples/react-native-example/**/*.{js,jsx,ts,tsx}'],
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.yarn/**',
      'examples/react-native-example/metro.config.js',
    ],
    languageOptions: {
      ecmaVersion: 2015,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      'eslint-comments': eslintCommentsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jest': jestPlugin,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unused-state': 'error',
      'react/jsx-no-bind': [
        'error',
        {
          allowArrowFunctions: true,
          allowFunctions: false,
          allowBind: false,
        },
      ],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-shadow': 'error',
      'func-call-spacing': ['error', 'never'],
    },
  },
  {
    name: 'React Native TypeScript Rules',
    files: ['packages/react-native-sdk/**/*.{ts,tsx}', 'examples/react-native-example/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-shadow': ['error'],
      'no-shadow': 'off',
      '@typescript-eslint/func-call-spacing': ['error', 'never'],
      'func-call-spacing': 'off',
      'no-undef': 'off',
    },
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
    rules: mergePrettierRules({
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
    name: 'Override for core components directory',
    files: ['packages/core-components/**/*.ts', 'packages/core-components/**/*.tsx'],
    ignores: ['**/dist/**', '**/loader/**', '**/www/**', '**/stencil.config.ts'],
    plugins: {
      '@stencil-community': stencilPlugin,
      'storybook': storybookPlugin,
      '@typescript-eslint': tsPlugin,
    },
    rules: {
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
    },
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
  {
    name: 'No max-len in assets directory',
    files: ['**/assets/**', '**/assets/**/*.*'],
    ignores: ['**/dist/types/assets/**', '**/dist/types/assets/**/*.*'],
    rules: {
      'max-len': 'off',
    },
  },
  {
    name: 'Override for examples directory',
    files: ['examples/**', 'examples/**/*.*'],
    rules: {
      'no-console': 'off',
    },
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
