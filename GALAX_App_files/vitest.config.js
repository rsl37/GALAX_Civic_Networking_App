import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,ts}', 
      'server/**/*.{test,spec}.{js,ts}', 
      'client/**/*.{test,spec}.{js,ts}'
    ],
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