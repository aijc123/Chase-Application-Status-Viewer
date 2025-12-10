import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react() as any],
  base: './', // Ensures assets load correctly in Chrome Extension and GitHub Pages
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})