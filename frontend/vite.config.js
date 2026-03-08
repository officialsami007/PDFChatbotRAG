import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    // Don't treat warnings as errors — show full output instead
    rollupOptions: {
      onwarn(warning, warn) {
        // Always print the warning with full details
        console.warn('ROLLUP WARNING:', warning.message, warning.id || '')
        warn(warning)
      }
    }
  }
})