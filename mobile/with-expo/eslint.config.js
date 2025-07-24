import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'build', '.next', 'out', 'node_modules', 'android', 'ios', '.expo', '*.config.js'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': ['warn', {
        ignoreRestArgs: true,
        fixToUnknown: true
      }],
      '@typescript-eslint/no-require-imports': 'off',
      
      // JavaScript rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug'] }],
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'multi-line']
    }
  },
  {
    // Config files (CommonJS)
    files: ['*.config.js', '*.config.mjs', 'app.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly'
      }
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  {
    // JavaScript files
    files: ['**/*.{js,jsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
)