import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  esbuild: {
    loader: 'tsx',
    include: /\.(tsx?|jsx?)$/,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/**',
        'out/**',
        '.next/**',
        'coverage/**',
        'setupTests.ts',
        '**/*.config.js',
        '**/*.config.ts',
        'next.config.js',
        'next-env.d.ts',
        '**/chains.ts'
      ],
      thresholds: {
        statements: 11.08,
        branches: 37.5,
        functions: 28.10,
        lines: 11.08,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/clients': path.resolve(__dirname, './src/clients'),
      '@/data': path.resolve(__dirname, './src/data'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/views': path.resolve(__dirname, './src/views')
    }
  }
})
