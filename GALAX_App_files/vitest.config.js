import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'src/**/*.{test,spec}.{js,ts}', 
      'server/**/*.{test,spec}.{js,ts}', 
      'client/**/*.{test,spec}.{js,ts}'
    ],
    exclude: ['server/stablecoin/tests/**/*'],
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/setup.ts',
        'dist/',
        'coverage/',
        '**/*.d.ts'
      ]
    }
  }
})