import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    // Show full Rollup warnings
    rollupOptions: {
      onwarn(warning, warn) {
        console.warn('ROLLUP WARNING:', warning.message, warning.id || '')
        warn(warning)
      }
    }
  }
})