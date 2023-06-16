import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/use-view-transitions/',
  build: {
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
    }
  }
})
