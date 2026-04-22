import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cross-Origin Isolation is required for SharedArrayBuffer (used by ffmpeg.wasm)
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cross-origin-isolation',
      configureServer(server) {
        server.middlewares.use((_, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          next()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use((_, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          next()
        })
      }
    }
  ],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  build: {
    target: 'esnext'
  }
})
