import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /api requests to Vercel dev server during local development
    // When using `vercel dev`, this is handled automatically.
    // When using `vite` directly, you'll need `vercel dev` running separately.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
