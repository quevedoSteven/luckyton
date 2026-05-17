import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://luckyton-production.up.railway.app',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://luckyton-production.up.railway.app',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
