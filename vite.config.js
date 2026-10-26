import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The only chunk over Vite's 500 kB default is @pdf-lib/fontkit (~711 kB): a single prebuilt file that
    // cannot be split, already loaded on demand (lib/pdf.js imports it only when a PDF is made). Every
    // chunk loaded up front stays far below this (the entry is ~300 kB), so the limit still catches regressions there.
    chunkSizeWarningLimit: 750,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
