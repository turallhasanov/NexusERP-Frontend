import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Fixed port: the Khazar storefront owns 5173. Without this, whichever starts first takes 5173 and the browser's
  // per-origin favicon cache shows the other project's icon. NexusERP.Api CORS allows 5174.
  server: { port: 5174, strictPort: true },
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
