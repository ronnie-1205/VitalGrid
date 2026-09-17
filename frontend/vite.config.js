import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "127.0.0.1",
    // GAP(backend): if your backend runs on e.g. localhost:8000, uncomment
    // this proxy so `fetch('/api/...')` in the app reaches it without CORS pain.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
    },
  },
})
