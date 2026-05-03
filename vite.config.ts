import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react() as any],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/test/**/*.test.ts', 'src/test/**/*.test.tsx'],
    exclude: ['.claude/**', 'dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      include: ['App.tsx', 'components/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}', '*.ts'],
      exclude: [
        'src/test/**',
        '**/*.d.ts',
        'dist/**',
        'node_modules/**',
        '.claude/**',
        'coverage/**',
        'vite.config.ts',
      ],
    },
  },
})
