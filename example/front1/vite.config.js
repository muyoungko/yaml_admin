import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 6900,
    proxy: {
      '/hello': 'http://localhost:6911',
      '/sample1.yml': 'http://localhost:6911',
      // Add your API endpoints here as needed, e.g. '/api': 'http://localhost:6911'
    }
  },
})
