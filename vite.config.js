import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '.manusvm.computer',
      '5000-i9uichif0j8nuqbe0ck2m-00fc2b46.manusvm.computer',
      '5003-i9uichif0j8nuqbe0ck2m-00fc2b46.manusvm.computer'
    ],
    hmr: {
      port: 5000,
      host: '0.0.0.0'
    }
  }
})
